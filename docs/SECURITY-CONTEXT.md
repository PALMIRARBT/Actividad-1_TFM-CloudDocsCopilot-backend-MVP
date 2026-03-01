# Contexto de Seguridad - CloudDocs API

> **Propósito:** Este documento recoge el análisis de controles de seguridad actuales del proyecto para ser usado como contexto en la generación de un informe de revisión de seguridad previo al lanzamiento oficial.

---

## 1. Descripción del Sistema

**CloudDocs** es una API REST multi-tenant para gestión documental con capacidades de IA (RAG, OCR, clasificación, resumen). Construida con Node.js 20+, Express.js, TypeScript 5.x, MongoDB/Mongoose y Elasticsearch opcional.

- **Entorno:** Backend solo (sin frontend propio, expuesto a clientes SPA)
- **Auth:** JWT en cookies HttpOnly + CSRF Double Submit Cookie
- **Multitenancy:** Aislamiento por `organizationId` en todos los recursos
- **Puerto:** 4000 (configurable)
- **Archivos:** Almacenados en disco local (`/uploads`), referenciados en MongoDB

---

## 2. Controles de Seguridad Implementados

### 2.1 Autenticación (`src/middlewares/auth.middleware.ts`, `src/services/jwt.service.ts`)

| Control | Estado | Detalle |
|---|---|---|
| JWT en cookie HttpOnly | ✅ Implementado | Token leído de `req.cookies.token` |
| Fallback Authorization header | ⚠️ Presente | Para compatibilidad temporal, bypass de cookie |
| Token versioning | ✅ Implementado | `tokenVersion` en User model, incrementado al cambiar contraseña |
| Invalidación por cambio de contraseña | ✅ Implementado | Verificación de `lastPasswordChange` vs `iat` del token |
| Invalidación por cambio de email | ✅ Implementado | `decoded.email !== user.email` → 401 |
| Verificación de usuario activo | ✅ Implementado | `user.active === false` → 401 |
| Sliding session | ✅ Implementado | Refresh de cookie en cada request válido |
| Invalidación por cambios de usuario (timestamp) | ⚠️ Comentado | Código bloqueado con comentario - no activo en producción |
| Secreto JWT por defecto | ❌ Riesgo | Fallback a `'change_me_dev'` si `JWT_SECRET` no está configurado |

### 2.2 Protección CSRF (`src/middlewares/csrf.middleware.ts`)

| Control | Estado | Detalle |
|---|---|---|
| CSRF Double Submit Cookie | ✅ Implementado | Usando `csrf-csrf` (equivalente a `csurf` deprecado) |
| Cookie `__Host-` prefix | ✅ Implementado | Máxima seguridad de cookie |
| `sameSite: strict` | ✅ Implementado | Previene envío cross-site |
| `httpOnly: true` | ✅ Implementado | JS no puede leer el token |
| `secure` en producción | ✅ Implementado | Solo HTTPS en producción |
| Token de 64 bytes | ✅ Implementado | Entropía suficiente |
| CSRF deshabilitado para rutas de auth | ✅ Implementado | Login, register, forgot-password excluidas |
| **CSRF completamente deshabilitado en dev** | ⚠️ Riesgo | `ignoredMethods` incluye todos los verbos HTTP en dev/test |
| CSRF saltado para rutas `/register` | ⚠️ Riesgo | `req.originalUrl.includes('register')` bypassa el middleware |

### 2.3 Control de Acceso / RBAC (`src/middlewares/role.middleware.ts`, `src/middlewares/organization.middleware.ts`, `src/models/membership.model.ts`)

#### Roles globales (User model)
- `user` - Usuario estándar
- `admin` - Administrador global del sistema

#### Roles en organización (Membership model)
- `owner` - Propietario, control total
- `admin` - Administrador de organización
- `member` - Miembro estándar con lectura/escritura
- `viewer` - Solo lectura

#### Estados de membresía
- `active`, `pending`, `suspended`

| Control | Estado | Detalle |
|---|---|---|
| `requireAdmin` middleware | ✅ Implementado | Verifica rol global `admin` |
| `validateOrganizationMembership` | ✅ Implementado | Verifica membresía activa en la org |
| `validateOrganizationOwnership` | ✅ Implementado | Solo `owner` puede ejecutar operaciones críticas |
| Verificación de org activa | ✅ Implementado | Org inactiva devuelve 403 |
| `requireRole` por ruta | ✅ Implementado | Aplicado en routes con array de roles permitidos |
| Separación de datos por `organizationId` | ✅ Implementado | Todos los queries usan filtro de org |
| RBAC en módulo IA (RAG) | ✅ Implementado | Verificación de membresía antes de procesar/preguntar |

### 2.4 Rate Limiting (`src/middlewares/rate-limit.middleware.ts`)

| Limiter | Ventana | Límite | Aplicado en |
|---|---|---|---|
| `generalRateLimiter` | 15 min | 1000 req | Global (`app.use`) |
| `authRateLimiter` | 15 min | 10 intentos fallidos | Login, register, forgot-password |
| `createResourceRateLimiter` | 1 hora | 200 recursos | POST de creación |
| Upload limiter | 1 hora | Configurado | POST upload documentos |
| AI limiter | Configurable | Configurado | Endpoints `/api/ai/*` |

> **Nota:** Rate limiters deshabilitados cuando `NODE_ENV === 'test'`.

### 2.5 Seguridad de Contraseñas (`src/services/auth.service.ts`, `src/utils/password-validator.ts`)

| Control | Estado | Detalle |
|---|---|---|
| Hashing bcrypt | ✅ Implementado | `bcryptjs` con `BCRYPT_SALT_ROUNDS` (default: 10) |
| Validación de fortaleza | ✅ Implementado | `validatePasswordOrThrow` antes de hashear |
| Reset token via email | ✅ Implementado | Token randomBytes, almacenado como SHA-256 hash |
| Expiración de reset token | ✅ Implementado | 1 hora (`PASSWORD_RESET_TOKEN_EXPIRY_MS`) |
| Password no expuesto en JSON | ✅ Implementado | Schema transform elimina `password` |
| `passwordResetRequestedAt` tracking | ✅ Implementado | Para detectar abusos de la función de reset |

### 2.6 Headers HTTP (`src/app.ts` — Helmet.js)

| Header | Estado | Configuración |
|---|---|---|
| Content-Security-Policy | ✅ Activo | `defaultSrc: 'self'`, permite inline styles/scripts |
| X-Frame-Options | ✅ Activo | `DENY` - previene clickjacking |
| X-Content-Type-Options | ✅ Activo | `noSniff: true` |
| HSTS | ✅ Activo | `maxAge: 31536000`, `includeSubDomains`, `preload` |
| X-XSS-Protection | ✅ Activo | `xssFilter: true` |
| Referrer-Policy | ✅ Activo | `strict-origin-when-cross-origin` |
| X-Powered-By | ✅ Ocultado | `hidePoweredBy: true` |
| X-Permitted-Cross-Domain-Policies | ✅ Activo | `none` |
| **CSP `unsafe-inline`** | ⚠️ Riesgo | Permite scripts/estilos inline — debilita CSP |

### 2.7 CORS (`src/configurations/cors-config.ts`)

| Control | Estado | Detalle |
|---|---|---|
| Whitelist de orígenes | ✅ Implementado | `ALLOWED_ORIGINS` env en producción |
| Advertencia si no hay orígenes en prod | ✅ Implementado | Console warn, rechaza todo cross-origin |
| Credenciales incluidas | ✅ Configurado | `credentials: true` para cookies |
| Orígenes amplios en desarrollo | ⚠️ Normal | localhost puertos 3000-8080 permitidos |

### 2.8 Protección contra Inyección NoSQL (`src/app.ts`)

| Control | Estado | Detalle |
|---|---|---|
| `express-mongo-sanitize` | ✅ Implementado | Reemplaza `$` y `.` con `_` en input |

### 2.9 Seguridad en Subida de Archivos (`src/middlewares/upload.middleware.ts`)

| Control | Estado | Detalle |
|---|---|---|
| Validación MIME type | ✅ Implementado | Whitelist de tipos permitidos |
| Nombre de archivo aleatorio | ✅ Implementado | `crypto.randomUUID()` + extensión validada |
| Tamaño máximo | ✅ Implementado | `MAX_UPLOAD_SIZE` env (default 100MB) |
| Validación de extensión | ✅ Implementado | Regex `^\.[\w-]+$` |
| **Archivos servidos sin autenticación** | ❌ Riesgo | `/uploads` como static público — cualquiera con URL puede descargar |

### 2.10 Validación de URLs / SSRF (`src/middlewares/url-validation.middleware.ts`)

| Control | Estado | Detalle |
|---|---|---|
| Validación de URLs en body | ✅ Implementado | `validateUrlMiddleware` con whitelist de dominios |
| Prevención SSRF | ✅ Implementado | `url-validator` utils bloquea IPs privadas/localhost |
| Prevención Open Redirect | ✅ Implementado | Solo URLs con dominios permitidos |

### 2.11 Auditoría y Logs (`src/models/deletion-audit.model.ts`)

| Control | Estado | Detalle |
|---|---|---|
| Audit trail de eliminaciones | ✅ Implementado | `DeletionAudit` model, referencia GDPR Art. 30 |
| IP en registros de auditoría | ✅ Implementado | `ipAddress` en cada registro |
| User Agent en registros | ✅ Implementado | `userAgent` en cada registro |
| Snapshot de documento eliminado | ✅ Implementado | Datos del doc al momento de eliminación |
| **Endpoint de acceso a logs** | ❌ Pendiente | No hay API para consultar audit logs |
| **Control de acceso a logs** | ❌ Pendiente | Sin RBAC sobre consulta de logs de auditoría |
| **Logs de aplicación (stdout/stderr)** | ⚠️ Sin control | Sin logging estructurado, sin control de acceso a logs de proceso |

### 2.12 Multitenancy - Aislamiento de Datos

| Control | Estado | Detalle |
|---|---|---|
| Filtro por `organizationId` en queries | ✅ Implementado | Todos los servicios filtran por org |
| `organizationId` en document_chunks (IA) | ✅ Implementado | Vector search filtrado por org |
| Middleware de verificación de membresía | ✅ Implementado | Aplicado antes de operaciones sensibles |
| Cross-org access en RAG | ✅ Bloqueado | 403 si el usuario no es miembro de la org objetivo |

---

## 3. Vulnerabilidades / Riesgos Identificados

### 🔴 Críticos

| ID | Descripción | Ubicación | Impacto |
|---|---|---|---|
| SEC-001 | Archivos subidos servidos como static sin autenticación | `app.ts` L.101, `/uploads` | Cualquier persona con la URL puede descargar documentos confidenciales |
| SEC-002 | JWT_SECRET con fallback inseguro | `jwt.service.ts` L.3 | Si no se configura la env, tokens firmados con secreto conocido |

### 🟠 Altos

| ID | Descripción | Ubicación | Impacto |
|---|---|---|---|
| SEC-003 | CSRF completamente deshabilitado en desarrollo | `csrf.middleware.ts` L.38-41 | El entorno de staging/preproducción podría estar expuesto si usa `NODE_ENV=development` |
| SEC-004 | Fallback de Authorization header en JWT | `auth.middleware.ts` L.46-51 | Permite envío de token fuera de cookie (CSRF bypass) |
| SEC-005 | Invalidación de token por cambios de usuario comentada | `auth.middleware.ts` L.64-72 | Tokens siguen válidos tras actualización de datos de usuario |
| SEC-006 | Sin control de acceso a endpoint `/uploads` | `app.ts` | Un documento movido a papelera sigue accesible por URL directa |

### 🟡 Medios

| ID | Descripción | Ubicación | Impacto |
|---|---|---|---|
| SEC-007 | CSP con `unsafe-inline` para scripts y estilos | `app.ts` Helmet config | Reduce protección contra XSS si se inyecta código |
| SEC-008 | Sin API para consultar audit logs | `deletion-audit.model.ts` | No hay trazabilidad visible para administradores |
| SEC-009 | Sin logging estructurado de seguridad | Global | Eventos de seguridad (logins, 403s) no están registrados de forma trazable |
| SEC-010 | Rate limiter general muy permisivo (1000/15min) | `rate-limit.middleware.ts` | No protege efectivamente contra scraping |

### 🟢 Bajos / Informativos

| ID | Descripción | Ubicación | Impacto |
|---|---|---|---|
| SEC-011 | Sin política de rotación de JWT_SECRET | Configuración | Secreto comprometido invalida todos los tokens manualmente |
| SEC-012 | Algoritmo HS256 para JWT (simétrico) | `jwt.service.ts` | Considerar RS256 para sistemas distribuidos |
| SEC-013 | `trust proxy: 1` - confía en un proxy | `app.ts` | Configuración correcta para un load balancer, validar en producción |
| SEC-014 | Sin 2FA/MFA | Auth service | Recomendado para cuentas admin |

---

## 4. Pendientes de Seguridad para Lanzamiento Oficial

- [ ] **SEC-001** Proteger `/uploads` con middleware de autenticación + verificación de permisos
- [ ] **SEC-002** Validar presencia de `JWT_SECRET` en startup y fallar si no está configurado
- [ ] **SEC-003** Revisar política de CSRF en entornos de staging/preproducción
- [ ] **SEC-004** Deprecar fallback de Authorization header o hacer intencional con documentación
- [ ] **SEC-005** Activar invalidación de token por actualizaciones de usuario (descomentar bloque)
- [ ] **SEC-008** Implementar endpoint admin para consultar audit logs con RBAC
- [ ] **SEC-009** Implementar logging estructurado (Winston/Pino) con niveles y control de acceso a logs
- [ ] **SEC-010** Ajustar rate limits para producción (reducir el general a 100-200/15min)

---

## 5. Stack Tecnológico Relevante para Seguridad

```
- express: 4.x
- helmet: ~8.x (HTTP security headers)
- cors: ~2.x
- csrf-csrf: (Double Submit Cookie)
- express-rate-limit: ~7.x
- bcryptjs: ~2.x (password hashing)
- jsonwebtoken: ~9.x (JWT HS256)
- express-mongo-sanitize: ~2.x (NoSQL injection prevention)
- multer: ~1.x (file upload)
- cookie-parser: ~1.x
- mongoose: ~8.x (ODM - parameterized queries by default)
```
