# Frontend Skills Strategy - Implementation Prompt

**Target:** CloudDocs Frontend React/Vue/Angular Project

---

## 📋 Context: What Was Done in Backend

The backend (Node.js/Express) project was refactored to use a **skills-based documentation strategy** to reduce context overhead:

### Backend Implementation Results

**Before:**
- CLAUDE.md: 177 lines
- AGENTS.md: 352 lines
- copilot-instructions.md: 259 lines
- Total loaded every session: ~800 lines

**After:**
- CLAUDE.md: ~65 lines (63% reduction)
- Created 8 specialized skills in `docs/skills/`
- Each skill loads on-demand when needed
- Base context reduced by ~60%

**Skills Created:**
1. CODING-STANDARDS.md
2. TESTING-REQUIREMENTS.md
3. SECURITY-GUIDELINES.md
4. API-DESIGN-RULES.md
5. NAMING-CONVENTIONS.md
6. WORKFLOW-COMMANDS.md
7. PRE-COMMIT-CHECKLIST.md
8. ERROR-HANDLING.md

---

## 🎯 Goal: Apply Same Strategy to Frontend

Implement an equivalent skills-based documentation structure for the frontend project to achieve:
- ✅ Reduced base context (40-50% reduction)
- ✅ Better organization and maintenance
- ✅ On-demand skill loading
- ✅ Clearer developer experience

---

## 🏗️ Frontend Skills Strategy

### Step 1: Audit Current Documentation

**If you have these files, evaluate their content:**
- `CONTRIBUTING.md` (if exists)
- `README.md`
- `.github/CONTRIBUTING.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `docs/` directory (if exists)
- Any `DEVELOPER.md`, `ARCHITECTURE.md`, etc.

**Extract content into these skill categories:**

### Step 2: Create Frontend-Specific Skills

Based on React/Vue/Angular frontend, create skills at `src/docs/skills/` (or `docs/skills/`):

#### 1. **COMPONENT-ARCHITECTURE.md**
Extract from: CONTRIBUTING.md, ARCHITECTURE.md, README
- Component structure (functional vs class components, hooks usage)
- Container vs presentational components
- State management approach (Redux, Context, Vuex, etc.)
- Props drilling vs prop passing patterns
- Component composition patterns
- Directory structure for components

**Example sections:**
```markdown
# Component Architecture

## Directory Structure
src/components/
├── common/           # Reusable UI components
├── features/         # Feature-specific components
├── layouts/          # Page layouts
└── hooks/            # Custom React hooks (if applicable)

## Component Pattern
- Use functional components with hooks
- Keep components focused and single-responsibility
- Export both component and individual exports
- Use TypeScript for prop types

## Props vs State
- Props: data passed down, never modify
- State: component-level state, use hooks
- Context: shared state across tree
```

#### 2. **STATE-MANAGEMENT.md**
Extract from: ARCHITECTURE.md, README, any Redux/Vuex docs
- Centralized state management (Redux, Context, Recoil, Pinia, etc.)
- Store structure and organization
- Actions, reducers, mutations patterns
- Side effects handling (middleware, saga, effects)
- Async data fetching patterns

**Example sections:**
```markdown
# State Management

## Architecture
[How state is organized]

## Patterns
[Action creators, reducers, selectors]

## Async Data Flow
[API calls, pending/error states]
```

#### 3. **STYLING-CONVENTIONS.md**
Extract from: CONTRIBUTING.md, any style guide
- CSS-in-JS vs CSS/SCSS vs Tailwind conventions
- Component-level styling approach
- Responsive design breakpoints
- Color palette and design tokens
- CSS naming conventions (BEM, camelCase, etc.)

**Example sections:**
```markdown
# Styling Conventions

## Approach
[Tailwind/Styled-Components/CSS Modules/etc.]

## Naming
[Class naming conventions]

## Responsive
[Breakpoint system]

## Design Tokens
[Colors, spacing, typography]
```

#### 4. **TESTING-PATTERNS.md**
Extract from: test setup, CONTRIBUTING.md, testing guidelines
- Unit test patterns (Jest, Vitest)
- Component testing (React Testing Library, Vue Test Utils)
- Integration test patterns
- E2E testing (Cypress, Playwright)
- Test file organization
- Mock patterns
- Coverage requirements

**Include:**
```markdown
# Testing Patterns

## Unit Tests
[Service/utility tests]

## Component Tests
[Component rendering and interaction tests]

## E2E Tests
[User flow testing]

## File Structure
tests/
├── unit/           # Utilities, services
├── components/     # Component tests
├── integration/    # Feature flow tests
└── e2e/           # Full user journeys
```

#### 5. **API-INTEGRATION.md**
Extract from: ARCHITECTURE.md, any API docs
- API client setup (axios, fetch, etc.)
- Request/response patterns
- Error handling
- Authentication patterns (JWT tokens)
- CORS handling
- AbortController/cancellation patterns
- Typing API responses (TypeScript)

**Example sections:**
```markdown
# API Integration

## Client Setup
[How to initialize API client]

## Request Patterns
[How to structure API calls]

## Error Handling
[Global error handling]

## Authentication
[JWT token management, refresh]
```

#### 6. **TYPESCRIPT-CONVENTIONS.md**
Extract from: CONTRIBUTING.md, any TypeScript guide, tsconfig.json
- Type definitions and interfaces
- Generic types patterns
- Prop types definition (Interface vs Type)
- Common type patterns
- Avoid `any` rules (if applicable)
- Typing props, state, and events

**Example sections:**
```markdown
# TypeScript Conventions

## Type Definitions
[Interface vs Type usage]

## Component Props
[How to type props]

## Event Handlers
[How to type events]

## Common Patterns
[Generic components, utility types]
```

#### 7. **NAMING-CONVENTIONS.md**
Extract from: CONTRIBUTING.md, style guide
- File naming (components, utils, hooks, constants)
- Variable naming (camelCase, SCREAMING_SNAKE_CASE)
- Function naming (get*, set*, handle*, on*)
- Component naming (PascalCase)
- Folder naming conventions
- Test file naming

**Example sections:**
```markdown
# Naming Conventions

## Files
| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase | Button.tsx, UserCard.jsx |
| Hook | camelCase + use | useAuth.ts, useFetch.ts |
| Util | camelCase | helpers.ts, validators.ts |
| Constant | SCREAMING_SNAKE_CASE | API_BASE_URL, MAX_RETRIES |
| Test | *.test.ts or *.spec.ts | Button.test.tsx |

## Variables
[Variable naming patterns]

## Event Handlers
[onClick, onChange patterns: handle*, on*]
```

#### 8. **DEVELOPMENT-WORKFLOW.md**
Extract from: README.md, CONTRIBUTING.md, package.json scripts
- Dev server startup
- Build commands
- Test commands
- Debugging tools
- Browser DevTools setup
- Storybook (if used)
- Hot reload/HMR
- Environment variables

**Example sections:**
```markdown
# Development Workflow

## Commands
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm test           # Run tests
npm run test:watch # Watch mode
npm run lint       # Check code quality
npm run type-check # Type checking
```

## Tools
[VSCode extensions, DevTools setup]

## Debugging
[How to debug components]
```

#### 9. **PERFORMANCE-BEST-PRACTICES.md**
Extract from: ARCHITECTURE.md, any perf guidelines
- Code splitting and lazy loading
- Memoization (React.memo, useMemo, useCallback)
- Image optimization
- Bundle analysis
- Lighthouse metrics
- CSS/JS optimizations
- Virtual scrolling for large lists

#### 10. **ACCESSIBILITY-GUIDELINES.md**
Extract from: README, CONTRIBUTING, any WCAG guidelines
- ARIA attributes usage
- Keyboard navigation
- Screen reader testing
- Color contrast
- Semantic HTML
- Testing for accessibility

#### 11. **ERROR-HANDLING.md**
Extract from: docs, code patterns
- Error boundary patterns
- Global error handling
- User-facing error messages
- Error logging
- Network error handling
- Validation error patterns

#### 12. **CODE-REVIEW-CHECKLIST.md**
Extract from: PR template, CONTRIBUTING.md
- Pre-PR checklist
- Code review criteria
- Common mistakes to avoid
- Performance checks
- Accessibility checks
- Testing requirements

---

## 📁 Frontend Project Structure After Refactoring

```
frontend-project/
├── src/
├── docs/
│   └── skills/
│       ├── COMPONENT-ARCHITECTURE.md
│       ├── STATE-MANAGEMENT.md
│       ├── STYLING-CONVENTIONS.md
│       ├── TESTING-PATTERNS.md
│       ├── API-INTEGRATION.md
│       ├── TYPESCRIPT-CONVENTIONS.md      (if applicable)
│       ├── NAMING-CONVENTIONS.md
│       ├── DEVELOPMENT-WORKFLOW.md
│       ├── PERFORMANCE-BEST-PRACTICES.md
│       ├── ACCESSIBILITY-GUIDELINES.md
│       ├── ERROR-HANDLING.md
│       └── CODE-REVIEW-CHECKLIST.md
├── CONTRIBUTING.md    (→ Reference guide)
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
└── README.md

```

---

## 📝 Implementation Checklist

### Phase 1: Documentation Audit
- [ ] Read all existing documentation (README, CONTRIBUTING, ARCHITECTURE, etc.)
- [ ] Identify duplicate content across files
- [ ] Extract themes and group by skill topic
- [ ] List all coding patterns used in project

### Phase 2: Skill Creation
- [ ] Create `docs/skills/` directory
- [ ] Create each skill file (start with top 3-4 most important)
- [ ] Extract relevant content from existing docs
- [ ] Add project-specific examples and patterns
- [ ] Add code snippets and patterns used in the codebase

### Phase 3: Main File Refactoring
- [ ] Review `CLAUDE.md` or equivalent
- [ ] Reduce to ~50-70 lines (30-50% reduction target)
- [ ] Add skill references
- [ ] Keep only critical rules and quick reference
- [ ] Add list of available skills

### Phase 4: Integration
- [ ] Update `CONTRIBUTING.md` with skill references
- [ ] Update PR template to link to skills
- [ ] Add tip/note at top of `AGENTS.md` (or equivalent) about skills
- [ ] Update README with documentation structure info

### Phase 5: Validation
- [ ] Test skill content comprehensiveness
- [ ] Verify no critical information is missing
- [ ] Check for completeness of examples
- [ ] Get team feedback

---

## 🎯 Key Differences: Frontend vs Backend

| Aspect | Backend | Frontend |
|--------|---------|----------|
| **Main Concern** | Business logic, data | UI, UX, state, performance |
| **Key Skill** | Error handling | Component architecture |
| **Performance** | Database queries | Bundle size, rendering |
| **Testing** | Unit + Integration | Unit + Component + E2E |
| **Architecture** | Layered (C→S→M) | Component tree + State |

**Adjust skills to frontend priorities:**
- Add: Component Architecture, Performance, Accessibility
- Modify: Testing (component-focused)
- Remove: Security (same as backend - move to API Integration)

---

## 💡 Frontend Skills Priority Order

**Start with these (most important):**
1. COMPONENT-ARCHITECTURE.md - Foundation
2. NAMING-CONVENTIONS.md - Consistency
3. DEVELOPMENT-WORKFLOW.md - Productivity
4. TESTING-PATTERNS.md - Quality

**Then add:**
5. STATE-MANAGEMENT.md
6. API-INTEGRATION.md
7. STYLING-CONVENTIONS.md

**Finally:**
8-12. Less critical but important for teams

---

## 🔄 Maintenance Notes

### When Adding New Features
- Document patterns in appropriate skill
- Update examples if pattern changes
- Keep skills synchronized with codebase

### When Updating Guidelines
- Update single skill file, not multiple docs
- Add migration notes if changing patterns
- Communicate changes to team

### Version Control
- Track skill files in git
- Review skill changes in PRs
- Significant pattern changes = full PR review

---

## 📊 Expected Results

| Metric | Expected |
|--------|----------|
| CONTRIBUTING.md reduction | 40-50% |
| Main context reduction | ~50% |
| Time to find info | Faster (organized by topic) |
| Maintenance burden | Lower (single source of truth) |
| Developer onboarding | Improved (clear structure) |

---

## 🚀 Next Steps

1. **Identify your frontend project type** (React, Vue, Angular, etc.)
2. **Read your existing documentation** (CONTRIBUTING, README, ARCHITECTURE)
3. **Count how many lines** are in CONTRIBUTING/main docs
4. **Create skills one by one**, starting with top 3
5. **Refactor main docs** to be minimal + skill references
6. **Validate with team** for completeness

---

## 📌 Example: How Frontend Dev Will Use This

**Before:**
```
Session starts → Load CONTRIBUTING.md (200 lines) + ARCHITECTURE.md (300 lines)
              → Total: 500 lines every session
```

**After:**
```
Session starts → Load CONTRIBUTING.md (50 lines - reference & links only)
              → Running a test? Load /testing-patterns
              → Building a component? Load /component-architecture
              → Total base context: ~50 lines + skills on-demand
```

---

## 🎓 Success Criteria

✅ Main doc (CONTRIBUTING/README) reduced by 40-50%
✅ Skills created for all major topics
✅ Each skill is self-contained and clear
✅ No duplicate information across files
✅ Team can find information quickly
✅ Onboarding time reduced
✅ Context overhead reduced for AI assistance

---

**Start with this approach and adjust based on your frontend stack specifics.**

