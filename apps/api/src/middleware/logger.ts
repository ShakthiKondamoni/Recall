const ranks={debug:0,info:1,warn:2,error:3};
export type Level=keyof typeof ranks;
export function logger(min:Level='info') {return (level:Level,event:string,context:{requestId?:string;status?:number;method?:string;durationMs?:number;code?:string}={})=>{if(ranks[level]<ranks[min])return;console.log(JSON.stringify({timestamp:new Date().toISOString(),level,service:'recall-api',event,...context}));};}
