import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { createRuntime } from './lib/runtime.ts';
import './styles/theme.css';
const root=document.getElementById('root');if(!root)throw new Error('Missing application root');
createRuntime().then(runtime=>createRoot(root).render(<StrictMode><App runtime={runtime}/></StrictMode>)).catch(()=>{root.textContent='Recall could not initialize its runtime. Close and restart the application.';});
