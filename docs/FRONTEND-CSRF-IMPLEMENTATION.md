# 🔒 Frontend CSRF Token Implementation Guide

**Última actualización:** 15 de Marzo, 2026  
**Estado:** ⚠️ REQUERIDO PARA FUNCIONAMIENTO

---

## 📋 Resumen del Problema

El frontend en Vercel intenta hacer peticiones POST a `/api/organizations` pero recibe **error 403 Forbidden: "Invalid or missing CSRF token"**.

Esto ocurre porque:

1. ✅ **Autenticación JWT funciona** - El usuario está logueado (presente la cookie de token)
2. ❌ **CSRF token NO se está manejando** - El frontend no obtiene ni envía el token CSRF requerido

---

## 🚀 Flujo Correcto de CSRF (3 pasos)

### Paso 1: Obtener el Token CSRF (Ejecutar UNA VEZ al cargar la app)

**Endpoint:** `GET /api/csrf-token`  
**Requiere autenticación:** ❌ NO  
**Requiere CSRF token:** ❌ NO

```javascript
async function getCsrfToken() {
  try {
    const response = await fetch('https://api.clouddocs.com/api/csrf-token', {
      method: 'GET',
      credentials: 'include', // ⚠️ IMPORTANTE: Incluir cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get CSRF token: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ CSRF Token obtenido:', data.token);
    
    // Guardar en estado global de la app
    return data.token; // String de 64 caracteres
  } catch (error) {
    console.error('❌ Error obteniendo CSRF token:', error);
    throw error;
  }
}
```

**Respuesta esperada:**

```json
{
  "token": "d4f5e6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5"
}
```

---

### Paso 2: Guardar el Token en Estado Global

Después de obtener el token CSRF, almacenarlo en tu contexto/store global de la app:

**Con React Context:**

```javascript
// csrfContext.js
import React, { createContext, useState, useEffect } from 'react';

export const CsrfContext = createContext();

export function CsrfProvider({ children }) {
  const [csrfToken, setCsrfToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initializeCsrfToken() {
      try {
        const response = await fetch('https://api.clouddocs.com/api/csrf-token', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        setCsrfToken(data.token);
        console.log('✅ CSRF Token inicializado');
      } catch (error) {
        console.error('❌ Error inicializando CSRF token:', error);
      } finally {
        setLoading(false);
      }
    }

    initializeCsrfToken();
  }, []);

  return (
    <CsrfContext.Provider value={{ csrfToken, loading }}>
      {children}
    </CsrfContext.Provider>
  );
}
```

**Con Zustand o similares:**

```javascript
import { create } from 'zustand';

export const useCsrfStore = create((set) => ({
  csrfToken: null,
  setCsrfToken: (token) => set({ csrfToken: token }),
  
  initializeCsrfToken: async () => {
    try {
      const response = await fetch('https://api.clouddocs.com/api/csrf-token', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      set({ csrfToken: data.token });
    } catch (error) {
      console.error('Error inicializando CSRF token:', error);
    }
  }
}));

// En tu App.js o componente raíz:
useEffect(() => {
  useCsrfStore.getState().initializeCsrfToken();
}, []);
```

---

### Paso 3: Enviar el Token en Peticiones POST/PUT/PATCH/DELETE

En **CADA petición** que modifique datos, incluir el header `x-csrf-token`:

```javascript
async function createOrganization(organizationName) {
  const csrfToken = useCsrfStore((state) => state.csrfToken); // Obtener del estado
  
  if (!csrfToken) {
    console.error('❌ CSRF token no disponible. Espera a que se cargue.');
    return;
  }

  try {
    const response = await fetch('https://api.clouddocs.com/api/organizations', {
      method: 'POST',
      credentials: 'include', // ⚠️ IMPORTANTE: Incluir cookies
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken  // ⚠️ IMPORTANTE: Incluir el token
      },
      body: JSON.stringify({
        name: organizationName,
        plan: 'FREE'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error creando organización:', error);
      
      // Si el error es CSRF (403), reintentar obtener nuevo token
      if (response.status === 403 && error.error.includes('CSRF')) {
        console.log('🔄 Token CSRF expirado. Obteniendo nuevo token...');
        await useCsrfStore.getState().initializeCsrfToken();
        // Reintentar la petición recursivamente
        return createOrganization(organizationName);
      }
      
      throw new Error(error.error || 'Error desconocido');
    }

    const data = await response.json();
    console.log('✅ Organización creada:', data);
    return data.organization;
  } catch (error) {
    console.error('❌ Error en petición:', error);
    throw error;
  }
}
```

---

## 📐 Patrón Recomendado: Fetch Wrapper

Crear una función wrapper que maneje automáticamente CSRF en todas las peticiones:

```javascript
// api/client.js
import { useCsrfStore } from '../store/csrfStore';

const API_BASE_URL = 'https://api.clouddocs.com';

// Métodos que requieren CSRF
const METHODS_REQUIRING_CSRF = ['POST', 'PUT', 'PATCH', 'DELETE'];

export async function apiRequest(endpoint, options = {}) {
  const method = options.method || 'GET';
  const csrfToken = useCsrfStore.getState().csrfToken;

  // Construir headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Agregar token CSRF si se requiere
  if (METHODS_REQUIRING_CSRF.includes(method)) {
    if (!csrfToken) {
      console.warn('⚠️ CSRF token no disponible. Intentando obtener...');
      await useCsrfStore.getState().initializeCsrfToken();
    }
    headers['x-csrf-token'] = useCsrfStore.getState().csrfToken;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      method,
      credentials: 'include', // ⚠️ SIEMPRE incluir cookies
      headers
    });

    // Manejar error CSRF 403
    if (response.status === 403) {
      const data = await response.json();
      if (data.error.includes('CSRF')) {
        console.log('🔄 Token CSRF inválido. Obteniendo nuevo...');
        await useCsrfStore.getState().initializeCsrfToken();
        // Reintentar con nuevo token
        return apiRequest(endpoint, options);
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Error en ${method} ${url}:`, error);
    throw error;
  }
}

// Uso
export const api = {
  organizations: {
    create: (name) => apiRequest('/api/organizations', {
      method: 'POST',
      body: JSON.stringify({ name })
    }),
    list: () => apiRequest('/api/organizations'),
    get: (id) => apiRequest(`/api/organizations/${id}`),
    update: (id, data) => apiRequest(`/api/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
};
```

Uso en componentes:

```javascript
import { api } from '../api/client';

async function handleCreateOrganization() {
  try {
    const org = await api.organizations.create('Mi Organización');
    console.log('✅ Organización creada:', org);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}
```

---

## ✅ Checklist de Implementación

- [ ] **Frontend obtiene CSRF token** al cargar la app (`GET /api/csrf-token`)
- [ ] **Token almacenado en estado global** (Context, Zustand, Redux, etc.)
- [ ] **Header `x-csrf-token` enviado** en todas las peticiones POST/PUT/PATCH/DELETE
- [ ] **`credentials: 'include'`** en TODAS las peticiones (fetch y axios)
- [ ] **Reintentos automáticos** cuando recibe 403 CSRF
- [ ] **Logs de debug** para verificar que el token se envía correctamente

---

## 🐛 Debugging: Cómo verificar que funciona

### En navegador (DevTools):

1. Abre **Console** y escribe:

```javascript
// Verificar que el token está en cookies
console.log(document.cookie); // Debe contener "psifi.x-csrf-token"

// Verificar que el token está en estado
console.log(useCsrfStore.getState().csrfToken); // Debe ser un string de 64 caracteres
```

2. Abre **Network** tab y filtra por petición a `/api/organizations`
3. En **Request Headers**, verifica:
   - ✅ `x-csrf-token: <64-char-token>`
   - ✅ `cookie: psifi.x-csrf-token=...` (auto-enviada por navegador)
   - ✅ `credentials: include`

### Desde curl (testing):

```bash
# 1. Obtener CSRF token
curl -s http://localhost:3000/api/csrf-token | jq '.token'
# Respuesta: "d4f5e6g7h8i9j0k1l2m..."

# 2. Intentar crear organización CON token
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: d4f5e6g7h8i9j0k1l2m..." \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Cookie: psifi.x-csrf-token=..." \
  -d '{"name": "Test Org"}'

# Respuesta debe ser 201 Created
# ✅ {"success": true, "message": "Organization created successfully", ...}

# 3. Sin CSRF token (debe fallar 403)
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"name": "Test Org"}'

# Respuesta: {"success": false, "error": "Invalid or missing CSRF token..."}
```

---

## 🔄 Casos Especiales

### POST a `/api/auth/register` y `/api/auth/login`

**NO requieren CSRF token** (rutas públicas de autenticación):

```javascript
async function register(email, password) {
  const response = await fetch('https://api.clouddocs.com/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
    // ❌ NO incluir x-csrf-token aquí
  });
}
```

### GET a cualquier ruta

**NO requieren CSRF token** (solo lectura):

```javascript
async function getOrganizations() {
  const response = await fetch('https://api.clouddocs.com/api/organizations', {
    credentials: 'include',
    // ❌ NO necesario x-csrf-token
  });
}
```

---

## 🚨 Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| **403 "Invalid or missing CSRF token"** | Token no enviado o expirado | Obtener nuevo token con `GET /api/csrf-token` |
| **401 Unauthorized** | JWT token expirado/inválido | Renovar JWT o hacer login de nuevo |
| **CORS error** | Request sin `credentials: 'include'` | Agregar `credentials: 'include'` |
| **Cookie no se envía** | Same-site issues en desarrollo | En dev: sameSite='lax', en prod: sameSite='none' + secure |

---

## 📞 Referencias

- [CSRF Protection Implementation](../rfc/CSRF-PROTECTION.md) - Detalles técnicos backend
- [Backend API Routes](../ARCHITECTURE.md) - Lista de endpoints y métodos
- [Error Codes](./ENDPOINTS-TESTING-GUIDE.md) - Respuestas de error documentadas

---

## ✨ Resumen Rápido

```javascript
// 1. Al cargar app
const token = await fetch('/api/csrf-token').then(r => r.json()).then(d => d.token);

// 2. En cada POST/PUT/PATCH/DELETE
fetch('/api/organizations', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': token  // 👈 La línea más importante
  },
  body: JSON.stringify({ name: 'Org' })
});
```

**🎯 Si cambias UNA cosa: El header `x-csrf-token` en peticiones POST/PUT/PATCH/DELETE**
