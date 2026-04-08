# Skills Reference

This directory contains specialized documentation organized by topic. Load specific skills on-demand using:

```
/coding-standards      # Code patterns, architecture, layered structure
/testing-requirements  # Testing rules, patterns, coverage requirements
/security-guidelines   # Security best practices, input validation
/api-design-rules      # REST API design, responses, status codes
/naming-conventions    # File, class, function, and variable naming
/workflow-commands     # npm commands, development workflow
/pre-commit-checklist  # Pre-commit workflow and requirements
/error-handling        # Error handling patterns and HttpError usage
```

## 🎓 Getting Started

1. **First time?** → Read [USAGE-GUIDE.md](USAGE-GUIDE.md) for practical examples
2. **Need validation?** → Check [VALIDATION-REPORT.md](VALIDATION-REPORT.md) for completeness
3. **Quick question?** → See "When to Use Each Skill" section below
4. **Specific topic?** → Use links in the table below

## When to Use Each Skill

| Skill | Use When... |
|-------|-----------|
| **coding-standards** | Building features, creating services/controllers, architecture questions |
| **testing-requirements** | Writing tests, checking coverage, test patterns |
| **security-guidelines** | Handling user input, file uploads, authentication, security concerns |
| **api-design-rules** | Designing new endpoints, working with responses, status codes |
| **naming-conventions** | Naming variables, functions, files, interfaces |
| **workflow-commands** | Need to run commands, debugging, troubleshooting |
| **pre-commit-checklist** | Before committing code changes |
| **error-handling** | Raising errors, catching exceptions, logging |

## 📊 Skills Breakdown

### Size & Scope

Each skill file is self-contained and focused:
- Average size: 200-280 lines
- Format: Patterns + Examples + Dos and Don'ts
- No duplication - each addresses unique topic

### Content Quality

```
2,010+ lines of content
94/100 completeness score
✅ All mandatory requirements covered
✅ Comprehensive examples included
✅ No duplicated content across skills
```

See [VALIDATION-REPORT.md](VALIDATION-REPORT.md) for detailed assessment.

## 🔄 How This Works

### Load-on-Demand Model

**Session 1:**
```
→ Load CLAUDE.md (65 lines, ~1.5K tokens)
→ Load /coding-standards (180 lines, ~4K tokens)
→ Build your feature with guidance
→ Total: ~5.5K tokens for building
```

**Session 2:**
```
→ Load CLAUDE.md (65 lines, ~1.5K tokens)
→ Load /testing-requirements (220 lines, ~5K tokens)
→ Load /pre-commit-checklist (250 lines, ~5.5K tokens)
→ Write tests and commit
→ Total: ~12K tokens for testing/commit
```

Compare to old approach: **17.5K tokens every session regardless of task**.

## 🚀 Quick Reference

### Most Important Rules

1. **NO `any` types** - Use `unknown` with type guards (see `/coding-standards`)
2. **Business logic in services** - Never in controllers (see `/coding-standards`)
3. **Use HttpError** - For all API errors (see `/error-handling`)
4. **All code needs tests** - Minimum 70% coverage (see `/testing-requirements`)

### Quick Commands

```bash
npm run lint      # Check code quality
npm test          # Run all tests
npm run build     # Build project
npm run dev       # Start dev server
```

### Before Committing

```bash
npm run lint && npm test && npm run build
```

See `/pre-commit-checklist` for complete workflow.

## 📚 Recommended Reading Order

### For New Developers
1. This README
2. [USAGE-GUIDE.md](USAGE-GUIDE.md) - Practical scenarios
3. `/naming-conventions` - How we name things
4. `/coding-standards` - How we structure code
5. `/testing-requirements` - How we test

### For Code Review
1. `/coding-standards` - Architecture check
2. `/api-design-rules` - API design check
3. `/testing-requirements` - Test coverage check
4. `/security-guidelines` - Security check
5. `/naming-conventions` - Style check

### For Debugging
1. `/error-handling` - Understanding errors
2. `/workflow-commands` - Running debug tools
3. `/pre-commit-checklist` - Verifying fixes

### For Security-Sensitive Work
1. `/security-guidelines` - All security rules
2. `/coding-standards` - Patterns for safety
3. `/error-handling` - Secure error handling

## 📖 Detailed Documentation

### [USAGE-GUIDE.md](USAGE-GUIDE.md)
Practical examples for common scenarios:
- Implementing a new feature
- Fixing a bug
- Code review process
- Debugging production issues
- Quick naming questions
- Error handling examples
- Testing complex features
- Onboarding new developers

### [VALIDATION-REPORT.md](VALIDATION-REPORT.md)
Completeness assessment:
- Coverage by topic (94/100)
- Gap analysis
- Cross-reference checks
- Maintenance schedule
- Update guidelines

## ❓ Questions?

### "What skill covers X?"
→ Check "When to Use Each Skill" table above

### "How do I handle Y scenario?"
→ See [USAGE-GUIDE.md](USAGE-GUIDE.md) for practical examples

### "Is this skill complete?"
→ Check [VALIDATION-REPORT.md](VALIDATION-REPORT.md)

### "For complete details?"
→ See AGENTS.md (master reference)

### "For quick overview?"
→ See CLAUDE.md (minimalist version)

## 📂 File List

```
docs/skills/
├── README.md                    ← You are here
├── USAGE-GUIDE.md              ← Practical examples
├── VALIDATION-REPORT.md        ← Completeness check
├── CODING-STANDARDS.md         ← Architecture & patterns
├── TESTING-REQUIREMENTS.md     ← Testing & coverage
├── SECURITY-GUIDELINES.md      ← Security best practices
├── API-DESIGN-RULES.md         ← REST API design
├── NAMING-CONVENTIONS.md       ← Naming standards
├── WORKFLOW-COMMANDS.md        ← npm & git commands
├── PRE-COMMIT-CHECKLIST.md     ← Pre-commit workflow
└── ERROR-HANDLING.md           ← Error patterns
```

## 🎯 Success Criteria

After reading relevant skills, you should be able to:
- ✅ Know where to put code (controller/service/model)
- ✅ Name files and functions correctly
- ✅ Write tests for your code
- ✅ Handle errors properly
- ✅ Design secure APIs
- ✅ Run commands for linting/testing
- ✅ Know what to do before committing

## 💡 Pro Tips

1. **Use Ctrl+F** to search within a skill
2. **Bookmark skills** for quick access
3. **Reference skills in PRs** ("See `/coding-standards` pattern section")
4. **Start with README** to understand structure
5. **Check USAGE-GUIDE** for your specific scenario

---

**Last Updated:** 2026-04-08
**Total Content:** 2,010+ lines
**Completeness Score:** 94/100
**Status:** ✅ Ready for Production

