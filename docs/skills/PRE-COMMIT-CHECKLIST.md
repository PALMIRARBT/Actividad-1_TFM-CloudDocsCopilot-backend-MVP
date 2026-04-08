# Pre-Commit Checklist

Complete checklist before committing any code changes to the repository.

## Mandatory Pre-Commit Steps

Run these commands in order. **All must pass or STOP - do not commit.**

### Step 1: Linting (Type Safety & Code Quality)

```bash
npm run lint
```

**What it checks:**
- ❌ NO `any` types (use `unknown` with type guards)
- ❌ No unused variables
- ❌ Type safety violations
- ❌ Code style inconsistencies

**If it fails:**
```bash
# Auto-fix what can be fixed
npm run lint:fix

# Review remaining issues manually
npm run lint

# Fix the issues and run again
npm run lint
```

**Stop here if lint still fails. Do not proceed to testing.**

### Step 2: Testing

```bash
npm test
```

**What it checks:**
- All tests pass
- No broken functionality
- Code coverage maintained

**If it fails:**
```bash
# See which tests are failing
npm test -- --verbose

# Run in watch mode to fix incrementally
npm run test:watch

# Once fixed, run full suite
npm test
```

**Coverage requirements:**
- Minimum overall: 70%
- New code: >80%
- Critical paths: >90%

**Check coverage:**
```bash
npm run test:coverage
# View report: coverage/lcov-report/index.html
```

**Stop here if tests fail. Do not proceed to build.**

### Step 3: Build

```bash
npm run build
```

**What it checks:**
- TypeScript compilation succeeds
- No type errors
- Output is correct

**If it fails:**
```bash
# See detailed errors
npm run build -- --verbose

# Clean and retry
npm run clean
npm run build
```

**Stop here if build fails. Do not commit.**

## Code Review Checklist

After automated checks pass, review your code:

### Architecture
- [ ] Business logic is in services, not controllers
- [ ] Controllers only handle HTTP concerns
- [ ] Middlewares are used appropriately
- [ ] Database access only in services
- [ ] Error handling uses HttpError

### Type Safety
- [ ] No `any` types in code
- [ ] All function parameters are typed
- [ ] All return types are explicit
- [ ] No implicit `any` from third-party types

### Testing
- [ ] New features have tests
- [ ] Bug fixes include regression tests
- [ ] Tests have descriptive names
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] No skipped tests (`.skip`, `.only`)

### Security
- [ ] User input is validated
- [ ] Sensitive data not logged
- [ ] No hardcoded secrets/passwords
- [ ] .env files not committed
- [ ] Routes are protected with auth middleware

### Documentation
- [ ] Code has comments for complex logic
- [ ] API endpoints documented in OpenAPI spec
- [ ] README updated if added new features
- [ ] Breaking changes noted

### Performance
- [ ] No N+1 database queries
- [ ] Appropriate indexes used
- [ ] No unnecessary loops or operations
- [ ] File operations are async

## Pre-Commit Script

Create a bash script to automate checks:

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "════════════════════════════════════════"
echo "🔍 Running Pre-Commit Checks"
echo "════════════════════════════════════════"

# Step 1: Linting
echo ""
echo "1️⃣ Linting (checking type safety)..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed! Fix issues and try again."
  exit 1
fi
echo "✅ Linting passed"

# Step 2: Testing
echo ""
echo "2️⃣ Running tests..."
npm test -- --coverage
if [ $? -ne 0 ]; then
  echo "❌ Tests failed! Fix issues and try again."
  exit 1
fi
echo "✅ Tests passed"

# Step 3: Build
echo ""
echo "3️⃣ Building project..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed! Fix issues and try again."
  exit 1
fi
echo "✅ Build passed"

echo ""
echo "════════════════════════════════════════"
echo "✅ All checks passed! Ready to commit"
echo "════════════════════════════════════════"
exit 0
```

**Install the hook:**
```bash
chmod +x .git/hooks/pre-commit
```

## What NOT to Commit

**Never commit these files:**

```
.env                     # Environment variables with secrets
.env.local              # Local environment overrides
.env.*.local            # Environment files
node_modules/           # Dependencies (use package-lock.json)
dist/                   # Build output
coverage/               # Test coverage reports
.DS_Store               # macOS files
*.log                   # Log files
*.swp, *.swo            # Vim swap files
.idea/                  # IDE files
.vscode/                # VSCode settings (use .vscode/*.recommended)
```

**Verify before commit:**
```bash
# See what files will be committed
git status

# See the actual changes
git diff --cached

# Remove accidental files from staging
git reset filename

# Remove file from tracking but keep locally
git rm --cached filename
```

## Commit Message Format

**Use clear, descriptive commit messages:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(auth): add JWT token refresh endpoint

Implement automatic token refresh mechanism for better UX.
Tokens now refresh 5 minutes before expiration.

Closes #123

---

fix(document): prevent race condition on concurrent uploads

Use MongoDB transactions to ensure atomic document creation.
Added regression test for concurrent upload scenario.

Closes #456

---

test(auth): improve test coverage to 95%

Added tests for edge cases in password validation.

---

docs: update API documentation for new endpoints

Added OpenAPI spec for document export functionality.
```

## Post-Commit Verification

After committing, verify everything looks good:

```bash
# See your commit
git show

# See recent commits
git log --oneline -5

# Verify nothing is uncommitted
git status
# Should show: "nothing to commit, working tree clean"
```

## Emergency: Fix Recent Commit

If you forgot something:

```bash
# Add more changes
git add missed-file.ts

# Amend the last commit (don't create new commit)
git commit --amend --no-edit

# If commit is already pushed, force push (⚠️ use with caution)
git push --force-with-lease
```

## Manual Review Checklist

Before pushing to review:

- [ ] All automated checks pass (`npm run lint && npm test && npm run build`)
- [ ] Code follows project patterns and conventions
- [ ] New features have tests with >80% coverage
- [ ] Bug fixes have regression tests
- [ ] Error handling uses HttpError
- [ ] Security: no hardcoded secrets, input validated
- [ ] Performance: no N+1 queries, async operations used
- [ ] No `any` types in code
- [ ] Business logic only in services
- [ ] Commit message is clear and descriptive
- [ ] Related issue numbers are referenced
- [ ] No debug console.log statements left in code

