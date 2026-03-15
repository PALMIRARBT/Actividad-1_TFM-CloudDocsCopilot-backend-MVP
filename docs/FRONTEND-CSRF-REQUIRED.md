# ⚠️ URGENT: Frontend CSRF Token Implementation Required

## Issue Summary

**Backend Components Status:**
- ✅ CSRF protection middleware configured
- ✅ CSRF token endpoint implemented (`GET /api/csrf-token`)
- ✅ Error handler updated (returns 403 for invalid CSRF tokens)
- ❌ **Frontend not handling CSRF tokens** ← **THIS IS THE PROBLEM**

**Current Behavior:**
- Frontend tries to create organization → Error 403 "Invalid or missing CSRF token"
- Frontend is not sending `x-csrf-token` header in POST/PUT/PATCH/DELETE requests

**Required Fix:**
Frontend needs to implement the CSRF token flow as documented in [FRONTEND-CSRF-IMPLEMENTATION.md](./FRONTEND-CSRF-IMPLEMENTATION.md)

---

## What Frontend Must Do

### 1. **Create CSRF Token Manager**

```typescript
// services/csrf.ts
export async function getCsrfToken(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/csrf-token`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const data = await response.json();
  return data.token;
}

// On app initialization
export async function initializeCsrfToken(store: any): Promise<void> {
  const token = await getCsrfToken();
  store.setCsrfToken(token);
}
```

### 2. **Store CSRF Token in Global State**

```typescript
// store/csrf.ts (Zustand / Redux / Context)
export const useCsrfStore = create((set) => ({
  token: null,
  setToken: (token: string) => set({ token }),
  
  initialize: async () => {
    const token = await getCsrfToken();
    set({ token });
  }
}));

// In App.tsx/main.tsx
useEffect(() => {
  useCsrfStore.getState().initialize();
}, []);
```

### 3. **Create API Client Wrapper**

```typescript
// api/client.ts
export async function apiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any
) {
  const csrfToken = useCsrfStore((s) => s.token);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  // Add CSRF token for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    headers['x-csrf-token'] = csrfToken;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    credentials: 'include', // ← MUST include cookies
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (response.status === 403 && method !== 'GET') {
    // Token expired, refresh and retry
    await useCsrfStore.getState().initialize();
    return apiRequest(endpoint, method, body);
  }
  
  return response.json();
}
```

### 4. **Update All Organization Requests**

```typescript
// Before creating org
fetch('/api/organizations', {
  method: 'POST',
  credentials: 'include', // ← MUST ADD
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken // ← MUST ADD
  },
  body: JSON.stringify({ name: 'Test Org' })
});
```

---

## Testing the Fix

### Frontend Test
1. Open DevTools → Console
2. Check that organization creation returns 201 instead of 500
3. Verify headers in Network tab:
   - ✅ `x-csrf-token: <64-char-string>`
   - ✅ `cookie: psifi.x-csrf-token=...`
   - ✅ `credentials: include`

### Backend Test
```bash
# After frontend sends correct CSRF token
curl http://localhost:3000/api/organizations \
  -X POST \
  -H "x-csrf-token: YOUR_TOKEN_HERE" \
  -H "Authorization: Bearer JWT_TOKEN"

# Response should be:
# {"success": true, "organization": {...}}
```

---

## Files to Review

- 📖 **Complete Guide**: [`docs/FRONTEND-CSRF-IMPLEMENTATION.md`](./FRONTEND-CSRF-IMPLEMENTATION.md) - Full implementation guide with examples
- 📋 **Technical Details**: [`docs/rfc/CSRF-PROTECTION.md`](./rfc/CSRF-PROTECTION.md) - Backend CSRF implementation details
- 🔧 **Backend Changes**: `src/middlewares/error.middleware.ts` - Now returns 403 for invalid CSRF tokens

---

## PR Acceptance Criteria

Frontend PR should include:

- [ ] CSRF token obtained from `GET /api/csrf-token` on app init
- [ ] CSRF token stored in global state (Zustand/Redux/Context)
- [ ] `x-csrf-token` header sent in all POST/PUT/PATCH/DELETE requests
- [ ] `credentials: 'include'` in all fetch calls
- [ ] Automatic retry logic when receiving 403 CSRF error
- [ ] Tests verify CSRF token is sent in request headers
- [ ] Organization creation returns 201 instead of 500

---

## Error Messages You'll See (Expected)

### ❌ Before Fix
```
Error: 500 Internal Server Error
Body: {"success": false, "error": "Internal server error"}
```

### ✅ After Fix (First Attempt - Missing Token)
```
Error: 403 Forbidden
Body: {"success": false, "error": "Invalid or missing CSRF token. Fetch a new token from GET /api/csrf-token..."}
```

### ✅ After Fix (Correct Implementation)
```
Status: 201 Created
Body: {"success": true, "message": "Organization created successfully", "organization": {...}}
```

---

## Quick Checklist for Frontend Dev

```typescript
✅ Step 1: Get CSRF token
  const token = await fetch('/api/csrf-token').then(r => r.json());

✅ Step 2: Store in state
  useCsrfStore.setState({ token: token.token });

✅ Step 3: Send in headers
  headers['x-csrf-token'] = csrfToken;

✅ Step 4: Include credentials
  credentials: 'include'

✅ Step 5: Test organization creation
  Should return 201 Created with organization data
```

---

## Contact / Questions

If organization creation still fails after implementing this:
1. Check DevTools Network tab for the actual request/response
2. Verify that `x-csrf-token` header is in request headers
3. Check that cookie `psifi.x-csrf-token` is present
4. Look at error message in response body for specific issue

Backend is ready. Frontend implementation is now needed.
