# Workflow Commands

NPM commands and development workflow for CloudDocs API backend.

## Essential Commands

### Linting & Code Quality

```bash
# Check linting errors and warnings
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Strict linting check (zero tolerance for warnings, for CI/CD)
npm run lint:check
```

**Remember:** ESLint will FAIL your build if you have `any` types. Use `unknown` with type guards instead.

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run specific test file
npm test -- tests/unit/services/auth.service.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should create"

# Generate coverage report
npm run test:coverage

# Run tests with verbose output
npm test -- --verbose
```

**Coverage Requirements:**
- Minimum overall: 70%
- New code: >80%
- Critical paths (auth, payments): >90%

### Building

```bash
# Build TypeScript to JavaScript
npm run build

# Build with source maps (for debugging)
npm run build:watch

# Clean build artifacts
npm run clean
```

### Development Server

```bash
# Start development server (with auto-reload on file changes)
npm run dev

# Start production server
npm start

# Start with debugging enabled
npm run debug
```

## Pre-Commit Workflow

Always run these commands BEFORE committing:

```bash
# 1. Check code quality
npm run lint

# 2. Run all tests
npm test

# 3. Build project
npm run build

# 4. Optionally check coverage
npm run test:coverage
```

**If any command fails, fix the issues before committing.**

### Complete Pre-Commit Script

```bash
#!/bin/bash
# Run this before commit

echo "🔍 Linting..."
npm run lint || exit 1

echo "🧪 Testing..."
npm test || exit 1

echo "🔨 Building..."
npm run build || exit 1

echo "✅ All checks passed!"
```

## Git Workflow

### Create a Branch

```bash
# Create and switch to new branch
git checkout -b feature/my-feature

# Or use newer git syntax
git switch -c feature/my-feature
```

Branch naming convention: `feature/`, `fix/`, `docs/`, `refactor/`, etc.

### Commit Changes

```bash
# Stage files
git add src/controllers/document.controller.ts src/services/document.service.ts

# Commit with message
git commit -m "feat: add document export functionality"

# Or use interactive staging
git add -p
```

### Push & Create PR

```bash
# Push branch to remote
git push -u origin feature/my-feature

# Create pull request (if using GitHub CLI)
gh pr create --title "Add document export" --body "Allows users to export documents to PDF"
```

## Typical Development Session

```bash
# 1. Start with latest main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes and frequently check
npm run test:watch          # Keep tests running in another terminal
npm run dev                 # Keep dev server running

# 4. Before committing
npm run lint && npm test && npm run build

# 5. Commit and push
git add .
git commit -m "feat: implement new feature"
git push -u origin feature/my-feature

# 6. Create PR and await review
```

## Debugging

### Debug with Node Inspector

```bash
# Start with debugger enabled
npm run debug

# Then open in Chrome: chrome://inspect
```

### View Console Logs

```bash
# Node logs
# Look in terminal where npm run dev or npm start is running
```

### Debug Tests

```bash
# Run specific test with debugging
node --inspect-brk node_modules/.bin/jest tests/unit/services/auth.service.test.ts

# Access debugger at: chrome://inspect
```

### View ESLint Violations

```bash
# Show all violations
npm run lint

# Auto-fix what can be fixed
npm run lint:fix

# Check only warnings (not errors)
npm run lint -- --max-warnings 0
```

## Database Operations

### MongoDB

```bash
# Start MongoDB (if running locally)
mongod

# MongoDB Shell
mongosh

# Connect to specific database
mongosh --uri mongodb://localhost:27017/clouddocs
```

### Migrations

```bash
# Run migrations
npm run migrate:up

# Rollback migrations
npm run migrate:down
```

## Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Build the project
npm run build

# Run database migrations
npm run migrate:up

# Start development server
npm run dev
```

## Performance Optimization

```bash
# Check bundle size
npm run analyze

# Generate performance report
npm run perf:report

# Check for unused dependencies
npm run audit

# Update dependencies
npm update
```

## Docker Commands (if applicable)

```bash
# Build Docker image
docker build -t clouddocs-api .

# Run container
docker run -p 3000:3000 clouddocs-api

# View logs
docker logs <container-id>

# Stop container
docker stop <container-id>
```

## Useful npm Shortcuts

```bash
# Clear npm cache
npm cache clean --force

# Install dependencies
npm install

# Install specific package
npm install package-name

# Install as dev dependency
npm install --save-dev package-name

# Remove package
npm uninstall package-name

# List installed packages
npm list

# Check outdated packages
npm outdated

# Run custom scripts from package.json
npm run <script-name>
```

## Troubleshooting

### Tests not running?

```bash
npm test -- --clearCache
npm test -- --no-coverage
```

### Linting errors won't fix?

```bash
npm run lint:fix
# If still failing, review manually:
npm run lint
```

### Build fails?

```bash
npm run clean
npm run build -- --verbose
```

### Port already in use?

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3001 npm run dev
```

### Module not found?

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

