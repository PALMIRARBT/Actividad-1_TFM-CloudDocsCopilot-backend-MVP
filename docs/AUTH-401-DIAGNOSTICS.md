# Diagnóstico de Errores 401 - Guía de Testing

Este documento describes cómo testear localmente el flujo de autenticación con logs diagnósticos para identificar por qué aparecen errores 401 después de login exitoso.

## Requisitos

- Backend en execution: `npm run dev` en terminal
- Frontend en execution: `npm run dev` (si usas Vite)
- Postman o curl para testing manual
- Variables de entorno configuradas en `.env`:
  ```
  NODE_ENV=development
  SEND_CONFIRMATION_EMAIL=false
  CONFIRMATION_URL_BASE=http://localhost:4000
  JWT_SECRET=your-secret-key
  ```

## Puntos de Log Diagnóstico

### 1. LOGIN - Respuesta con Set-Cookie

**Endpoint:** `POST /api/auth/login`

**Log esperado en backend:**
```
[AUTH-LOGIN-DIAGNOSTIC] {
  timestamp: '2026-03-14T...',
  email: 'user@example.com',
  tokenLength: 547,
  cookieOptions: {
    httpOnly: true,
    secure: false,           // false en desarrollo
    sameSite: 'lax',         // 'lax' en desarrollo, 'none' en producción
    maxAge: 86400000,
    path: '/'
  },
  nodeEnv: 'development',
  requestOrigin: 'http://localhost:5173',
  status: 'about_to_set_cookie'
}

[AUTH-LOGIN-DIAGNOSTIC] {
  timestamp: '2026-03-14T...',
  email: 'user@example.com',
  status: 'cookie_set',
  setCookieHeader: [ 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; SameSite=lax' ]
}
```

**QUÉ VERIFICAR:**
- ✅ `secure: false` en desarrollo (HTTP), `true` en producción (HTTPS)
- ✅ `sameSite: 'lax'` en desarrollo, `'none'` en producción
- ✅ Header `Set-Cookie` está presente en respuesta
- ✅ Cookie tiene flags HttpOnly, Path=/, y sameSite configurado

### 2. ENDPOINT PROTEGIDO - Cookie en Request

**Endpoint:** `GET /api/users/profile` (requiere autenticación)

**Log esperado en backend:**
```
[AUTH-MIDDLEWARE-DIAGNOSTIC] {
  timestamp: '2026-03-14T...',
  requestPath: '/users/profile',
  method: 'GET',
  hasCookieToken: true,
  cookieTokenLength: 547,
  hasAuthHeader: false,
  allCookies: ['token'],
  requestOrigin: 'http://localhost:5173'
}

[AUTH-MIDDLEWARE-SUCCESS] {
  timestamp: '2026-03-14T...',
  requestPath: '/users/profile',
  method: 'GET',
  userId: '507f1f77bcf86cd799439011',
  userEmail: 'user@example.com',
  status: 'authenticated'
}
```

**QUÉ VERIFICAR:**
- ✅ `hasCookieToken: true` (cookie token fue encontrado)
- ✅ `allCookies: ['token']` (la cookie 'token' está presente)
- ✅ `status: 'authenticated'` (validación exitosa)

---

## Test Manual con Postman

### Paso 1: Login (obtener cookie)

1. **Crear request POST**
   - URL: `http://localhost:4000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "SecurePassword123!"
     }
     ```

2. **Ejecutar y revisar:**
   - **Status esperado:** 200 OK
   - **Response JSON:** `{ message: "Login successful", user: { ... } }`
   - **Headers → Set-Cookie:** Debe existir `token=...; Path=/; HttpOnly; SameSite=lax`
   - **Postman:** Auto-guarda la cookie en el navegador

3. **Backend logs esperados:**
   - `[AUTH-LOGIN-DIAGNOSTIC]` con cookieOptions
   - `[AUTH-LOGIN-DIAGNOSTIC]` con status: 'cookie_set'

---

### Paso 2: Endpoint Protegido (usar la cookie)

1. **Crear request GET**
   - URL: `http://localhost:4000/api/users/profile`
   - Headers: Sin configuración especial (Postman envía cookies automáticamente)

2. **Ejecutar y revisar:**
   - **Status esperado:** 200 OK
   - **Response:** Datos del usuario autenticado
   - **Headers (enviados):** Cookie header debe estar presente

3. **Backend logs esperados:**
   - `[AUTH-MIDDLEWARE-DIAGNOSTIC]` con hasCookieToken: true
   - `[AUTH-MIDDLEWARE-SUCCESS]` con status: 'authenticated'

---

## Test Manual con Curl

### Paso 1: Login y guardar cookie

```bash
# Linux/macOS
curl -v -c cookies.txt \
  -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePassword123!"}'

# Windows PowerShell
$response = curl.exe -v -c cookies.txt `
  -X POST http://localhost:4000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"SecurePassword123!\"}'
```

**Comandos equivalentes (backend local, port 4000):**
```bash
curl -i -c cookies.txt \
  --request POST \
  --url http://localhost:4000/api/auth/login \
  --header 'Content-Type: application/json' \
  --data '{"email":"test@example.com","password":"SecurePassword123!"}'
```

**En respuesta, buscar:**
- Status: `200 OK`
- Header: `Set-Cookie: token=...`

---

### Paso 2: Usar la cookie en endpoint protegido

```bash
# Linux/macOS
curl -v -b cookies.txt \
  http://localhost:4000/api/users/profile

# Windows PowerShell
curl.exe -v -b cookies.txt `
  http://localhost:4000/api/users/profile
```

**En respuesta, buscar:**
- Status: `200 OK`
- Response: Datos del usuario
- Header enviado: `Cookie: token=...`

---

## Diagramas de Flujo Esperado

### Flujo Correcto (200 en endpoint protegido)

```
CLIENT                          BACKEND
  |                               |
  |--POST /auth/login----------->|
  |   {email, password}          |
  |                               | [AUTH-LOGIN-DIAGNOSTIC]
  |                               | cookieOptions logged
  |                               | Set-Cookie: token=...
  |<--200 OK------------------|
  |    Set-Cookie header         | [AUTH-LOGIN-DIAGNOSTIC]
  |    (Browser guarda cookie)   | status: 'cookie_set'
  |                               |
  |--GET /api/users/profile----->|
  |   Cookie: token=...          |
  |   (Auto-enviada por browser) |
  |                               | [AUTH-MIDDLEWARE-DIAGNOSTIC]
  |                               | hasCookieToken: true
  |                               | [AUTH-MIDDLEWARE-SUCCESS]
  |                               | status: 'authenticated'
  |<--200 OK------------------|
  |    User data                  |
  |                               |
```

### Flujo Incorrecto (401 en endpoint protegido)

```
CLIENT                          BACKEND
  |                               |
  |--POST /auth/login----------->|
  |                               | Set-Cookie enviado
  |<--200 OK------------------|
  |    Set-Cookie header         |
  |                               |
  |--GET /api/users/profile----->|
  |   SIN Cookie!                |
  |   (No se envió, o se perdió) |
  |                               | [AUTH-MIDDLEWARE-DIAGNOSTIC]
  |                               | hasCookieToken: false
  |                               | allCookies: []
  |                               | [AUTH-MIDDLEWARE-401-MISSING-TOKEN]
  |<--401 Unauthorized----------|
  |    Access token required      |
  |                               |
```

---

## Interpretación de Logs de Error - Checklist 401

Busca en los logs del backend por estos patrones cuando recibas 401:

| Log Pattern | Significado | Acción |
|---|---|---|
| `[AUTH-MIDDLEWARE-DIAGNOSTIC]`<br>`hasCookieToken: false`<br>`allCookies: []` | **PROBLEMA:** Cookie no se envía en request | Ver "Solución 1 CORS" |
| `[AUTH-MIDDLEWARE-401-MISSING-TOKEN]` | **PROBLEMA:** Token no existe en cookies ni en header | Ver "Solución 1 CORS" |
| `[AUTH-LOGIN-401-ERROR]` | **PROBLEMA:** Error durante login (credenciales inválidas, usuario no existe) | Revisar email/password |
| `[AUTH-LOGIN-DIAGNOSTIC]`<br>`sameSite: 'none'`<br>`secure: false` | **PROBLEMA PRODUCCIÓN:** SameSite=none requiere Secure=true (HTTPS) | Configurar HTTPS |
| `[AUTH-MIDDLEWARE-401-TOKEN-EXPIRED]` | **PROBABIL:** Token expiró (>24h) | Usuario debe hacer login nuevamente |
| `[AUTH-MIDDLEWARE-401-PASSWORD-CHANGED]` | **PROBABIL:** Usuario cambió contraseña y token viejo fue invalidado | Usuario debe hacer login de nuevo |
| `[AUTH-MIDDLEWARE-401-USER-INACTIVE]` | **PROBLEMA:** Cuenta no confirmada o desactivada | Revisar SEND_CONFIRMATION_EMAIL y email de confirmación |

---

## Solución 1: Cookie No Se Envía (CORS + Credenciales)

**Síntomas:**
```
[AUTH-MIDDLEWARE-DIAGNOSTIC]
hasCookieToken: false
allCookies: []
```

**Checklist:**

### A. Frontend: Verificar withCredentials

En Axios o Fetch, **DEBE TENER** `withCredentials: true` o `credentials: 'include'`:

```typescript
// ✅ CORRECTO - Axios
axios.create({
  withCredentials: true  // <-- REQUIRED para cookies
})

// ✅ CORRECTO - Fetch
fetch('/api/users/profile', {
  credentials: 'include'  // <-- REQUIRED para cookies
})
```

### B. Backend: Verificar CORS Cookie Options

En `src/configurations/cors-config.ts`:
```typescript
credentials: true  // <-- DEBE SER true
```

### C. Verificar Header Set-Cookie fue enviado

Busca en los logs del backend:
```
[AUTH-LOGIN-DIAGNOSTIC]
status: 'cookie_set',
setCookieHeader: [ 'token=...; Path=/; HttpOnly; SameSite=lax' ]
```

Si NO ves este log, el middleware de login no se ejecutó.

### D. Verificar Cookie en Navegador

**En DevTools (Chrome/Firefox):**
1. F12 → Application → Cookies
2. URL: `http://localhost:5173`
3. Busca: Cookie named `token`
4. Si NO EXISTE:
   - Check if `Set-Cookie` header fue recibido (Network tab)
   - Check if SameSite/Secure mismatch

---

## Solución 2: Cookie Mismatch SameSite + Secure

**Síntomas en producción:**
- Login funciona (Set-Cookie recibido)
- Pero cookie NO se guarda en navegador
- Logs: `[AUTH-MIDDLEWARE-DIAGNOSTIC]` con `hasCookieToken: false`

**Causa:** SameSite=none REQUIERE Secure=true (HTTPS only)

**Chequeo:**
```
NODE_ENV=production:
  ✅ Correcto: sameSite: 'none', secure: true
  ❌ Incorrecto: sameSite: 'none', secure: false
  
NODE_ENV=development:
  ✅ Correcto: sameSite: 'lax', secure: false
  ❌ Incorrecto: sameSite: 'none', secure: false
```

---

## Solución 3: CSRF Token También Requerido

Si tu API requiere CSRF en POST/PUT/PATCH:

**Antes de enviar request autenticada:**
```bash
# Obtener CSRF token
curl http://localhost:4000/api/csrf-token

# Response: { csrfToken: "abc123..." }
```

**Luego agregar header en request autenticada:**
```bash
curl -H "x-csrf-token: abc123..." \
     -b cookies.txt \  # Incluir cookie
     http://localhost:4000/api/users/profile
```

---

## Logs Útiles para Debugging

### Ver TODOS los logs auth en tiempo real

```bash
# En la terminal donde corre `npm run dev`:
npm run dev 2>&1 | grep AUTH-

# O más específico:
npm run dev 2>&1 | grep -E "(AUTH-|SET-COOKIE|DIAGNOSTIC)"
```

### Estructura de logs por evento

```
Para cada request autenticada, espera ver:

1. [AUTH-MIDDLEWARE-DIAGNOSTIC]     ← Entrada al middleware
   └─ hasCookieToken: true/false
   └─ allCookies: [...]             ← QUÉ COOKIES ESTÁN PRESENTES

2. Si token está:
   ├─ [AUTH-MIDDLEWARE-SUCCESS]     ← Usuario autenticado ✅
   └─ [AUTH-MIDDLEWARE-COOKIE-REFRESH]

3. Si token NO está:
   └─ [AUTH-MIDDLEWARE-401-MISSING-TOKEN]  ← Error 401 ❌
      └─ reason: "No token found..."
```

---

## Variables de Entorno de Diagnóstico

Para FORZAR logs incluso en producción (testing):
```bash
# Agregar a .env
DEBUG_AUTH=true
NODE_ENV=development  # Asegura que los logs se activen
```

**Los logs se deshabilitan automáticamente en tests** (`NODE_ENV=test`) para no contaminar la salida de jest.

---

## Ejemplos de Respuestas de Error

### Error 401 - Token no encontrado
```json
{
  "error": "Access token required",
  "statusCode": 401
}
```
**Backend log:**
```
[AUTH-MIDDLEWARE-401-MISSING-TOKEN]
reason: "No token found in cookie or Authorization header"
```

### Error 401 - Token expirado
```json
{
  "error": "Token expired",
  "statusCode": 401
}
```
**Backend log:**
```
[AUTH-MIDDLEWARE-401-TOKEN-EXPIRED]
reason: "JWT token has expired"
```

### Error 401 - Token inválido
```json
{
  "error": "Invalid token",
  "statusCode": 401
}
```
**Backend log:**
```
[AUTH-MIDDLEWARE-401-INVALID-TOKEN]
errorMessage: "invalid signature"
reason: "JWT token is invalid or malformed"
```

---

## Quick Reference - Testing Script

```bash
#!/bin/bash
# save as test-auth.sh

BACKEND="http://localhost:4000"
COOKIES="./cookies.txt"

# 1. Login
echo "=== STEP 1: LOGIN ==="
curl -v -c $COOKIES \
  -X POST $BACKEND/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePassword123!"}'

echo -e "\n\n=== STEP 2: PROTECTED ENDPOINT ==="
curl -v -b $COOKIES $BACKEND/api/users/profile

echo -e "\n\n=== STEP 3: CHECK LOGS ABOVE FOR ==="
echo "[AUTH-LOGIN-DIAGNOSTIC]"
echo "[AUTH-MIDDLEWARE-DIAGNOSTIC] hasCookieToken: true"
echo "[AUTH-MIDDLEWARE-SUCCESS]"
```

---

## Próximos Pasos

1. **Local testing:**
   - Ejecuta `npm run dev`
   - Abre este logs guide en otra ventana
   - Realiza login y endpoint protegido
   - Compara con los logs esperados

2. **Si encuentras diferencias:**
   - Abre issue con:
     - Logs completos del backend
     - Frontend browser DevTools (Network, Console, Application)
     - `NODE_ENV` actual
     - Frontend framework y versión

3. **Para producción:**
   - Verifica HTTPS está habilitado
   - Verifica `ALLOWED_ORIGINS` incluye frontend domain
   - Verifica `secure: true` en cookies (NODE_ENV=production)
   - Verifica `sameSite: 'none'` en cookies

