# Claude Agent Instructions

This file contains instructions for AI coding agents (Claude) working on the CloudDocs API Service.

## Primary Rules Document

**READ AND FOLLOW ALL RULES IN `AGENTS.md`**

The `AGENTS.md` file contains the complete set of coding standards, patterns, and requirements for this project. All rules defined there are mandatory.

## Key Reminders for Claude

1. **Type Safety**: Never use `any` type - use `unknown` with type guards or specific types
2. **Architecture**: Follow layered architecture (Routes → Controllers → Services → Models)
3. **Error Handling**: Always use `HttpError` for API errors with proper status codes
4. **Testing**: All code changes must include tests and pass `npm test`
5. **Security**: Validate all inputs, sanitize paths, never trust user data
6. **Async/Await**: Use proper try-catch blocks, no sync operations in request handlers
7. **Naming**: Follow conventions in AGENTS.md (kebab-case files, camelCase functions, etc.)
8. **Business Logic**: Keep it in services, not controllers

## Before Committing

- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No `any` types in code
- [ ] Error handling with HttpError
- [ ] Following layered architecture
- [ ] Code coverage maintained or increased

## Reference

See `AGENTS.md` for complete documentation of:

- Project structure
- Code patterns and examples
- Testing requirements
- API design rules
- Security guidelines
- Pre-commit checklist
