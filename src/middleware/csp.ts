
import { Request, Response, NextFunction } from 'express';

export const cspMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set a very permissive CSP that will allow most resources but still block productfruits.com
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src * 'self' http://localhost:* https://localhost:* http://127.0.0.1:* https://127.0.0.1:*; script-src * 'self' 'unsafe-inline' 'unsafe-eval'; style-src * 'self' 'unsafe-inline'; img-src * 'self' data: blob:; font-src * 'self' data:; frame-src * 'self'; media-src * 'self'; object-src 'none'; worker-src * 'self' blob:;"
  );
  next();
};
