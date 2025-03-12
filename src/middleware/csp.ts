
import { Request, Response, NextFunction } from 'express';

export const cspMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' http://localhost:3001 http://localhost:3001/api https://*.productfruits.com wss://*.productfruits.com https://my.productfruits.com; script-src 'self' 'unsafe-inline' https://cdn.gpteng.co https://*.productfruits.com; style-src 'self' 'unsafe-inline' https://*.productfruits.com; img-src 'self' data: https: blob:; font-src 'self' data:; frame-src 'self' https://*.productfruits.com;"
  );
  next();
};
