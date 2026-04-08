# Coding Standards & Architecture

Complete patterns and architecture guidelines for CloudDocs API backend.

## Project Context

- **Type:** Backend REST API Service
- **Stack:** Node.js 20+, Express.js, TypeScript 5.x, MongoDB (Mongoose), Elasticsearch
- **Architecture:** Layered (Routes → Controllers → Services → Models)
- **Auth:** JWT tokens + CSRF protection

## Directory Structure

```
src/
├── configurations/     # External service configs (DB, CORS, ES)
├── controllers/        # HTTP request handlers - validate and delegate
├── middlewares/        # Auth, CSRF, rate-limit, validation
├── models/            # Mongoose schemas + TypeScript interfaces
├── routes/            # Express route definitions
├── services/          # Business logic - data access, transactions
├── utils/             # Pure helper functions
├── mail/              # Email templates and service
└── docs/              # OpenAPI specification
```

## Code Patterns

### Controllers

Controllers handle only HTTP concerns: parsing requests and formatting responses.

```typescript
// ✅ CORRECT - Controller delegates to service
export const createDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename, folderId } = req.body;
    const userId = req.user.id;

    const document = await documentService.create({ filename, folderId, userId });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

// ❌ WRONG - Business logic in controller
export const createDocument = async (req: Request, res: Response) => {
  const document = new Document(req.body);
  await document.save(); // Should be in service!
  res.json(document);
};
```

### Services

Services contain business logic and data access.

```typescript
// ✅ CORRECT - Service handles business rules
export const documentService = {
  async create(data: CreateDocumentDto): Promise<IDocument> {
    // Validate business rules
    const folder = await Folder.findById(data.folderId);
    if (!folder) {
      throw new HttpError(404, 'Folder not found');
    }

    // Check quota
    const usage = await this.getStorageUsage(data.userId);
    if (usage >= MAX_STORAGE) {
      throw new HttpError(400, 'Storage quota exceeded');
    }

    // Create document
    return Document.create(data);
  },

  async getStorageUsage(userId: string): Promise<number> {
    const docs = await Document.find({ uploadedBy: userId });
    return docs.reduce((sum, doc) => sum + doc.size, 0);
  }
};
```

### Models

Use Mongoose schemas with TypeScript interfaces.

```typescript
// models/document.model.ts
export interface IDocument extends mongoose.Document {
  filename: string;
  mimeType: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  folder?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new mongoose.Schema<IDocument>(
  {
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }
  },
  { timestamps: true }
);

export const Document = mongoose.model<IDocument>('Document', documentSchema);
```

### Middlewares

Chain middlewares in routes.

```typescript
// routes/document.routes.ts
router.post(
  '/',
  authenticate,                    // Verify JWT
  requireOrganization,              // Ensure organization context
  requireRole(['member', 'admin', 'owner']),  // Check permissions
  uploadMiddleware.single('file'),  // Handle file upload
  validateRequest(createDocumentSchema),     // Validate body
  documentController.create         // Handler
);
```

### Error Handling

Always use HttpError for API errors.

```typescript
import HttpError from '../models/error.model';

// Throw with status code and message
throw new HttpError(404, 'Document not found');
throw new HttpError(403, 'Access denied');
throw new HttpError(400, 'Invalid file type');

// Error middleware handles formatting the response
```

## Type Safety

**Critical Rule: NO `any` types**

```typescript
// ❌ FORBIDDEN - Will fail linting
catch (error: any) { ... }
function process(data: any) { ... }
const items: any[] = [];

// ✅ CORRECT - Use specific types or unknown
catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

interface ProcessData {
  id: string;
  name: string;
}
function process(data: ProcessData) { ... }

type Item = { id: string; value: number };
const items: Item[] = [];
```

What causes lint failures:
- ❌ Explicit `any` type
- ❌ Unsafe assignments from `any` values
- ❌ Accessing members on `any` values
- ❌ Calling typed functions as `any`
- ❌ Unused variables (unless prefixed with `_`)

