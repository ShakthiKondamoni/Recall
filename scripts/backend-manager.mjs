import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
export async function startBackend({executable=process.execPath,entry,env={},timeout=15000,electron=false}){
 const token=randomBytes(32).toString('hex');
 const child=spawn(executable,[entry],{env:{...process.env,...env,RECALL_RUNTIME_TOKEN:token,...(electron?{ELECTRON_RUN_AS_NODE:'1'}:{})},stdio:['ignore','pipe','pipe','ipc'],windowsHide:true});
 child.stdout.on('data',data=>process.stdout.write(data));child.stderr.on('data',data=>process.stderr.write(data));
 let intentional=false;const listeners=new Set();child.on('exit',code=>{if(!intentional)for(const listener of listeners)listener(code);});
 const stop=async()=>{intentional=true;if(child.exitCode!==null||child.signalCode!==null)return;await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{child.kill();reject(new Error('Backend did not shut down within 7 seconds; termination requested.'));},7000);child.once('exit',()=>{clearTimeout(timer);resolve();});if(child.connected)child.send({type:'shutdown'});else child.kill();});};
 try {
  const port=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Backend startup timed out. Check database permissions and port availability.')),timeout);const fail=error=>{clearTimeout(timer);reject(error);};child.once('error',fail);child.once('exit',code=>fail(new Error('Backend exited before readiness: '+code)));child.on('message',message=>{if(message&&message.type==='ready'&&Number.isInteger(message.port)&&message.port>0&&message.port<65536){clearTimeout(timer);resolve(message.port);}});});
  const baseUrl='http://127.0.0.1:'+port;
  const response=await fetch(baseUrl+'/api/ready',{headers:{authorization:'Bearer '+token},signal:AbortSignal.timeout(timeout)});if(!response.ok)throw new Error('Backend dependency readiness failed: HTTP '+response.status);
  return {baseUrl,token,pid:child.pid,stop,onUnexpectedExit:listener=>{listeners.add(listener);return ()=>listeners.delete(listener);}};
 } catch(error){try{await stop();}catch(cleanup){console.error(cleanup.message);}throw error;}
}
