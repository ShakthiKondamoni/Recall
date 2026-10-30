import { Component,type ReactNode } from 'react';
import { HashRouter,Routes,Route,Link } from 'react-router-dom';
import type { Runtime } from '@recall/contracts';
import { Providers } from './app/providers/index.tsx';
import { Shell } from './app/layouts/Shell.tsx';
import { Dashboard } from './features/dashboard/Dashboard.tsx';
import { Settings } from './features/settings/Settings.tsx';
class ErrorBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<main className="page"><h1>Something interrupted your workspace.</h1><p>Please reload Recall. Your saved appearance preference will remain on this device.</p><button className="button" onClick={()=>location.reload()}>Reload workspace</button></main>:this.props.children;}}
export function App({runtime}:{runtime:Runtime}){return <ErrorBoundary><Providers runtime={runtime}><HashRouter><Routes><Route element={<Shell/>}><Route index element={<Dashboard/>}/><Route path="settings" element={<Settings/>}/><Route path="*" element={<div className="page"><p className="eyebrow">404 · A MISSING PAGE</p><h1>This page isn’t in your library.</h1><p>Check the address or return to your workspace.</p><Link className="button primary" to="/">Back to Dashboard</Link></div>}/></Route></Routes></HashRouter></Providers></ErrorBoundary>;}
