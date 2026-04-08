# Error Handling Patterns

Error handling patterns and best practices for CloudDocs API backend.

## HttpError Class

Always use HttpError for API errors. This ensures consistent error responses.

```typescript
// models/error.model.ts
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export default HttpError;
```

## Using HttpError in Services

```typescript
import HttpError from '../models/error.model';

export const documentService = {
  async getById(id: string, userId: string): Promise<IDocument> {
    // Validate input
    if (!id) {
      throw new HttpError(400, 'Document ID is required');
    }

    // Check existence
    const document = await Document.findById(id);
    if (!document) {
      throw new HttpError(404, 'Document not found');
    }

    // Check authorization
    if (document.uploadedBy.toString() !== userId) {
      throw new HttpError(403, 'Access denied');
    }

    return document;
  },

  async delete(id: string, userId: string): Promise<void> {
    const document = await this.getById(id, userId); // Reuse validation

    await Document.deleteOne({ _id: id });
  }
};
```

## Using HttpError in Controllers

```typescript
export const getDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await documentService.getById(id, userId);

    res.json({ success: true, data: document });
  } catch (error) {
    // Pass error to error middleware
    next(error);
  }
};
```

## Error Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import HttpError from '../models/error.model';
import logger from '../utils/logger';

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error server-side
  logger.error('API Error', {
    error: error instanceof Error ? error.message : String(error),
    statusCode: error instanceof HttpError ? error.statusCode : 500,
    path: req.path,
    method: req.method
  });

  // Handle HttpError
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message
    });
    return;
  }

  // Handle validation errors
  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details
    });
    return;
  }

  // Handle JWT errors
  if (error instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
    return;
  }

  // Handle MongoDB errors
  if (error instanceof MongooseError) {
    res.status(400).json({
      success: false,
      error: 'Database error'
    });
    return;
  }

  // Unknown error - don't expose details to client
  logger.error('Unexpected error', { error });
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
```

## Common Status Codes

| Code | Meaning | When to Use |
|------|---------|-----------|
| **400** | Bad Request | Invalid input, validation failed |
| **401** | Unauthorized | Authentication required or failed |
| **403** | Forbidden | Authenticated but not authorized |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Resource already exists (duplicate) |
| **500** | Server Error | Unexpected error |
| **503** | Service Unavailable | Database/external service down |

```typescript
// Examples
throw new HttpError(400, 'Invalid email format');
throw new HttpError(401, 'Authentication required');
throw new HttpError(403, 'You dont have permission to delete this document');
throw new HttpError(404, 'Document not found');
throw new HttpError(409, 'Document with this name already exists');
throw new HttpError(500, 'Internal server error');
```

## Handling Unknown Errors

```typescript
// ✅ CORRECT - Use type guard for unknown errors
export const handleError = (error: unknown): void => {
  if (error instanceof HttpError) {
    // Handle HttpError
    console.error(error.statusCode, error.message);
  } else if (error instanceof Error) {
    // Handle standard Error
    console.error(error.message);
  } else {
    // Handle unknown type
    console.error('Unknown error:', error);
  }
};

// ❌ WRONG - Using any type
export const handleError = (error: any): void => {
  console.error(error.message); // error might not have message property
};
```

## Async Error Handling

```typescript
// ✅ CORRECT - Always use try-catch in async functions
export const createDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await documentService.create(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error); // Pass to error middleware
  }
};

// ❌ WRONG - Unhandled promise rejection
export const createDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const result = await documentService.create(req.body); // Error not caught!
  res.status(201).json({ success: true, data: result });
};

// ❌ WRONG - No error handling
export const createDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return documentService.create(req.body)
    .then(result => res.json(result)); // Error not handled in then!
};
```

## Validation Error Format

```typescript
export interface IValidationError {
  field: string;
  message: string;
}

export class ValidationError extends Error {
  constructor(
    public details: IValidationError[]
  ) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

// Usage
if (!filename || filename.length === 0) {
  throw new ValidationError([
    { field: 'filename', message: 'Filename is required' }
  ]);
}

// In error middleware
if (error instanceof ValidationError) {
  res.status(400).json({
    success: false,
    error: 'Validation failed',
    details: error.details
  });
}
```

## Validation with express-validator

```typescript
import { body, validationResult } from 'express-validator';

export const validateCreateDocument = [
  body('filename').notEmpty().withMessage('Filename is required'),
  body('filename').isString().withMessage('Filename must be a string'),
  body('folderId').isMongoId().withMessage('Invalid folder ID'),
  body('mimeType').matches(/^[a-z]+\/[-a-z0-9]+$/i).withMessage('Invalid MIME type')
];

export const createDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map(err => ({
          field: 'param' in err ? err.param : 'unknown',
          message: err.msg
        }))
      });
    }

    const { filename, folderId, mimeType } = req.body;
    const document = await documentService.create({
      filename,
      folderId,
      mimeType
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

// Use validator in route
router.post(
  '/',
  authenticate,
  validateCreateDocument,  // Validates before controller
  createDocument
);
```

## Database Error Handling

```typescript
export const updateDocument = async (
  id: string,
  data: UpdateDocumentDto
): Promise<IDocument> => {
  try {
    const result = await Document.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    if (!result) {
      throw new HttpError(404, 'Document not found');
    }

    return result;
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      // ValidationError from Mongoose
      if (error.name === 'ValidationError') {
        throw new HttpError(400, 'Validation failed');
      }
      // Cast error (invalid ObjectId)
      if (error.name === 'CastError') {
        throw new HttpError(400, 'Invalid document ID');
      }
    }

    // Re-throw HttpError as-is
    if (error instanceof HttpError) {
      throw error;
    }

    // Unknown error
    throw new HttpError(500, 'Database error');
  }
};
```

## Retrying Failed Operations

```typescript
export const retryAsync = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error instanceof HttpError && error.statusCode < 500) {
        throw error;
      }

      // Wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
};

// Usage
const fileContent = await retryAsync(
  () => fetchFileFromExternalService(fileId),
  3,  // max retries
  1000 // delay in ms
);
```

## Logging Errors Safely

```typescript
// ✅ CORRECT - Log context without sensitive data
logger.error('Document creation failed', {
  userId: req.user.id,
  folderId: req.body.folderId,
  error: error instanceof Error ? error.message : 'Unknown error',
  timestamp: new Date()
  // ❌ Never include: passwords, tokens, credit cards, personal data
});

// ✅ CORRECT - Sanitize sensitive data
const sanitizeError = (error: unknown): unknown => {
  if (typeof error === 'object' && error !== null) {
    const obj = JSON.parse(JSON.stringify(error)) as Record<string, unknown>;
    delete obj['password'];
    delete obj['token'];
    delete obj['creditCard'];
    delete obj['ssn'];
    return obj;
  }
  return error;
};
```

## Adding Context to Errors

```typescript
// ✅ CORRECT - Add context when re-throwing
export const processDocument = async (id: string): Promise<void> => {
  try {
    await validateDocument(id);
    await saveToDatabase(id);
    await indexInElasticsearch(id);
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      // Already handled
      throw error;
    }

    const context = {
      documentId: id,
      step: 'processing'
    };

    logger.error('Document processing failed', { ...context, error });

    throw new HttpError(
      500,
      `Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};
```

