# 🔍 Diagnóstico CSRF - Checklist para Frontend

Usa esto para debuggear por qué CSRF está fallando en producción.

## ✅ Pasos a Verificar (Orden Importante)

### 1️⃣ ¿Se está llamando a `/api/csrf-token` ANTES de POST?

**Abre DevTools → Network tab → Filtra por "csrf-token"**

```
GET https://cloud-docs-api-service.onrender.com/api/csrf-token
```

**Deberías ver:**
- ✅ Status: **200 OK** (no 404, no 500)
- ✅ Response body: `{ "token": "d4f5e6g7h8i9j0k1l2m3n4o..." }` (string de 64 caracteres)
- ✅ Set-Cookie header: `psifi_csrf_token=...` (con HttpOnly, Secure, SameSite=None)

**Si no ves esta petición en Network tab:**
- ❌ **PROBLEMA CRITICO:** El frontend NO está llamando a `/api/csrf-token`
- 🔧 **Solución:** El frontend DEBE llamar a este endpoint al cargar la app, ANTES de cualquier POST/PUT/PATCH/DELETE

---

### 2️⃣ ¿Se está guardando el token en el estado?

En la consola del navegador, ejecuta:

```javascript
// Reemplaza 'store' o 'state' según tu framework (Vuex, Redux, etc.)
console.log(localStorage.getItem('csrf_token'));  // Si lo guardas en localStorage
// O si lo guardas en una variable global:
console.log(window.csrfToken);
```

**Deberías ver:** El mismo token que recibiste de `/api/csrf-token`

**Si es undefined o null:**
- ❌ **PROBLEMA:** El token no se está guardando después de obtenerlo
- 🔧 **Solución:** Guardar el token en el estado de la app

---

### 3️⃣ ¿Se está enviando el token en POST a /api/organizations?

**Abre DevTools → Network tab → Filtra por "organizations"**

```
POST https://cloud-docs-api-service.onrender.com/api/organizations
```

**Revisa Request Headers:**

```
x-csrf-token: d4f5e6g7h8i9j0k1l2m3n4o...  ← ¿Está aquí?
cookie: psifi_csrf_token=...; token=...;  ← ¿Ambas cookies?
```

**Si NO ves `x-csrf-token` header:**
- ❌ **PROBLEMA CRITICO:** El frontend NO está enviando el token en el header
- 🔧 **Solución:** El fetch/axios DEBE incluir:
  ```javascript
  headers: {
    'x-csrf-token': token,  // ← DEL JSON response de /api/csrf-token
    'Content-Type': 'application/json'
  }
  ```

**Si NO ves las cookies:**
- ❌ **PROBLEMA:** El fetch no tiene `credentials: 'include'`
- 🔧 **Solución:** Debe ser:
  ```javascript
  fetch(url, {
    method: 'POST',
    credentials: 'include',  // ← CRÍTICO para enviar cookies
    headers: { ... }
  })
  ```

---

### 4️⃣ ¿Son idénticos el token del header y el de la cookie?

**En DevTools → Network → La petición POST a /api/organizations:**

1. **Lee el header `x-csrf-token`:**
   - Copia el valor completo (64 caracteres)
   
2. **Lee la cookie `psifi_csrf_token` (en Request Cookies):**
   - Está encriptada, es **diferente** al header (eso es normal)
   
3. **Lee el JSON response de `/api/csrf-token` que guardaste:**
   - Deberá ser **idéntico** al header `x-csrf-token` que estás enviando

**Si son diferentes:**
- ❌ **PROBLEMA:** Estás usando un token viejo o generado por otro navegador
- 🔧 **Solución:** Llamar a `/api/csrf-token` de NUEVO antes de cada POST

---

### 5️⃣ ¿El endpoint `/api/csrf-token` está siendo llamado cada vez?

**Teoría:** Si hiciste login en otra pestaña o hace mucho tiempo, el token anterior está expirado.

**Solución recomendada:**

```javascript
// Llamar a /api/csrf-token inmediatamente después de login
async function handleLogin(email, password) {
  const loginResponse = await fetch('/api/auth/login', { ... });
  
  // UNA VEZ logueado, obtener nuevo CSRF token
  const csrfResponse = await fetch('/api/csrf-token', {
    credentials: 'include'
  });
  const csrfData = await csrfResponse.json();
  
  // Guardar este nuevo token
  storage.setCsrfToken(csrfData.token);
}
```

---

## 🚨 Respuestas Esperadas

### ✅ Caso Éxito (200/201)

```
POST /api/organizations 201 Created

Request Headers:
  x-csrf-token: d4f5e6g7h8i9j0k1l2m3n4o...
  cookie: psifi_csrf_token=...; token=...;
  
Response:
  { "success": true, "data": { ... } }
```

### ❌ Caso Fallo (403 CSRF)

```
POST /api/organizations 403 Forbidden

Request Headers:
  x-csrf-token: [FALTA o VALOR INCORRECTO]
  cookie: [FALTA psifi_csrf_token o token]
  
Response:
  { "error": "Invalid or missing CSRF token. Fetch a new token from GET /api/csrf-token..." }
```

---

## 📋 Checklist Rápido para el Equipo Frontend

Marca ✅ o ❌:

- [ ] ✅ Se está llamando GET `/api/csrf-token` al cargar la app
- [ ] ✅ Se guarda el token en estado de la app
- [ ] ✅ Se envía el token en header `x-csrf-token` en POST/PUT/PATCH/DELETE
- [ ] ✅ Se usa `credentials: 'include'` en fetch/axios
- [ ] ✅ El token enviado en header = token del JSON response
- [ ] ✅ Se llama a `/api/csrf-token` nuevamente después de login

---

## 🔧 Código Mínimo Correcto

### Frontend (JavaScript/React/Vue)

```javascript
// 1. Al cargar la app (App.vue, main.tsx, etc.)
async function initCsrfToken() {
  try {
    const response = await fetch('https://cloud-docs-api-service.onrender.com/api/csrf-token', {
      method: 'GET',
      credentials: 'include',  // ⚠️ CRÍTICO
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('❌ Failed to get CSRF token:', response.status);
      return;
    }
    
    const data = await response.json();
    // Guardar en estado global
    window.csrfToken = data.token;  // O en Store/Context
    console.log('✅ CSRF Token obtained:', data.token);
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }
}

// 2. Cuando hagas POST/PUT/PATCH/DELETE
async function createOrganization(name) {
  try {
    const response = await fetch('https://cloud-docs-api-service.onrender.com/api/organizations', {
      method: 'POST',
      credentials: 'include',  // ⚠️ CRÍTICO
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': window.csrfToken  // ← Token guardado en paso 1
      },
      body: JSON.stringify({ name, plan: 'FREE' })
    });
    
    if (response.status === 403) {
      console.error('❌ CSRF Failed. Trying to get new token...');
      await initCsrfToken();  // Obtener nuevo token
      // Reintentar
      return createOrganization(name);
    }
    
    const data = await response.json();
    console.log('✅ Organization created:', data);
  } catch (error) {
    console.error('Error creating organization:', error);
  }
}

// 3. Después de login
async function handleLogin(email, password) {
  // Login primero
  const loginRes = await fetch('https://cloud-docs-api-service.onrender.com/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (loginRes.ok) {
    // Inmediatamente obtener nuevo CSRF token
    await initCsrfToken();
    console.log('✅ Logged in and CSRF token refreshed');
  }
}
```

---

## 📞 Preguntas para Hacer al Equipo Frontend

Si después de verificar esto sigue fallando:

1. **¿Están usando axios o fetch?** Si axios, ¿está configurado `withCredentials: true`?
   
2. **¿Dónde guardan el CSRF token?** ¿localStorage, sessionStorage, variable global, Store?
   
3. **¿A qué URL están asignando el backend?** ¿Es exactamente `https://cloud-docs-api-service.onrender.com`?
   
4. **¿El frontend está en `https://cloud-docs-web-ui.vercel.app`?** (confirmar el dominio)
   
5. **¿Están limpiando localStorage/cookies entre tests/despliegues?** (puede causar tokens viejos)

6. **¿El CSRF token se inicializa en el layout principal o solo cuando se abre crear organización?**

---

## Backend Info (para referencia)

- **CSRF Cookie name:** `psifi_csrf_token`
- **CSRF Header name:** `x-csrf-token`
- **Token generation endpoint:** `GET /api/csrf-token`
- **Excluded routes (sin CSRF requerido):**
  - `/api/auth/login`
  - `/api/auth/register`
  - `/api/csrf-token`
  - `/confirm/:token`
  - `/api/auth/forgot-password`
  - `/api/auth/reset-password`

