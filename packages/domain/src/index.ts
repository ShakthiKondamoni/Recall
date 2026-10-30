export interface SettingsRepository { get(key:string):string|undefined; set(key:string,value:string):void }
export interface DatabasePort { settings:SettingsRepository; check():void; close():void }
// D1 must implement an async repository port when introduced; its runtime API is not SQLite's.
export interface AsyncSettingsRepository { get(key:string):Promise<string|undefined>; set(key:string,value:string):Promise<void> }
export interface ObjectStorage { put(key:string,data:Uint8Array):Promise<void>; get(key:string):Promise<Uint8Array|undefined> }
