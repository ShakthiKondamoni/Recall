import { mkdir,readFile,writeFile,lstat } from 'node:fs/promises';
import { resolve,dirname,sep } from 'node:path';
import type { ObjectStorage } from '../../packages/domain/src/index.ts';
// Server-owned opaque keys only. No renderer or user-supplied paths are accepted.
export class LocalStorage implements ObjectStorage {
  private root:string;
  constructor(root:string){this.root=resolve(root);}
  private path(key:string){if(!/^[a-zA-Z0-9_-]{1,128}$/.test(key))throw new Error('Invalid object key');const path=resolve(this.root,key);if(!path.startsWith(this.root+sep))throw new Error('Invalid object path');return path;}
  async put(key:string,data:Uint8Array){const path=this.path(key);await mkdir(dirname(path),{recursive:true});try {if((await lstat(path)).isSymbolicLink())throw new Error('Symlinks are not permitted');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}await writeFile(path,data,{flag:'wx',mode:0o600});}
  async get(key:string){const path=this.path(key);try {if((await lstat(path)).isSymbolicLink())throw new Error('Symlinks are not permitted');return await readFile(path);}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return undefined;throw e;}}
}
