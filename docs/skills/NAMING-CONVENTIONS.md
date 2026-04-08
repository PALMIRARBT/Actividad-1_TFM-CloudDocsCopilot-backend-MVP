# Naming Conventions

Naming standards for files, classes, functions, and variables in CloudDocs API backend.

## File Naming

```
kebab-case (all lowercase, hyphens between words)
```

| Type | Pattern | Example |
|------|---------|---------|
| Services | `*.service.ts` | `auth.service.ts`, `document.service.ts` |
| Controllers | `*.controller.ts` | `auth.controller.ts`, `document.controller.ts` |
| Models | `*.model.ts` | `user.model.ts`, `document.model.ts` |
| Routes | `*.routes.ts` | `auth.routes.ts`, `document.routes.ts` |
| Middlewares | `*.middleware.ts` | `auth.middleware.ts`, `csrf.middleware.ts` |
| Utils | `*.util.ts` or `*.utils.ts` | `password.util.ts`, `validators.util.ts` |
| Tests | `*.test.ts` or `*.spec.ts` | `auth.service.test.ts`, `auth.middleware.spec.ts` |
| Types/Interfaces | `*.types.ts` or `*.interface.ts` | `auth.types.ts`, `user.interface.ts` |

```typescript
// ✅ CORRECT
src/services/document.service.ts
src/controllers/document.controller.ts
src/models/document.model.ts
src/middlewares/auth.middleware.ts
src/utils/validators.util.ts
tests/unit/services/auth.service.test.ts

// ❌ WRONG
src/services/DocumentService.ts       // PascalCase file
src/controllers/documentController.ts // camelCase file
src/models/User.model.ts              // PascalCase file
src/middleware/authMiddleware.ts      // Missing 's' in middlewares, camelCase file
```

## Class Names

```
PascalCase (capitalize first letter, no separators)
```

```typescript
// ✅ CORRECT
class AuthService { }
class DocumentController { }
class HttpError { }
class ValidationError { }
class TokenExpiredError { }

// ❌ WRONG
class auth_service { }         // snake_case
class authService { }          // camelCase
class Auth { }                 // Too short
class DocumentServiceClass { } // Redundant "Class"
```

## Interface Names

```
I + PascalCase (I prefix, capitalize first letter)
```

```typescript
// ✅ CORRECT
interface IUser { }
interface IDocument { }
interface IAuthPayload { }
interface ICreateDocumentDto { }

// ❌ WRONG
interface User { }              // Missing I prefix
interface user { }              // Missing I prefix and lowercase
interface User_Interface { }    // Wrong format
interface IUserInterface { }    // Redundant
```

## Function Names

```
camelCase (lowercase first letter, rest capitalized)
```

```typescript
// ✅ CORRECT
function getUserById(id: string) { }
function validatePassword(password: string): boolean { }
function createDocument(data: CreateDocumentDto) { }
async function fetchUserById(id: string) { }
const getUserEmail = (user: IUser): string => user.email;

// ❌ WRONG
function GetUserById(id: string) { }    // PascalCase
function get_user_by_id(id: string) { } // snake_case
function getuserbid(id: string) { }     // No word separation
```

## Variable Names

```
camelCase for regular variables
SCREAMING_SNAKE_CASE for constants
Use descriptive names
```

```typescript
// ✅ CORRECT
const userId = '123';
const userName = 'john@example.com';
const isActive = true;
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const JWT_EXPIRES_IN = '24h';
const DEFAULT_PAGE_SIZE = 20;

// ❌ WRONG
const user_id = '123';           // snake_case for var
const uID = '123';               // Unclear abbreviation
const max_file_size = 100;       // snake_case for var
const maxFileSize = 100;         // Should be constant (SCREAMING_SNAKE_CASE)
const x = 'john';                // Too vague
const a, b, c = getData();       // Meaningless names
```

## Constants

```
SCREAMING_SNAKE_CASE at module or class level
```

```typescript
// ✅ CORRECT at module level
export const MAX_STORAGE = 1000 * 1024 * 1024; // 1GB
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const JWT_EXPIRES_IN = '24h';
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
export const DEFAULT_PAGE_LIMIT = 20;

// ✅ CORRECT at class level
class DocumentService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;
}

// ❌ WRONG
const maxStorage = 1000; // Should use SCREAMING_SNAKE_CASE for constants
const MAX_storage = 1000; // Inconsistent
const Max_Storage = 1000; // Wrong format
```

## Environment Variables

```
SCREAMING_SNAKE_CASE
```

```typescript
// ✅ CORRECT
process.env.MONGO_URI
process.env.JWT_SECRET
process.env.JWT_EXPIRES_IN
process.env.BCRYPT_ROUNDS
process.env.ALLOWED_ORIGINS
process.env.CORS_CREDENTIALS

// ❌ WRONG
process.env.mongoUri         // camelCase
process.env.mongo_uri        // snake_case
process.env.MONGO_URL        // Inconsistent naming
```

## Boolean Variables

```
Prefix with 'is', 'has', 'can', 'should'
```

```typescript
// ✅ CORRECT
const isActive = true;
const isAdmin = user.role === 'admin';
const hasPermission = user.permissions.includes('delete');
const canDelete = isOwner && hasPermission;
const shouldRetry = attempts < MAX_RETRIES;

// ❌ WRONG
const active = true;           // No prefix
const admin = false;           // Unclear if it's a boolean
const permission = true;       // Ambiguous
```

## Array Variables

```
Use plural names or suffixed with 'List'
```

```typescript
// ✅ CORRECT
const users: IUser[] = [];
const documents: IDocument[] = [];
const userList = await User.find();
const activeDocuments = documents.filter(d => d.isActive);

// ❌ WRONG
const user: IUser[] = [];           // Singular for plural
const document = [];                // Ambiguous
const userArr = [];                 // Unclear abbreviation
```

## Data Transfer Objects (DTOs)

```
Suffix with 'Dto' or 'Request'/'Response'
```

```typescript
// ✅ CORRECT
interface CreateDocumentDto {
  filename: string;
  folderId: string;
}

interface UpdateDocumentDto {
  filename?: string;
  description?: string;
}

interface CreateDocumentRequest {
  filename: string;
  folderId: string;
}

interface DocumentResponse {
  id: string;
  filename: string;
  createdAt: Date;
}

// ❌ WRONG
interface CreateDocument { }     // Missing Dto
interface Document_Create { }    // Wrong format
interface DocumentCreate { }     // Ambiguous
```

## Error Classes

```
Suffix with 'Error'
```

```typescript
// ✅ CORRECT
class ValidationError extends Error { }
class AuthenticationError extends Error { }
class NotFoundError extends Error { }
class UnauthorizedError extends Error { }
class HttpError extends Error { }

// ❌ WRONG
class Validation { }             // Missing 'Error'
class AuthError extends Error { } // Too abbreviated
class NOT_FOUND { }              // Wrong format
```

## Describe Blocks (Tests)

```
Use present tense, describe what is being tested
```

```typescript
// ✅ CORRECT
describe('UserService', () => {
  describe('getUserById', () => {
    describe('when user exists', () => {
      it('should return the user', () => { });
    });

    describe('when user does not exist', () => {
      it('should throw NotFoundError', () => { });
    });
  });
});

// ❌ WRONG
describe('test user service', () => { });
describe('UserService Tests', () => { });
describe('When getting a user and it exists', () => { }); // Too specific in describe
```

## Test Case Names

```
Start with 'should', describe the behavior
```

```typescript
// ✅ CORRECT
it('should return user when user exists', () => { });
it('should throw error when user does not exist', () => { });
it('should create document with valid data', () => { });
it('should reject with 400 when filename is missing', () => { });
it('should update document and return new version', () => { });

// ❌ WRONG
it('tests if user exists', () => { });
it('getUser', () => { });
it('createDocument', () => { }); // Too vague
it('delete', () => { }); // Unclear what delete
```

## Query/Search Functions

```
Distinguish with specific verb prefixes
```

```typescript
// ✅ CORRECT
const getDocumentById = async (id: string) => { }        // Get single
const listDocuments = async (filters?) => { }            // Get multiple
const findDocumentsByStatus = async (status: string) => { } // Find with filter
const searchDocuments = async (query: string) => { }     // Full-text search
const countDocuments = async () => { }                   // Count total

// ❌ WRONG
const documents = async () => { }          // Unclear if single or multiple
const getDocuments = async () => { }       // Ambiguous (single vs multiple)
const queryDocuments = async () => { }     // Too generic
```

