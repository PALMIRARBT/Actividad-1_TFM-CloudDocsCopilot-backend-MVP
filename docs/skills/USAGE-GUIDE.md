# Skills Usage Guide - Practical Examples

This guide shows how to use the skills during real development scenarios.

---

## 📋 Scenario 1: Implementing a New Feature

**Goal:** Add a document sharing feature to the API

### Step 1: Understanding the Architecture
**Load:** `/coding-standards`
- Review Services pattern
- Review Controllers pattern
- Understand layered architecture
- Check type safety rules

**What you'll do:**
```typescript
// Service (business logic)
documentService.shareDocument(documentId, sharedWith)

// Controller (HTTP handler)
shareController.share(req, res, next)

// Route (HTTP endpoint)
router.post('/documents/:id/share', ...)
```

### Step 2: Designing the API Endpoint
**Load:** `/api-design-rules`
- Choose HTTP method and status codes
- Design request/response format
- Plan pagination/filtering if needed

**What you'll design:**
```typescript
POST /api/documents/:id/share
Request: { userId: string, permission: 'view' | 'edit' }
Response 201: { success: true, data: { sharedWith: [...] } }
Response 400: { success: false, error: "Invalid permission" }
Response 404: { success: false, error: "Document not found" }
```

### Step 3: Naming Your Files and Functions
**Load:** `/naming-conventions`
- Check file naming (kebab-case): `share.service.ts`, `share.controller.ts`
- Check function naming (camelCase): `shareDocument`, `getSharePermissions`
- Check interface naming (I + PascalCase): `ISharePermission`

### Step 4: Writing Tests
**Load:** `/testing-requirements`
- Create unit tests for service
- Create integration tests for API endpoint
- Use builders for test data
- Ensure >80% coverage on new code

**Test structure:**
```typescript
tests/
├── unit/services/
│   └── share.service.test.ts
└── integration/
    └── share.routes.test.ts
```

### Step 5: Security Review
**Load:** `/security-guidelines`
- Validate user input (userId, permission)
- Check authorization (user can only share own documents)
- Sanitize any file paths if involved
- Add proper auth middleware

### Step 6: Error Handling
**Load:** `/error-handling`
- Use HttpError for all errors
- Implement proper status codes
- Log errors safely (no sensitive data)

```typescript
throw new HttpError(404, 'Document not found');
throw new HttpError(403, 'You cannot share this document');
throw new HttpError(400, 'Invalid permission value');
```

### Step 7: Before Committing
**Load:** `/pre-commit-checklist`
- Run `npm run lint`
- Run `npm test`
- Run `npm run build`
- Manual review of architecture
- Verify tests coverage

---

## 📋 Scenario 2: Fixing a Bug in Document Upload

**Goal:** Fix a race condition during concurrent document uploads

### Step 1: Understand Where the Bug Is
**Load:** `/coding-standards` + `/security-guidelines`
- Check if logic is in the right place (service, not controller)
- Review how file uploads are handled
- Check for transaction patterns

### Step 2: Write Regression Test FIRST
**Load:** `/testing-requirements`
- Create a test that reproduces the bug
- Name it clearly: "should handle concurrent uploads without race condition"
- Use builders to create test data

```typescript
it('should prevent database conflicts on concurrent uploads', async () => {
  // Arrange - two concurrent uploads
  const user = await UserBuilder.create();
  const folder = await FolderBuilder.create({ owner: user });

  // Act - upload simultaneously
  const [doc1, doc2] = await Promise.all([
    documentService.create({ userId: user._id, ... }),
    documentService.create({ userId: user._id, ... })
  ]);

  // Assert - both should be created without conflicts
  expect(doc1).toBeDefined();
  expect(doc2).toBeDefined();
});
```

### Step 3: Fix the Bug
**Load:** `/coding-standards` + `/error-handling`
- Implement the fix in the service
- Use proper error handling with HttpError
- Ensure transactions if needed

### Step 4: Verify Fix
**Load:** `/workflow-commands`
```bash
npm run test:watch              # Run tests in watch mode
npm test -- --testNamePattern="concurrent" # Run specific test
npm run test:coverage          # Check coverage didn't drop
```

### Step 5: Review and Commit
**Load:** `/pre-commit-checklist`
- Regression test green? ✅
- Existing tests still pass? ✅
- Code follows patterns? ✅
- Coverage maintained? ✅
- Security review done? ✅

---

## 📋 Scenario 3: Code Review of a PR

**Goal:** Review a team member's pull request

### Step 1: Architecture Review
**Load:** `/coding-standards`
- Is business logic in services?
- Are controllers just HTTP handlers?
- Are middlewares used correctly?
- Is type safety followed (no `any` types)?

### Step 2: API Design Review
**Load:** `/api-design-rules`
- Are endpoints RESTful?
- Is response format consistent?
- Are status codes correct?
- Pagination/filtering implemented correctly?

### Step 3: Naming Review
**Load:** `/naming-conventions`
- Are files kebab-case?
- Are functions camelCase?
- Are interfaces I + PascalCase?
- Are constants SCREAMING_SNAKE_CASE?

### Step 4: Testing Review
**Load:** `/testing-requirements`
- Tests included for all changes?
- Coverage >80% for new code?
- Test names descriptive?
- Builders used for test data?

### Step 5: Security Review
**Load:** `/security-guidelines`
- User input validated?
- Sensitive data not logged?
- No hardcoded secrets?
- Proper auth middleware applied?

### Step 6: Error Handling Review
**Load:** `/error-handling`
- HttpError used for errors?
- Status codes appropriate?
- Errors logged safely?
- No stack traces exposed?

### Step 7: Checklist Review
**Load:** `/pre-commit-checklist`
- All automated checks pass?
- No debug console.log statements?
- Commit message clear?
- Related issues referenced?

---

## 📋 Scenario 4: Debugging a Production Issue

**Goal:** Fix a "500 Internal Server Error" in production

### Step 1: Find the Error
**Load:** `/workflow-commands`
```bash
npm run dev              # Start dev server
# Check console for error messages
npm test -- --verbose   # Run tests in verbose mode
```

### Step 2: Understand Error Handling
**Load:** `/error-handling`
- Is HttpError thrown correctly?
- Are errors logged with context?
- Is error middleware working?
- What status code should it return?

### Step 3: Add Better Logging
**Load:** `/error-handling` (Logging section)
```typescript
logger.error('Document processing failed', {
  userId: req.user.id,
  documentId: documentId,
  error: error instanceof Error ? error.message : 'Unknown',
  timestamp: new Date()
});
```

### Step 4: Fix the Issue
**Load:** `/coding-standards`
- Keep fix in the right layer (service/controller)
- Use proper error handling
- Don't add workarounds, fix the root cause

### Step 5: Create Regression Test
**Load:** `/testing-requirements`
- Write test that would catch this bug
- Ensure test fails without fix, passes with fix

### Step 6: Pre-Commit Before Deploying Fix
**Load:** `/pre-commit-checklist`
```bash
npm run lint && npm test && npm run build
```

---

## 📋 Scenario 5: Quick Naming Question

**During development, you ask:** "How should I name this utility function?"

**Load:** `/naming-conventions`

**Answer:**
```typescript
// It converts PDF to text
// Should be camelCase for functions
export const pdfToText = async (buffer: Buffer): Promise<string> => {
  // ...
};

// File should be kebab-case
// src/utils/pdf-to-text.util.ts

// Type for the function parameters
interface IPdfToTextOptions {
  language?: string;
  removeImages?: boolean;
}
```

---

## 📋 Scenario 6: "How Do I Handle This Error?"

**During development, you ask:** "User uploaded invalid file type"

**Load:** `/error-handling` + `/security-guidelines`

**Answer:**
```typescript
export const uploadService = {
  async uploadDocument(file: Express.Multer.File, userId: string) {
    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new HttpError(400, 'Invalid file type');
    }

    // Continue with upload...
  }
};

// In controller:
try {
  const document = await uploadService.uploadDocument(req.file, req.user.id);
  res.status(201).json({ success: true, data: document });
} catch (error) {
  next(error); // Error middleware handles HttpError
}
```

---

## 📋 Scenario 7: Testing a Complex Feature

**Goal:** Test a document search with filters, pagination, and sorting

### Load These Skills:

1. **`/testing-requirements`** - Test structure and patterns
2. **`/api-design-rules`** - Query parameter design
3. **`/coding-standards`** - Service patterns

### Example Test:

```typescript
describe('DocumentService.search', () => {
  it('should return paginated filtered results sorted correctly', async () => {
    // Arrange
    const user = await UserBuilder.create();
    const docs = await DocumentBuilder.createMany(25, { owner: user });

    // Act
    const result = await documentService.search({
      query: 'invoice',
      status: 'active',
      sort: '-createdAt',
      page: 2,
      limit: 10
    });

    // Assert
    expect(result.data).toHaveLength(10);
    expect(result.pagination.page).toBe(2);
    expect(result.data[0].createdAt).toBeGreaterThan(result.data[1].createdAt);
  });
});
```

---

## 📋 Scenario 8: Onboarding a New Developer

**As a team lead, you say:** "Read these skills to understand how we work"

1. **`/coding-standards`** - "This is how we structure code"
2. **`/naming-conventions`** - "This is how we name things"
3. **`/testing-requirements`** - "This is how we test"
4. **`/api-design-rules`** - "This is how we design APIs"
5. **`/pre-commit-checklist`** - "This is before you commit"
6. **`/workflow-commands`** - "These are our commands"

**Optional deep dives:**
- `/security-guidelines` - For security-sensitive features
- `/error-handling` - For understanding error flow
- `/coding-standards` - For advanced patterns

---

## 🎯 Quick Reference: Which Skill When?

### 🏗️ Architecture / Patterns
→ `/coding-standards`

### 🧪 Testing / Coverage
→ `/testing-requirements`

### 🔒 Security / Validation
→ `/security-guidelines`

### 🌐 API / Endpoints
→ `/api-design-rules`

### 📝 Naming / Conventions
→ `/naming-conventions`

### 💻 Commands / Development
→ `/workflow-commands`

### ✅ Before Commit
→ `/pre-commit-checklist`

### 🚨 Errors / Exceptions
→ `/error-handling`

### ❓ Getting Started
→ `docs/skills/README.md`

---

## 💡 Pro Tips

### Tip 1: Bookmark Skills in Browser
Add bookmarks to:
- `docs/skills/` folder
- Each individual skill

### Tip 2: Use CMD+F to Search
Within a skill, press Ctrl+F (or Cmd+F) to search for:
- "status codes" in `/api-design-rules`
- "bcrypt" in `/security-guidelines`
- "coverage" in `/testing-requirements`

### Tip 3: Read README First
Start with `docs/skills/README.md` for:
- What each skill covers
- When to use each skill
- Navigation guide

### Tip 4: Reference in Code Reviews
```markdown
# PR Comment Example:

Please review the error handling pattern in `/error-handling`
section "Validation with express-validator". This PR should:
1. Use HttpError instead of throwing raw errors
2. Include proper status codes
3. Log safely without exposing details
```

### Tip 5: Link in CLAUDE.md
Your minimalist CLAUDE.md has the quick reference:
```
/coding-standards      # Load this skill for patterns
/testing-requirements  # Load this skill for tests
etc.
```

---

## 🎓 Learning Path

**If you're new to the project:**

```
Day 1:
  └─ Read: docs/skills/README.md
  └─ Skim: /coding-standards intro

Day 2:
  └─ Read: /naming-conventions
  └─ Read: /coding-standards (full)

Day 3:
  └─ Read: /testing-requirements
  └─ Read: /api-design-rules

Day 4:
  └─ Read: /security-guidelines
  └─ Read: /error-handling

Day 5:
  └─ Read: /workflow-commands
  └─ Read: /pre-commit-checklist
  └─ Ready to code!
```

**If you're working on a specific task:**

```
Implementing a feature?
  └─ /coding-standards → /api-design-rules → /testing-requirements

Fixing a bug?
  └─ /testing-requirements → /error-handling → /pre-commit-checklist

Security-sensitive work?
  └─ /security-guidelines → /coding-standards → /testing-requirements

Before commit?
  └─ /pre-commit-checklist → /workflow-commands
```

