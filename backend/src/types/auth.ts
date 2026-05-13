export type UserRole = 'admin' | 'viewer';
 
export interface User {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
}
 
/** Shape returned to the frontend — never includes password_hash. */
export interface PublicUser {
  user_id: number;
  username: string;
  email: string;
  role: UserRole;
}
 
export interface Session {
  session_id: string;
  user_id: number;
  expires_at: Date;
  created_at: Date;
}
 

declare module 'express-serve-static-core' {
  interface Request {
    user?: PublicUser;
  }
}