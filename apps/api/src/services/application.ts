import type { DatabasePort } from '@recall/domain';
import type { Config } from '../config/env.ts';
import { AppError } from '../errors/index.ts';
export class ApplicationService {
 constructor(private config:Config,private database:DatabasePort){}
 health(){return {name:this.config.APP_NAME,status:'ok' as const,version:this.config.APP_VERSION,environment:this.config.NODE_ENV};}
 ready(){try {this.database.check();return {status:'ready' as const,checks:{database:'ok',initialization:'ok'}};}catch{throw new AppError(503,'DEPENDENCY_UNAVAILABLE','The local database is unavailable. Restart Recall or inspect local database permissions.');}}
 info(){return {name:this.config.APP_NAME,version:this.config.APP_VERSION,environment:this.config.NODE_ENV,deploymentMode:this.config.DEPLOYMENT_MODE,capabilities:{settings:true,learning:false,ai:false,cloud:false}};}
}
