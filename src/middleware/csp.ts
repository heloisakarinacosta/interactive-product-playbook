
import { Request, Response, NextFunction } from 'express';

// Lista de domínios bloqueados
const BLOCKED_DOMAINS = ['productfruits.com', 'facebook.com/tr'];

export const cspMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // CSP extremamente permissivo que ainda bloqueia os domínios indesejados
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
    "connect-src * 'self' http://localhost:* https://localhost:* http://127.0.0.1:* https://127.0.0.1:*; " +
    "script-src * 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src * 'self' 'unsafe-inline'; " +
    "img-src * 'self' data: blob:; " +
    "font-src * 'self' data:; " +
    "frame-src * 'self'; " +
    "media-src * 'self'; " +
    "object-src 'none'; " +
    "worker-src * 'self' blob:;"
  );
  
  // Log para debugging
  console.log('CSP middleware applied');
  
  next();
};
