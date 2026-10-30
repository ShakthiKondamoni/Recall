import type { ErrorCode } from '@recall/contracts';
export class AppError extends Error { constructor(public status:400|401|403|404|500|503,public code:ErrorCode,message:string){super(message);} }
