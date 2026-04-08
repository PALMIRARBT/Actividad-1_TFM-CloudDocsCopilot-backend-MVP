# Prompt: Skills-Based Documentation Strategy para Frontend

**Para usar en el proyecto frontend CloudDocs**

---

## 🎯 Contexto

Se implementó exitosamente una **estrategia de skills-based documentation** en el backend que redujo el contexto de IA en 39% (~6,900 tokens/sesión) y mejoró significativamente la experiencia de desarrolladores.

**Resultado del Backend:**
- ✅ 8 skills especializados creados
- ✅ CLAUDE.md reducido de 177 a 65 líneas
- ✅ Reducción de contexto: 39%
- ✅ Completeness score: 94/100
- ✅ Cero duplicación de contenido

Ahora queremos aplicar la **misma estrategia al frontend**.

---

## 🚀 PROMPT LISTO PARA USAR

Copia este prompt y úsalo directamente con Claude:

---

### **INICIO DEL PROMPT**

```
# Implementar Skills-Based Documentation Strategy en Frontend

## Contexto

El proyecto backend CloudDocs implementó exitosamente una
estrategia de skills-based documentation que:
- Redujo contexto base en 39%
- Creó 8 skills especializados
- Alcanzó 94/100 completeness score
- Eliminó duplicación de documentación

Ver referencia completa en:
docs/FRONTEND-SKILLS-STRATEGY.md (en repo backend)

## Tu Tarea

Aplicar la MISMA estrategia al proyecto frontend CloudDocs.

## Pasos a Realizar

### 1. Auditar Documentación Actual

Lee estos archivos en el proyecto frontend:
- CONTRIBUTING.md (si existe)
- README.md (especialmente development section)
- .github/PULL_REQUEST_TEMPLATE.md
- docs/ (cualquier carpeta de docs)
- package.json (scripts y setup)
- .eslintrc, tsconfig.json (si existen)

**Nota:** Identifica:
- Qué documentación existe
- Dónde hay duplicación
- Qué contenido se puede reorganizar
- Tamaño actual de archivos docs

### 2. Crear Estructura de Skills

Crea directorio: `src/docs/skills/` o `docs/skills/`

**Crear estos 12 skills (en orden de prioridad):**

#### Tier 1 - ESSENTIAL (Semana 1)
1. **COMPONENT-ARCHITECTURE.md**
   - Component structure (functional, hooks, etc.)
   - Container vs presentational components
   - Directory organization
   - Component composition patterns

2. **NAMING-CONVENTIONS.md**
   - File naming (kebab-case, PascalCase)
   - Variable naming (camelCase, SCREAMING_SNAKE_CASE)
   - Function naming (handle*, on*, get*, set*)
   - Component naming rules

3. **DEVELOPMENT-WORKFLOW.md**
   - npm scripts (dev, build, test, lint)
   - Git workflow
   - Development tools
   - Troubleshooting

#### Tier 2 - IMPORTANT (Semana 2)
4. **TESTING-PATTERNS.md**
   - Unit tests (Jest/Vitest)
   - Component tests (React Testing Library/Vue Test Utils)
   - Integration tests
   - E2E tests (Cypress/Playwright)
   - Test file organization
   - Coverage requirements

5. **STATE-MANAGEMENT.md**
   - How state is managed (Redux, Context, Zustand, Pinia)
   - Store structure
   - Actions/reducers/mutations
   - Async data flow
   - Best practices

6. **STYLING-CONVENTIONS.md**
   - Styling approach (Tailwind, CSS-in-JS, CSS Modules)
   - Naming conventions for classes/variables
   - Responsive design breakpoints
   - Color palette and design tokens

#### Tier 3 - IMPORTANT (Semana 3)
7. **API-INTEGRATION.md**
   - API client setup
   - Request/response patterns
   - Error handling
   - Authentication (JWT token management)
   - Loading/error states
   - Cancellation patterns

8. **TYPESCRIPT-CONVENTIONS.md**
   - Type definitions (if applicable)
   - Component prop types
   - Typing events
   - Common type patterns
   - Avoid any rules

9. **ERROR-HANDLING.md**
   - Component error boundaries
   - Global error handling
   - User-facing error messages
   - Error logging
   - Fallback UI patterns

#### Tier 4 - NICE-TO-HAVE (Semana 4)
10. **PERFORMANCE-BEST-PRACTICES.md**
    - Code splitting and lazy loading
    - Memoization (React.memo, useMemo, useCallback)
    - Image optimization
    - Bundle size management
    - Virtual scrolling for long lists

11. **ACCESSIBILITY-GUIDELINES.md**
    - ARIA attributes
    - Keyboard navigation
    - Screen reader testing
    - Color contrast
    - Semantic HTML

12. **CODE-REVIEW-CHECKLIST.md**
    - Pre-PR checklist
    - Code review criteria
    - Common mistakes to avoid
    - Performance checks
    - Accessibility checks

### 3. Crear Supporting Guides

Además de los 12 skills, crear:

1. **docs/skills/README.md**
   - Navigation guide
   - Quick reference
   - When to use each skill
   - Learning path for new devs

2. **docs/skills/USAGE-GUIDE.md**
   - 8-10 practical scenarios:
     * Implementing a new component
     * Adding state management
     * Writing component tests
     * API integration
     * Performance optimization
     * Debugging an issue
     * Code review
     * Onboarding new developer

3. **docs/skills/VALIDATION-REPORT.md**
   - Completeness score (target: 90+/100)
   - Coverage assessment
   - Gap analysis

### 4. Refactor Main Documentation Files

**CONTRIBUTING.md/README.md Development Section:**
- Reduce from current ~300 lines to ~80-100 lines
- Keep only critical info and skill references
- Add links to individual skills

**Example structure:**
```
# Contributing

## Quick Start
[minimal setup steps]

## Skills Reference
- /component-architecture
- /naming-conventions
- /testing-patterns
etc.

## Before Committing
```bash
npm run lint
npm test
npm run build
```

## For Complete Details
See skills/ folder
```

### 5. Update Supporting Files

- `.github/PULL_REQUEST_TEMPLATE.md` - Update with skill links
- `package.json` - Comments for scripts
- Any other doc files - Reduce duplication

## Exit Criteria

✅ Completeness: 85-90/100 minimum
✅ All mandatory areas covered (patterns, testing, state, styling, API)
✅ Zero duplication between skills
✅ Supporting guides complete (README, USAGE, VALIDATION)
✅ Main docs (CONTRIBUTING/README) reduced by 40-50%
✅ Each skill is self-contained and clear
✅ 50+ code examples included
✅ Team can navigate easily

## Output Files to Create

```
src/docs/skills/ (or docs/skills/)
├── README.md
├── USAGE-GUIDE.md
├── VALIDATION-REPORT.md
├── COMPONENT-ARCHITECTURE.md
├── NAMING-CONVENTIONS.md
├── DEVELOPMENT-WORKFLOW.md
├── TESTING-PATTERNS.md
├── STATE-MANAGEMENT.md
├── STYLING-CONVENTIONS.md
├── API-INTEGRATION.md
├── TYPESCRIPT-CONVENTIONS.md
├── ERROR-HANDLING.md
├── PERFORMANCE-BEST-PRACTICES.md
├── ACCESSIBILITY-GUIDELINES.md
└── CODE-REVIEW-CHECKLIST.md

Modified:
├── CONTRIBUTING.md (refactored)
├── README.md (if has dev section, refactored)
├── .github/PULL_REQUEST_TEMPLATE.md (updated)
└── (any other doc files with duplication)
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Completeness Score | 85-90/100 |
| Context Reduction | 35-40% |
| Skills Created | 12-15 |
| Examples | 50+ |
| Main Doc Reduction | 40-50% |
| Duplication | 0% |

## Recommended Timeline

- **Phase 1 (Week 1):** Audit + Create Tier 1 skills (3 skills)
- **Phase 2 (Week 2):** Create Tier 2 skills (3 skills)
- **Phase 3 (Week 3):** Create Tier 3 skills (3 skills)
- **Phase 4 (Week 4):** Create Tier 4 skills (3+ skills) + Supporting guides
- **Phase 5 (Week 5):** Refactor main docs + Testing

## Stack-Specific Notes

**If React:**
- Use React Testing Library for component tests
- Mention hooks vs class components
- Include Context API vs Redux patterns

**If Vue:**
- Use Vue Test Utils for component tests
- Include Composition API vs Options API
- Include ref() and reactive() patterns

**If Angular:**
- Mention dependency injection
- Include RxJS observable patterns
- Components, services, modules structure

**If Svelte/Other:**
- Adjust component patterns accordingly
- Follow same documentation strategy

## Remember

- Focus on YOUR stack and patterns
- Use YOUR project's actual examples
- Make skills specific to your codebase
- Include real patterns you already use
- Keep examples short and focused
- Zero duplication between skills
- Each skill is independent

## Questions During Implementation?

Refer to backend: `docs/FRONTEND-SKILLS-STRATEGY.md`
This has detailed 600-line guide with all considerations.
```

### **FIN DEL PROMPT**

---

## 📋 Cómo Usar Este Prompt

### Opción 1: Implementación Manual
Copia el prompt completo arriba y pégalo a Claude con contexto de tu proyecto frontend.

### Opción 2: Implementación Paso a Paso
```bash
# 1. Copia el prompt
# 2. En tu proyecto frontend, crea una rama
git checkout -b feat/documentation-skills-strategy

# 3. Pégalo en Claude con contexto del proyecto frontend
# 4. Sigue las instrucciones que Claude te dé
```

### Opción 3: Uso en Archivo
Crea `CLAUDE-FRONTEND.md` en el frontend con:
```markdown
# Frontend Skills Strategy Implementation

[Pega aquí el prompt completo]
```

---

## 📊 Comparación: Backend vs Frontend Skills

### Backend (Completado) ✅
```
8 Skills
├─ CODING-STANDARDS
├─ TESTING-REQUIREMENTS
├─ SECURITY-GUIDELINES
├─ API-DESIGN-RULES
├─ NAMING-CONVENTIONS
├─ WORKFLOW-COMMANDS
├─ PRE-COMMIT-CHECKLIST
└─ ERROR-HANDLING

Ahorro: 39% contexto
Score: 94/100
```

### Frontend (Por Hacer) 📋
```
12-15 Skills Recomendados
├─ COMPONENT-ARCHITECTURE      ← Unique to frontend
├─ NAMING-CONVENTIONS
├─ DEVELOPMENT-WORKFLOW
├─ TESTING-PATTERNS            ← Frontend-specific
├─ STATE-MANAGEMENT            ← Unique to frontend
├─ STYLING-CONVENTIONS         ← Unique to frontend
├─ API-INTEGRATION
├─ TYPESCRIPT-CONVENTIONS      ← If applicable
├─ ERROR-HANDLING
├─ PERFORMANCE-BEST-PRACTICES  ← Frontend-focused
├─ ACCESSIBILITY-GUIDELINES    ← Often missed
├─ CODE-REVIEW-CHECKLIST
├─ (Extra skills as needed)
└─ ...

Target Ahorro: 35-40% contexto
Target Score: 85-90/100
```

---

## 🎯 Diferencias Clave: Backend vs Frontend

| Aspecto | Backend | Frontend |
|--------|---------|----------|
| **Arquitectura** | Layered (C→S→M) | Component tree + State |
| **Performance** | DB queries | Bundle size, rendering |
| **Testing** | Unit + Integration | Unit + Component + E2E |
| **State** | Minimal | Critical (Redux, Zustand, Pinia) |
| **Styling** | N/A | Critical (Tailwind, CSS-in-JS) |
| **Security** | Input validation | XSS, CSRF, CSP |
| **Accessibility** | N/A | Critical (WCAG) |

**Ajusta los skills a estas diferencias.**

---

## 💡 Tips de Implementación

### Tip 1: Empieza por los Tier 1 Skills
No intentes crear todos a la vez. Comienza con los 3 más importantes:
1. COMPONENT-ARCHITECTURE
2. NAMING-CONVENTIONS
3. DEVELOPMENT-WORKFLOW

Luego agrega otros.

### Tip 2: Usa Ejemplos del Proyecto Actual
No des ejemplos genéricos. Usa código REAL de tu proyecto frontend.

### Tip 3: Valida Completeness Regularmente
Después de crear cada skill, verifica:
- ✅ Es autocontendido (no necesita otros)
- ✅ Tiene ejemplos reales
- ✅ No duplica otros skills
- ✅ Está claro

### Tip 4: Incluye el Stack Específico
Si usas React + TypeScript + Zustand:
- Menciona específicamente eso
- Da ejemplos con esas tecnologías
- No des ejemplos genéricos

### Tip 5: Haz Guías de Migración
En el README, explica cómo developers pasan de:
```
"Leer CONTRIBUTING completo (300 líneas)"
→
"Leer CONTRIBUTING mínimo (80 líneas) + skills específicos"
```

---

## 📌 Checklist Pre-Implementación

Antes de empezar con tu frontend, verifica:

- [ ] ¿Tienes claro tu stack? (React/Vue/Angular)
- [ ] ¿Dónde está la documentación existente?
- [ ] ¿Quién hace code review? (para adaptar CHECKLIST)
- [ ] ¿Qué es CRÍTICO en tu proyecto?
- [ ] ¿Hay patterns ya establecidos?
- [ ] ¿Cuál es el nivel del equipo?

---

## 🚀 Próximos Pasos

1. **Copia el prompt anterior**
2. **Crea rama en frontend:** `feat/documentation-skills-strategy`
3. **Pega el prompt en Claude** junto con contexto de tu proyecto
4. **Sigue la guía paso a paso**
5. **Review y refina con el equipo**
6. **Commit cuando esté listo**

---

## 📞 Referencia Rápida

**Para backend detalles:**
```
└─ docs/FRONTEND-SKILLS-STRATEGY.md (en este repo)
   └─ Tiene 600 líneas con toda la estrategia
```

**Para validación:**
```
└─ docs/SKILLS-IMPLEMENTATION-SUMMARY.md (en este repo)
   └─ Resumen oficial de lo hecho en backend
```

---

**¿Listo para implementar en tu frontend?**

Usa el prompt anterior y avísame cómo va. 🚀

