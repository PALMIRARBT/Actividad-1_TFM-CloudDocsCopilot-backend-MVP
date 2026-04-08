# Claude Instructions

Backend API Service for CloudDocs - Minimalist Quick Reference

## 🎯 Project Context

- **Type:** Backend REST API Service
- **Stack:** Node.js 20+, Express.js, TypeScript 5.x, MongoDB (Mongoose), Elasticsearch
- **Architecture:** Layered (Routes → Controllers → Services → Models)

## ⚠️ Critical Rules (Zero Tolerance)

1. **NO `any` types** - Use `unknown` with type guards
2. **Business logic in services only** - Controllers delegate to services
3. **Use HttpError** for all API errors
4. **All code must have tests** - Minimum 70% coverage

## 📚 Available Skills

Run these to load specific documentation in context:

```
/coding-standards      # Code patterns, architecture, layered structure
/testing-requirements  # Testing rules, patterns, coverage requirements
/security-guidelines   # Security rules, input validation, file uploads
/api-design-rules      # REST API design, status codes, responses
/naming-conventions    # File, class, function, and variable naming
/workflow-commands     # NPM commands, development workflow
/pre-commit-checklist  # Pre-commit workflow and checklist
/error-handling        # Error handling patterns and HttpError usage
```

## 🚀 Quick Commands

```bash
# Before ANY commit
npm run lint          # Check code quality (fails on any types)
npm test              # Run all tests
npm run build         # Build project

# Development
npm run dev           # Start dev server
npm run test:watch    # Tests in watch mode
npm run lint:fix      # Auto-fix linting issues
```

## 📁 Project Structure

```
src/
├── configurations/    # External service configs
├── controllers/       # HTTP handlers (validate & delegate)
├── middlewares/       # Auth, CSRF, validation
├── models/           # Mongoose schemas + TS interfaces
├── routes/           # Express route definitions
├── services/         # Business logic
├── utils/            # Helper functions
├── mail/             # Email service
└── docs/             # OpenAPI specification
```

## 💾 Master Reference

For complete rules and patterns, see:
- **`AGENTS.md`** - Complete master reference (read this for details)
- **Individual skills** - Load specific skills above as needed

---

**Note:** This file is kept minimal to reduce context overhead. Use skills to load specific documentation as needed.
