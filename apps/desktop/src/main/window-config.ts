export interface RecallWindowOptions {
  width:number;
  height:number;
  minWidth:number;
  minHeight:number;
  show:boolean;
  backgroundColor:string;
  title:string;
  autoHideMenuBar:boolean;
  webPreferences:{
    contextIsolation:true;
    nodeIntegration:false;
    sandbox:true;
    preload:string;
    webSecurity:true;
  };
}

export function createMainWindowOptions(preload:string):RecallWindowOptions {
  return {
    width:1380,
    height:940,
    minWidth:440,
    minHeight:640,
    show:false,
    backgroundColor:'#f7f6f1',
    title:'Recall',
    autoHideMenuBar:true,
    webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,preload,webSecurity:true},
  };
}
