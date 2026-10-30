import { createContext,useContext,useState,type ReactNode } from 'react';
import { themeSchema,type Theme,type Runtime } from '@recall/contracts';
const RuntimeContext=createContext<Runtime|null>(null);
export function useRuntime(){const runtime=useContext(RuntimeContext);if(!runtime)throw new Error('Runtime provider is missing');return runtime;}
const ThemeContext=createContext<{theme:Theme;setTheme:(theme:Theme)=>void}|null>(null);
const NoticeContext=createContext<(message:string)=>void>(()=>{});
export function useTheme(){const theme=useContext(ThemeContext);if(!theme)throw new Error('Theme provider is missing');return theme;}
export function useNotice(){return useContext(NoticeContext);}
export function Providers({runtime,children}:{runtime:Runtime;children:ReactNode}){
 const [theme,setValue]=useState<Theme>(()=>themeSchema.catch('paper').parse(document.documentElement.dataset.theme));const [notice,setNotice]=useState('');
 function setTheme(value:Theme){setValue(value);document.documentElement.dataset.theme=value;try{localStorage.setItem('recall.theme',value);setNotice('Appearance saved on this device.');}catch{setNotice('Theme applied. Browser storage is unavailable, so it cannot persist.');}}
 return <RuntimeContext.Provider value={runtime}><ThemeContext.Provider value={{theme,setTheme}}><NoticeContext.Provider value={setNotice}>{children}{notice&&<aside className="notification" role="status"><span>{notice}</span><button aria-label="Dismiss notification" onClick={()=>setNotice('')}>×</button></aside>}</NoticeContext.Provider></ThemeContext.Provider></RuntimeContext.Provider>;
}
