# GitHub Copilot Instructions

Quick reference for GitHub Copilot working on the CloudDocs API Backend.

## 📋 Primary Documentation

**All detailed rules are in:**
- **`CLAUDE.md`** - Main instructions and critical rules
- **`AGENTS.md`** - Master reference with complete patterns
- **`docs/skills/`** - Specialized skills for specific topics

This file provides a quick summary. For details, see the files above.

## 🎯 Project

- **Type:** Node.js REST API Backend
- **Stack:** TypeScript 5.x, Express.js, MongoDB (Mongoose)
- **Architecture:** Layered (Routes → Controllers → Services → Models)

## ⚠️ Critical Rules

1. ❌ **NO `any` types** → Use `unknown` with type guards
2. ❌ **NO business logic in controllers** → Business logic in services
3. ❌ **NO unhandled errors** → Use HttpError for all API errors
4. ❌ **NO code without tests** → Minimum 70% coverage

## 📚 Quick Skills Reference

Load specific documentation as needed:
- `/coding-standards` → Patterns, architecture, layered structure
- `/testing-requirements` → Testing rules and patterns
- `/security-guidelines` → Security best practices
- `/api-design-rules` → REST API design rules
- `/naming-conventions` → Naming standards
- `/workflow-commands` → npm commands
- `/pre-commit-checklist` → Pre-commit workflow
- `/error-handling` → Error handling patterns

## 🚀 Essential Commands

```bash
npm run lint      # Check code quality (fails on any types)
npm test          # Run all tests
npm run build     # Build project
```

## 🔗 Full Documentation

See `CLAUDE.md` for quick reference or `AGENTS.md` for complete master reference.

---

**Note:** This file is kept minimal. For complete detailed patterns and examples, refer to the documentation files and skills listed above.
