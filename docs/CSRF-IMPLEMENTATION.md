# 🔒 CSRF Protection Implementation Guide

**Last Updated:** March 17, 2026  
**Status:** ✅ Active - Double Submit Cookie Pattern

---

## 📋 Overview

CloudDocs uses **Double Submit Cookie Pattern** for CSRF protection:

1. Server generates unique token per session
2. Token stored in `httpOnly` cookie (`psifi.x-csrf-token`)
3. Client must send same token in `x-csrf-token` header
4. Server validates both tokens match

### Security Properties

- ✅ **Session-bound:** Token tied to JWT session identifier
- ✅ **HttpOnly Cookie:** JavaScript cannot access token (XSS protection)
- ✅ **SameSite Cookie:** Set to `none` in production for cross-origin compatibility
- ✅ **Secure Flag:** Only transmitted over HTTPS
- ✅ **64-byte random token:** Cryptographically secure

---

## 🏗️ Backend Implementation

### Middleware Configuration

**File:** `src/middlewares/csrf.middleware.ts`

```typescript
const csrfProtection = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: 'psifi.x-csrf-token',
  cookieOptions: {
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    secure: isProduction,
    httpOnly: true
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getSessionIdentifier: (req) => {
    // Use JWT token hash as session ID
    const jwtToken = req.cookies?.token;
    return jwtToken?.substring(0, 32) || 'anonymous';
  }
});
```

### Excluded Routes

Routes that don't require CSRF token:

```typescript
const CSRF_EXCLUDED_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/csrf-token',        // Token generation endpoint
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
];
```

### Token Generation Endpoint

**Endpoint:** `GET /api/csrf-token`

```typescript
export const getCsrfToken = (req: Request, res: Response) => {
  const token = generateCsrfToken();
  
  res.json({
    success: true,
    csrfToken: token,
    message: 'Token CSRF generado. Se estableció automáticamente en cookie.'
  });
};
```

**Response Example:**

```json
{
  "success": true,
  "csrfToken": "d4f5e6g7h8i9j0k1l2m3n4o5p6q7r8s9...",
  "message": "Token CSRF generado. Se estableció automáticamente en cookie."
}
```

**Response Headers:**

```
Set-Cookie: psifi.x-csrf-token=encrypted_value; HttpOnly; Secure; Path=/; SameSite=None
Content-Type: application/json
```

---

## 🚀 Frontend Implementation

### Step 1: Initialize CSRF Token on App Load

Call this **ONCE** when the application initializes:

```typescript
// services/csrf.ts
export async function getCsrfToken(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/csrf-token`, {
      method: 'GET',
      credentials: 'include', // ⚠️ CRITICAL: Include cookies to receive Set-Cookie
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get CSRF token: ${response.status}`);
    }

    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('❌ Error obtaining CSRF token:', error);
    throw error;
  }
}
```

### Step 2: Store Token in Global State

**Using Zustand (Recommended):**

```typescript
// store/csrf.ts
import { create } from 'zustand';
import { getCsrfToken as fetchCsrfToken } from '../services/csrf';

export const useCsrfStore = create((set, get) => ({
  csrfToken: null as string | null,
  isLoading: true,
  error: null as string | null,

  initialize: async () => {
    try {
      const token = await fetchCsrfToken();
      set({ csrfToken: token, isLoading: false });
      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  refresh: async () => {
    try {
      const token = await fetchCsrfToken();
      set({ csrfToken: token });
      return token;
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
      throw error;
    }
  },

  getToken: () => get().csrfToken
}));

// App initialization
// In your main App component or entry point:
useEffect(() => {
  useCsrfStore.getState().initialize();
}, []);
```

### Step 3: Include Token in State-Changing Requests

Send token in **x-csrf-token header** for POST, PUT, PATCH, DELETE requests:

```typescript
// api/client.ts (API wrapper)
export async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  const csrfToken = useCsrfStore.getState().csrfToken;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers
  };

  // Add CSRF token for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (!csrfToken) {
      throw new Error('CSRF token not available. Initialize CSRF store first.');
    }
    requestHeaders['x-csrf-token'] = csrfToken;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      credentials: 'include', // ⚠️ CRITICAL: Send cookies automatically
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined
    });

    // Handle CSRF token expiration
    if (response.status === 403) {
      const errorData = await response.json();
      if (errorData.error?.includes('CSRF')) {
        console.warn('🔄 CSRF token expired. Refreshing...');
        await useCsrfStore.getState().refresh();
        // Retry request with new token
        return apiRequest<T>(endpoint, options);
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API request failed (${method} ${endpoint}):`, error);
    throw error;
  }
}
```

### Step 4: Use API Client in Components

```typescript
// Example usage
async function createOrganization(name: string) {
  try {
    const result = await apiRequest('/api/organizations', {
      method: 'POST',
      body: { name, plan: 'FREE' }
    });
    console.log('✅ Organization created:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to create organization:', error);
    throw error;
  }
}
```

---

## 🔄 Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. App Initialization                                       │
├─────────────────────────────────────────────────────────────┤
│ GET /api/csrf-token                                         │
│ ↓                                                            │
│ Response: { csrfToken: "abc123..." }                        │
│ Set-Cookie: psifi.x-csrf-token=encrypted                   │
│ ↓                                                            │
│ Store in Zustand: useCsrfStore.csrfToken = "abc123..."    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. State-Changing Request (POST/PUT/PATCH/DELETE)          │
├─────────────────────────────────────────────────────────────┤
│ POST /api/organizations                                     │
│ Headers:                                                    │
│   x-csrf-token: abc123... (from store)                     │
│   Cookie: psifi.x-csrf-token=encrypted; token=jwt...   │
│ ↓                                                            │
│ Server CSRF Middleware:                                     │
│   1. Extract x-csrf-token from header                      │
│   2. Extract psifi.x-csrf-token from cookie                │
│   3. Decrypt cookie and verify both tokens match            │
│   4. Validate session identifier matches JWT                │
│ ↓                                                            │
│ ✅ If valid: Process request                                │
│ ❌ If invalid: Return 403 Forbidden                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### "Invalid or missing CSRF token" (403 Error)

**Common Causes:**

1. **Frontend not calling `/api/csrf-token`**
   - Solution: Initialize CSRF store on app load

2. **CSRF token not included in request header**
   - Solution: Add token to `x-csrf-token` header for POST/PUT/PATCH/DELETE

3. **Not using `credentials: 'include'`**
   - Solution: Always include `credentials: 'include'` in fetch options

4. **Token expired (session changed)**
   - Solution: Implement token refresh logic on 403 error

5. **Cookie not being sent by browser**
   - Solution: Verify `SameSite=None` and `Secure` flags in production

### Debugging in Browser DevTools

**Network Tab:**

1. Find request to `/api/csrf-token`
2. Check Response tab for `csrfToken` field
3. Check Cookies tab for `psifi.x-csrf-token`
4. Find subsequent POST request
5. Check Headers tab for `x-csrf-token` header
6. Verify header value matches response token

**Console:**

```javascript
// Check current CSRF token
console.log(useCsrfStore.getState().csrfToken);

// Manually refresh token
useCsrfStore.getState().refresh().then(() => {
  console.log('✅ Token refreshed');
});
```

---

## ✅ Production Checklist

- [ ] Environment variable `CSRF_SECRET` is set (min 32 chars)
- [ ] Frontend calls `/api/csrf-token` on app initialization
- [ ] CSRF token stored in global state manager (Zustand/Redux/Context)
- [ ] API requests include `x-csrf-token` header for state-changing operations
- [ ] All requests use `credentials: 'include'`
- [ ] Token refresh logic implemented for 403 errors
- [ ] Error handling for CSRF failures
- [ ] SameSite cookie policy set correctly for environment
- [ ] HTTPS enabled in production
- [ ] HttpOnly flag enabled on cookies

---

## 📚 References

- **Pattern:** [Double Submit Cookie Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)
- **Library:** [csrf-csrf npm package](https://www.npmjs.com/package/csrf-csrf)
- **Security:** [OWASP CSRF Prevention](https://owasp.org/www-community/attacks/csrf)
