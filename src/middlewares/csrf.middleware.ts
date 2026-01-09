import { Request } from 'express';
import { doubleCsrf } from 'csrf-csrf';

// Configuración de protección CSRF: Double Submit Cookie
const csrfProtection = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
  cookieName: '__Host-psifi.x-csrf-token',
  cookieOptions: {
    sameSite: 'strict',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
  size: 64,
  ignoredMethods: process.env.NODE_ENV === 'test' 
    ? ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']
    : ['GET', 'HEAD', 'OPTIONS'],
  getSessionIdentifier: (req: Request) => req.ip || 'anonymous',
});

// Exportar el middleware de protección CSRF
export const csrfProtectionMiddleware = csrfProtection.doubleCsrfProtection;

// Exportar la función para generar tokens CSRF
export const generateCsrfToken = csrfProtection.generateCsrfToken;
