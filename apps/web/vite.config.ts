import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
export default defineConfig(({command})=>{
 const port=Number(process.env.WEB_PORT??5173);if(!Number.isInteger(port)||port<1||port>65535)throw new Error('WEB_PORT must be between 1 and 65535');
 return {root:fileURLToPath(new URL('.',import.meta.url)),base:'./',plugins:[react(),tailwind(),{
  name:'local-request-boundary',
  transformIndexHtml(html){return command==='serve'?html.replace("script-src 'self'","script-src 'self' 'unsafe-inline'"):html;},
  configureServer(server){server.middlewares.use((req,res,next)=>{const host=req.headers.host;const origin=req.headers.origin;const allowed=['localhost:'+port,'127.0.0.1:'+port];if(!host||!allowed.includes(host)||(origin&&!allowed.some(h=>origin==='http://'+h))){res.statusCode=403;res.end('Untrusted local application origin');return;}next();});},
 }],server:{host:'127.0.0.1',port,strictPort:true,proxy:process.env.RECALL_API_URL?{'/api':{target:process.env.RECALL_API_URL,changeOrigin:true,configure(proxy){proxy.on('proxyReq',request=>{request.removeHeader('origin');request.setHeader('authorization','Bearer '+process.env.RECALL_RUNTIME_TOKEN);});}}}:{}},build:{outDir:'dist',emptyOutDir:true}};
});
