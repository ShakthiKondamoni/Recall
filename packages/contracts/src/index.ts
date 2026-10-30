import { z } from 'zod';
export const themes = ['paper','operator','glass','graphite','soft','dusk'] as const;
export const themeSchema = z.enum(themes);
export type Theme = z.infer<typeof themeSchema>;
export const apiPathSchema = z.enum(['/api/health','/api/ready','/api/app/info']);
export type ApiPath = z.infer<typeof apiPathSchema>;
export const infoSchema = z.object({name:z.string(),version:z.string(),environment:z.string(),deploymentMode:z.literal('local'),capabilities:z.object({settings:z.literal(true),learning:z.literal(false),ai:z.literal(false),cloud:z.literal(false)})});
export type AppInfo = z.infer<typeof infoSchema>;
export interface RuntimeInfo { platform:'web'|'desktop'; appVersion:string; apiBaseUrl:string; capabilities:{desktopShell:boolean;localFileAccess:false} }
export interface DesktopBridge { runtime:()=>Promise<RuntimeInfo>; read:(path:ApiPath)=>Promise<unknown> }
export interface Runtime { info:RuntimeInfo; read:(path:ApiPath,signal?:AbortSignal)=>Promise<unknown> }
export type ErrorCode = 'VALIDATION_ERROR'|'NOT_FOUND'|'UNAUTHORIZED'|'FORBIDDEN'|'INTERNAL_ERROR'|'DEPENDENCY_UNAVAILABLE';
export interface ErrorResponse { error:{code:ErrorCode;message:string;requestId:string} }
export interface OwnerScope { userId:string }
export type AiTask = 'ocr'|'vision'|'cleanup'|'embeddings'|'study-material'|'question-generation'|'question-validation'|'tutor'|'research';
export interface ModelDescriptor { providerId:string; modelId:string; contextTokens?:number; capabilities:{vision:boolean;embeddings:boolean;streaming:boolean;tools:boolean} }
export interface AiProviderBoundary { id:string; discoverModels(signal?:AbortSignal):Promise<readonly ModelDescriptor[]> }
