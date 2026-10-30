import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { migration } from '../migrations/001-app-settings.ts';
import type { DatabasePort } from '../../packages/domain/src/index.ts';

function readColumn(row:unknown,name:string):unknown {
  if(row===undefined) return undefined;
  if(typeof row!=='object' || row===null) throw new Error('Invalid SQLite result row');
  const value:unknown=Reflect.get(row,name);
  return value;
}
function stringColumn(row:unknown,name:string):string|undefined {
  const value=readColumn(row,name);
  if(value===undefined) return undefined;
  if(typeof value!=='string') throw new Error('Invalid SQLite text column: '+name);
  return value;
}
function integerColumn(row:unknown,name:string):number|bigint|undefined {
  const value=readColumn(row,name);
  if(value===undefined) return undefined;
  if(typeof value==='bigint') return value;
  if(typeof value==='number' && Number.isSafeInteger(value)) return value;
  throw new Error('Invalid SQLite integer column: '+name);
}
export function openDatabase(path:string):DatabasePort {
  if(path !== ':memory:') mkdirSync(dirname(path),{recursive:true});
  const db=new DatabaseSync(path);
  try {
    db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;');
    db.exec('CREATE TABLE IF NOT EXISTS schema_migrations(id TEXT PRIMARY KEY NOT NULL, checksum TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    db.exec('BEGIN IMMEDIATE');
    try {
      const checksum=createHash('sha256').update(migration.sql).digest('hex');
      const existing=db.prepare('SELECT checksum FROM schema_migrations WHERE id=?').get(migration.id);
      if(existing!==undefined){
        const existingChecksum=stringColumn(existing,'checksum');
        if(existingChecksum===undefined) throw new Error('Migration checksum is missing: '+migration.id);
        if(existingChecksum!==checksum) throw new Error('Migration checksum mismatch: '+migration.id);
      } else {db.exec(migration.sql);db.prepare('INSERT INTO schema_migrations(id,checksum) VALUES(?,?)').run(migration.id,checksum);}
      db.exec('COMMIT');
    } catch(error){db.exec('ROLLBACK');throw error;}
    return {
      settings:{
        get(key){const row=db.prepare('SELECT value FROM app_settings WHERE key=?').get(key);return stringColumn(row,'value');},
        set(key,value){
          if(!/^(appearance\.theme|app\.onboarding)$/.test(key)) throw new Error('Unsupported non-secret setting key');
          db.prepare("INSERT INTO app_settings(id,key,value) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')").run(randomUUID(),key,value);
        },
      },
      check(){if(!db.prepare('SELECT 1 FROM schema_migrations WHERE id=?').get(migration.id))throw new Error('Database migration is missing');const foreignKeys=integerColumn(db.prepare('PRAGMA foreign_keys').get(),'foreign_keys');if(foreignKeys!==1 && foreignKeys!==1n)throw new Error('Foreign keys are disabled');db.prepare('SELECT value FROM app_settings LIMIT 1').get();},
      close(){db.close();},
    };
  } catch(error){db.close();throw error;}
}
