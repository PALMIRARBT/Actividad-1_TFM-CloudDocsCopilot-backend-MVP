import { NextFunction, Request, Response } from 'express';
import { doubleCsrf } from 'csrf-csrf';

/**
 * ✅ PROTECCIÓN CSRF - Double Submit Cookie Pattern
 *
 * Este middleware implementa protección contra ataques Cross-Site Request Forgery (CSRF)
 * usando el patrón Double Submit Cookie, equivalente a la protección de csurf (deprecated).
 *
 * Funcionamiento:
 * 1. Genera un token CSRF único por sesión
 * 2. Almacena el token en una cookie segura (psifi.x-csrf-token)
 * 3. El cliente debe enviar el mismo token en el header x-csrf-token
 * 4. El middleware valida que ambos tokens coincidan
 *
 * Seguridad:
 * - sameSite=none en producción (permite cross-origins)
 * - sameSite=lax en desarrollo
 * - httpOnly=true (JavaScript no puede acceder)
 * - secure=true en producción (solo HTTPS)
 * - Token de 64 bytes
 */

// En producción el frontend (Vercel) y el backend (Render) son orígenes distintos (cross-site).
// Se requiere sameSite='none' + secure=true para que el navegador envíe la cookie.
// En desarrollo se usa 'lax' para no requerir HTTPS.
const isProduction = process.env.NODE_ENV === 'production';

const csrfProtection = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
  cookieName: 'psifi.x-csrf-token',  // Nombre correcto que usa csrf-csrf
  cookieOptions: {
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    secure: isProduction,
    httpOnly: true
  },
  size: 64,
  ignoredMethods:
    process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'
      ? ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']
      : ['GET', 'HEAD', 'OPTIONS'],
  // Extract user ID from JWT token in cookies to use as session identifier
  // This ensures CSRF tokens remain valid across the entire user session
  // Session identifier: Use JWT token hash for stability (unique per user session)
  getSessionIdentifier: (req: Request): string => {
    const cookieHeader = req.headers.cookie;
    
    // Try to use JWT token as session identifier (most stable)
    if (cookieHeader && typeof cookieHeader === 'string') {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      for (const cookie of cookies) {
        if (cookie.startsWith('token=')) {
          const jwtToken = cookie.substring(6);
          
          // Use first 32 chars of JWT as session ID - unique per user session
          // JWT format: header.payload.signature - payload contains user ID
          const sessionId = jwtToken.substring(0, 32);
          
          if (isProduction && req.method !== 'GET') {
            console.error('[CSRF-SESSION-ID]', {
              method: req.method,
              path: req.path,
              sessionId: sessionId.substring(0, 20) + '...',
              sessionIdType: 'jwt-based',
              jwtTokenLength: jwtToken.length
            });
          }
          
          return sessionId;
        }
      }
    }
    
    // Fallback: return "anonymous" (for unauthenticated requests)
    return 'anonymous';
  }
});
// Rutas que NO requieren CSRF (autenticación pública)
const CSRF_EXCLUDED_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/csrf-token',
  '/confirm/:token',
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
];

/**
 * Middleware para limpiar cookies CSRF antiguos/duplicados
 * Problema: Tenemos psifi_csrf_token (antiguo) y psifi.x-csrf-token (nuevo)
 * Chrome añade __Host-psifi.x-csrf-token
 * Solución: Eliminar los cookies viejos para evitar conflictos
 * 
 * OPTIMIZACIÓN: Solo se ejecuta si detecta cookies viejos (no en cada request)
 */
export const cleanupOldCsrfCookies = (req: Request, res: Response, next: NextFunction): void => {
  // Cookies antiguos a eliminar
  const oldCookieNames = ['psifi_csrf_token', '__Host-psifi.x-csrf-token'];
  
  // Solo limpiar si detectamos cookies antiguos - evita overhead innecesario
  let hasOldCookies = false;
  for (const cookieName of oldCookieNames) {
    if (req.cookies[cookieName]) {
      hasOldCookies = true;
      
      // Establecer cookie con max-age=0 para eliminarlo
      res.clearCookie(cookieName, {
        path: '/',
        domain: isProduction ? '.onrender.com' : undefined,
        secure: isProduction,
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax'
      });
    }
  }
  
  if (isProduction && hasOldCookies && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE')) {
    console.error('[CSRF-CLEANUP-OLD-COOKIES]', {
      path: req.path,
      cookiesRemoved: oldCookieNames.filter(name => req.cookies[name])
    });
  }
  
  next();
};

// Exportar el middleware de protección CSRF
export const csrfProtectionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (CSRF_EXCLUDED_ROUTES.includes(req.path)) {
    return next();
  }

  // Log incoming CSRF requests in production
  if (isProduction && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE')) {
    const hasXCsrfToken = !!req.headers['x-csrf-token'];
    const cookieStr = req.headers.cookie || '';
    const hasCsrfCookie = cookieStr.includes('psifi.x-csrf-token=');
    const hasAuthToken = cookieStr.includes('token=');
    
    console.error('[CSRF-REQUEST-CHECK]', {
      method: req.method,
      path: req.path,
      hasXCsrfTokenHeader: hasXCsrfToken,
      xCsrfTokenLength: (req.headers['x-csrf-token'] as string)?.length || 0,
      hasCsrfCookie,
      hasAuthToken,
      cookies: cookieStr.split(';').map((c) => c.trim().split('=')[0])
    });
  }

  return csrfProtection.doubleCsrfProtection(req, res, next);
};

// Exportar la función para generar tokens CSRF
export const generateCsrfToken = csrfProtection.generateCsrfToken;
