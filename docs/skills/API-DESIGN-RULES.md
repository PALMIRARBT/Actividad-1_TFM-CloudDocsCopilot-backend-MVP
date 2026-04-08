# API Design Rules

REST API design rules and conventions for CloudDocs API backend.

## RESTful Endpoints

**Use nouns for resources, not verbs**

```typescript
// ✅ CORRECT - RESTful endpoints
GET    /api/documents              // List documents
GET    /api/documents/:id          // Get document
POST   /api/documents              // Create document
PUT    /api/documents/:id          // Update document
DELETE /api/documents/:id          // Delete document
POST   /api/documents/:id/share    // Custom action (still resource-oriented)

// ❌ WRONG - Verb-based endpoints
GET    /api/getDocuments           // Use GET /api/documents instead
POST   /api/createDocument         // Use POST /api/documents instead
POST   /api/deleteDocument/:id     // Use DELETE /api/documents/:id instead
GET    /api/searchDocuments        // Use GET /api/documents?q=search
```

## Response Format

**Always use consistent response structure**

```typescript
// ✅ CORRECT - Consistent format
{
  "success": true,
  "data": {
    "id": "doc-123",
    "filename": "report.pdf",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}

// For lists with pagination
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}

// For errors
{
  "success": false,
  "error": "Document not found"
}

// ❌ WRONG - Inconsistent formats
{ "document": {...} }           // No success flag
{ "error": "error message" }    // Missing success flag
{ "code": 404, "msg": "..." }   // Wrong field names
```

## HTTP Status Codes

Use appropriate status codes:

| Code | Scenario |
|------|----------|
| **200** | GET/PUT/PATCH successful |
| **201** | POST resource created |
| **204** | DELETE successful (no content) |
| **400** | Invalid request (validation errors) |
| **401** | Authentication required/failed |
| **403** | Authenticated but not authorized |
| **404** | Resource not found |
| **409** | Conflict (e.g., duplicate resource) |
| **500** | Server error (unexpected) |

```typescript
// ✅ CORRECT - Proper status codes
export const getDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const document = await documentService.getById(id, req.user.id);

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

export const createDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await documentService.create(req.body);
    res.status(201).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await documentService.delete(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
```

## Pagination

Use query parameters for pagination:

```typescript
// Request
GET /api/documents?page=2&limit=25

// Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 25,
    "total": 150,
    "pages": 6
  }
}

// Implementation
export const listDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { documents, total } = await documentService.list({
      skip: (page - 1) * limit,
      limit
    });

    res.json({
      success: true,
      data: documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
```

## Filtering

Use query parameters for filtering:

```typescript
// Requests
GET /api/documents?status=active
GET /api/documents?type=pdf&folder=folder-123
GET /api/documents?createdAfter=2024-01-01&createdBefore=2024-01-31

// Implementation
export const listDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      status: req.query.status as string | undefined,
      type: req.query.type as string | undefined,
      folderId: req.query.folder as string | undefined,
      createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter as string) : undefined,
      createdBefore: req.query.createdBefore ? new Date(req.query.createdBefore as string) : undefined
    };

    const documents = await documentService.list(filters);
    res.json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};
```

## Sorting

Use query parameters for sorting:

```typescript
// Requests
GET /api/documents?sort=name
GET /api/documents?sort=-createdAt        // Descending
GET /api/documents?sort=name,createdAt    // Multiple fields

// Implementation
export const listDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sort = req.query.sort as string | undefined;
    const sortFields: Record<string, 1 | -1> = {};

    if (sort) {
      sort.split(',').forEach(field => {
        if (field.startsWith('-')) {
          sortFields[field.substring(1)] = -1;
        } else {
          sortFields[field] = 1;
        }
      });
    }

    const documents = await documentService.list({ sort: sortFields });
    res.json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};
```

## Selecting Fields (Projection)

Allow clients to request specific fields:

```typescript
// Request
GET /api/documents?fields=id,filename,createdAt

// Implementation
export const listDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fields = req.query.fields as string | undefined;
    const projection = fields ? fields.split(',').join(' ') : undefined;

    const documents = await documentService.list({ projection });
    res.json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};
```

## Search

Use query parameter for text search:

```typescript
// Request
GET /api/documents?q=invoice

// Implementation
export const searchDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string | undefined;
    if (!query) {
      return res.json({ success: true, data: [] });
    }

    const documents = await documentService.search(query);
    res.json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};
```

## Rate Limiting Response Headers

```typescript
// Response headers
res.set('X-RateLimit-Limit', '100');
res.set('X-RateLimit-Remaining', '99');
res.set('X-RateLimit-Reset', String(Math.floor(Date.now() / 1000) + 3600));
```

## Versioning (Optional)

If needed, use URL versioning:

```typescript
// v1 (legacy)
GET /api/v1/documents

// v2 (current)
GET /api/v2/documents

// Without version prefix (current)
GET /api/documents
```

## Error Response Format

```typescript
// Validation error
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "filename",
      "message": "Filename is required"
    },
    {
      "field": "folderId",
      "message": "Invalid folder ID"
    }
  ]
}

// Standard error
{
  "success": false,
  "error": "Document not found"
}
```

## CORS & Security Headers

```typescript
// ✅ CORRECT - Configure CORS appropriately
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ CORRECT - Add security headers
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

