# Security Guidelines

Security rules and best practices for CloudDocs API backend.

## Core Security Principles

1. **Never trust user input** - Validate and sanitize everything
2. **Use parameterized queries** - Mongoose handles this, avoid `$where`
3. **Hash passwords** - Use bcrypt with 10+ rounds
4. **Protect routes** - Apply auth middleware to all protected endpoints
5. **Validate file uploads** - Check MIME type, size, sanitize filename
6. **Sanitize paths** - Use path-sanitizer for file operations

## Input Validation & Sanitization

```typescript
import { body, validationResult } from 'express-validator';

// ✅ CORRECT - Validate all inputs
router.post(
  '/documents',
  body('filename').isString().trim().notEmpty(),
  body('folderId').isMongoId(),
  body('mimeType').isString().matches(/^[a-z]+\/[-+a-z0-9]+$/i),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    // ... continue
  }
);

// ❌ WRONG - Trust user input without validation
router.post('/documents', async (req, res) => {
  const { filename } = req.body; // Unsafe!
  // ...
});
```

## Password Hashing

```typescript
import bcrypt from 'bcrypt';

// ✅ CORRECT - Use bcrypt with sufficient rounds
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// ❌ WRONG - Insufficient rounds
const hash = await bcrypt.hash(password, 2); // Too few rounds!

// ❌ WRONG - Storing plain text
const user = await User.create({ password: plainTextPassword }); // Never!
```

## Route Protection

```typescript
// ✅ CORRECT - Chain appropriate middlewares
router.delete(
  '/documents/:id',
  authenticate,                    // 1. Verify JWT
  requireOrganization,              // 2. Ensure org context
  requireRole(['admin', 'owner']),  // 3. Check permissions
  validateDocumentOwnership,        // 4. Verify ownership
  validateRequest(deleteSchema),    // 5. Validate input
  documentController.delete         // 6. Handler
);

// ❌ WRONG - No protection
router.delete('/documents/:id', documentController.delete); // Unsafe!

// ❌ WRONG - Incomplete protection
router.delete('/documents/:id', authenticate, documentController.delete); // Allows deletion of others' documents
```

## File Upload Validation

```typescript
import fileType from 'file-type';

// ✅ CORRECT - Comprehensive file validation
export const validateFileUpload = async (file: Express.Multer.File): Promise<void> => {
  // 1. Check size
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  if (file.size > MAX_FILE_SIZE) {
    throw new HttpError(400, 'File too large');
  }

  // 2. Verify MIME type matches extension
  const type = await fileType.fromBuffer(file.buffer);
  if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
    throw new HttpError(400, 'Invalid file type');
  }

  // 3. Sanitize filename
  const sanitized = file.originalname
    .replace(/\0/g, '')  // Remove null bytes
    .replace(/[/\\]/g, '') // Remove path separators
    .substring(0, 255); // Limit length

  if (!sanitized) {
    throw new HttpError(400, 'Invalid filename');
  }
};

// ❌ WRONG - Trust client MIME type
router.post('/upload', upload.single('file'), (req, res) => {
  const mimeType = req.file?.mimetype; // Client can lie!
});

// ❌ WRONG - Use filename directly in path
const filepath = `/uploads/${req.file?.originalname}`; // Path traversal vulnerability!
```

## Path Sanitization

```typescript
import path from 'path';

// ✅ CORRECT - Sanitize paths
export const getSafePath = (basePath: string, userPath: string): string => {
  const absolute = path.resolve(basePath, userPath);
  const relative = path.relative(basePath, absolute);

  // Ensure it doesn't escape base directory
  if (relative.startsWith('..')) {
    throw new HttpError(403, 'Access denied');
  }

  return absolute;
};

// Usage
const userPath = req.query.file; // e.g., "../../etc/passwd"
const safe = getSafePath('/uploads', userPath);

// ❌ WRONG - Direct path concatenation
const unsafe = `/uploads/${userPath}`; // Allows path traversal!
```

## JWT & Token Security

```typescript
// ✅ CORRECT - Store only non-sensitive data in JWT
const token = jwt.sign(
  {
    userId: user._id,
    email: user.email,
    role: user.role
    // ❌ Never include: password, secrets, creditCard, etc.
  },
  process.env.JWT_SECRET!,
  { expiresIn: '24h' }
);

// ✅ CORRECT - Verify token expiration
export const verifyToken = (token: string): ITokenPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as ITokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, 'Token expired');
    }
    throw new HttpError(401, 'Invalid token');
  }
};
```

## SQL/NoSQL Injection Prevention

```typescript
// ✅ CORRECT - Use Mongoose (parameterized by default)
const doc = await Document.findById(id); // Safe
const doc = await Document.findOne({ filename: filename }); // Safe

// ❌ WRONG - Avoid $where operator
const doc = await Document.findOne({
  $where: `this.filename == '${filename}'`  // Vulnerable!
});

// ❌ WRONG - String concatenation with user input
const query = `db.documents.find({filename: "${filename}"})` // Vulnerable!
```

## CSRF Protection

```typescript
import csrf from 'csurf';

// ✅ CORRECT - Apply CSRF protection
const csrfProtection = csrf({ cookie: false });

router.post(
  '/api/documents',
  csrfProtection,       // Add CSRF token validation
  authenticate,
  documentController.create
);

// Provide CSRF token to client
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

## Environment Variables

```typescript
// ✅ CORRECT - Never commit .env files
// .gitignore
.env
.env.local
*.key
*.pem

// ✅ CORRECT - Use environment variables for sensitive data
const jwtSecret = process.env.JWT_SECRET;
const dbUri = process.env.MONGO_URI;
const apiKey = process.env.THIRD_PARTY_API_KEY;

if (!jwtSecret || !dbUri) {
  throw new Error('Missing required environment variables');
}

// ❌ WRONG - Hardcoded secrets
const jwtSecret = 'my-super-secret-key'; // Exposed in git!
```

## Error Handling Security

```typescript
// ✅ CORRECT - Don't expose sensitive details
throw new HttpError(404, 'Not found');  // Generic message

// ❌ WRONG - Expose system details
throw new Error(`Database connection failed: ${dbConnection.error}`); // Leaks internals!

// ✅ CORRECT - Log details server-side for debugging
logger.error('Database error', {
  error: dbConnection.error,
  user: req.user.id,
  // But don't send to client
});
```

## Logging Best Practices

```typescript
// ✅ CORRECT - Log context without sensitive data
logger.error('Authentication failed', {
  userId: user.id,
  timestamp: new Date(),
  ipAddress: req.ip
  // ❌ Never log: passwords, tokens, credit cards
});

// ✅ CORRECT - Hide sensitive data in logs
const sanitize = (obj: unknown): unknown => {
  if (typeof obj === 'object' && obj !== null) {
    const result = JSON.parse(JSON.stringify(obj));
    if ('password' in result) delete result.password;
    if ('token' in result) delete result.token;
    return result;
  }
  return obj;
};
```

