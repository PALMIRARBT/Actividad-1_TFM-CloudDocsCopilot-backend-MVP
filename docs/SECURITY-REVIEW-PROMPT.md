# Prompt: Revisión de Seguridad Previa al Lanzamiento - CloudDocs API

> **Uso:** Copia el prompt de la sección §2 y pégalo en Claude, ChatGPT-4o, Gemini Advanced o cualquier LLM con ventana de contexto larga. Adjunta o pega el contenido de `SECURITY-CONTEXT.md` como contexto adicional si el modelo lo permite.

---

## §1. Contexto del Proyecto (resumen ejecutivo para el modelo)

CloudDocs es una API REST multi-tenant de gestión documental con módulo de IA (RAG, OCR, clasificación automática). Está construida sobre Node.js 20 + Express.js + TypeScript + MongoDB + Elasticsearch, con autenticación JWT (HttpOnly cookie), protección CSRF (Double Submit Cookie), RBAC a nivel global (user/admin) y a nivel de organización (owner/admin/member/viewer), rate limiting, Helmet.js, mongoSanitize y Multer para uploads. El proyecto está en fase PoC/MVP y va a ser sometido a una revisión de seguridad formal antes del lanzamiento oficial. La revisión debe ser accesible para una audiencia técnica-académica (TFM).

---

## §2. Prompt para Generación de Informe de Revisión de Seguridad

```
Eres un experto en seguridad de aplicaciones web y APIs REST. Actúa como revisor de seguridad independiente y genera un **Informe de Revisión de Seguridad Previa al Lanzamiento** formal y detallado para el proyecto CloudDocs API.

## Contexto del sistema

CloudDocs es una API REST multi-tenant para gestión documental con módulo de IA. Stack: Node.js 20+, Express.js, TypeScript 5.x, MongoDB (Mongoose), JWT (HS256) en HttpOnly cookies, CSRF Double Submit Cookie (csrf-csrf), RBAC con roles globales (user/admin) y roles de organización (owner/admin/member/viewer), Helmet.js, express-rate-limit, express-mongo-sanitize, Multer para uploads, bcryptjs para hashing de contraseñas.

## Controles de seguridad ya implementados

**Autenticación:**
- JWT en HttpOnly cookie con sliding session
- Token versioning (invalidación por cambio de contraseña/email)
- Verificación de estado activo del usuario en cada request
- Bcrypt con salt rounds configurables (default: 10)
- Validación de fortaleza de contraseña
- Reset tokens con SHA-256 hash y expiración de 1 hora

**CSRF:** Double Submit Cookie Pattern, cookie con prefijo `__Host-`, sameSite strict, 64 bytes de entropía

**RBAC:** Dos niveles — global (user/admin) + organización (owner/admin/member/viewer). Middleware `validateOrganizationMembership` verifica membresía activa. Datos completamente aislados por `organizationId`.

**Otros:** Helmet.js (CSP, HSTS, X-Frame-Options, noSniff, XSS filter, Referrer-Policy), CORS con whitelist por entorno, mongoSanitize (prevención NoSQL injection), rate limiting en auth (10 intentos/15min), URL validation (SSRF/Open Redirect prevention), audit trail para eliminaciones con IP + User-Agent.

## Vulnerabilidades identificadas (input para el informe)

- **SEC-001 [CRÍTICO]:** Directorio `/uploads` servido como static sin autenticación — cualquier URL de archivo es pública
- **SEC-002 [CRÍTICO]:** `JWT_SECRET` tiene fallback a valor conocido si la variable de entorno no está configurada
- **SEC-003 [ALTO]:** CSRF completamente deshabilitado en entorno development (todos los métodos HTTP ignorados)
- **SEC-004 [ALTO]:** Fallback de Authorization header permite enviar JWT fuera de cookie (bypass de protección CSRF)
- **SEC-005 [ALTO]:** Bloque de invalidación de token por actualizaciones de usuario comentado en código
- **SEC-006 [ALTO]:** Documentos en papelera siguen accesibles por URL directa si se conoce el path
- **SEC-007 [MEDIO]:** CSP usa `unsafe-inline` para scripts y estilos
- **SEC-008 [MEDIO]:** No hay endpoint ni API para consultar los audit logs de auditoría
- **SEC-009 [MEDIO]:** Sin logging estructurado de seguridad (eventos de autenticación, 403, intentos fallidos no se registran de forma trazable)
- **SEC-010 [MEDIO]:** Rate limiter general configurado a 1000 req/15min — demasiado permisivo para producción
- **SEC-011 [BAJO]:** Sin política de rotación de JWT_SECRET
- **SEC-012 [BAJO]:** JWT usa algoritmo HS256 simétrico (considerar RS256 para arquitecturas distribuidas)
- **SEC-013 [BAJO]:** Sin MFA/2FA para cuentas administradoras

## Estructura requerida del informe

Genera el informe completo con las siguientes secciones:

### 1. Resumen Ejecutivo
Párrafo de 150-200 palabras con evaluación global del nivel de madurez de seguridad, principales fortalezas identificadas y estado general de preparación para lanzamiento.

### 2. Metodología de Revisión
Describe brevemente el enfoque utilizado (análisis estático de código, revisión de arquitectura, verificación de controles OWASP Top 10 API Security 2023).

### 3. Alcance de la Revisión
Lista los componentes revisados: middlewares de autenticación, RBAC, CSRF, rate limiting, headers HTTP, gestión de archivos, configuración CORS, modelo de datos, logging/auditoría.

### 4. Hallazgos de Seguridad
Para cada vulnerabilidad identificada (SEC-001 a SEC-013), genera una ficha con:
- **ID:** SEC-XXX
- **Título:** Nombre descriptivo
- **Severidad:** Crítica / Alta / Media / Baja
- **Descripción:** Qué es el problema y cómo ocurre
- **Impacto potencial:** Qué podría pasar si se explota
- **Evidencia:** Referencia al código o componente afectado
- **Recomendación:** Cómo solucionarlo de forma concreta y técnica
- **Prioridad de remediación:** Antes del lanzamiento / Post-lanzamiento v1 / Backlog

### 5. Verificación contra OWASP API Security Top 10 (2023)
Para cada uno de los 10 riesgos de la lista OWASP API Security Top 10 2023, indica:
- Si el riesgo está **mitigado**, **parcialmente mitigado** o **expuesto**, con justificación breve referenciando los controles existentes o la ausencia de ellos.

Lista OWASP API Security Top 10 2023:
1. API1:2023 - Broken Object Level Authorization
2. API2:2023 - Broken Authentication
3. API3:2023 - Broken Object Property Level Authorization
4. API4:2023 - Unrestricted Resource Consumption
5. API5:2023 - Broken Function Level Authorization
6. API6:2023 - Unrestricted Access to Sensitive Business Flows
7. API7:2023 - Server Side Request Forgery
8. API8:2023 - Security Misconfiguration
9. API9:2023 - Improper Inventory Management
10. API10:2023 - Unsafe Consumption of APIs

### 6. Control de Acceso a Logs y Auditoría
Sección específica sobre el estado actual del logging y auditoría, con recomendaciones para:
- Implementación de logging estructurado (eventos de seguridad, accesos, errores)
- Control de acceso a logs (quién puede ver qué)
- Retención y protección de logs
- Correlación de eventos de seguridad

### 7. Revisión del Modelo RBAC
Análisis del modelo de roles implementado (user/admin global + owner/admin/member/viewer por org):
- ¿Es suficientemente granular?
- ¿Hay privilege escalation paths identificados?
- ¿Los permisos están correctamente aplicados en todos los endpoints?
- Recomendaciones para fortalecer el RBAC

### 8. Recomendaciones Priorizadas — Checklist Pre-Lanzamiento
Tabla con todas las acciones recomendadas, ordenadas por prioridad:

| Prioridad | ID | Acción | Esfuerzo estimado | Obligatorio para lanzamiento |
|---|---|---|---|---|

### 9. Recomendaciones Post-Lanzamiento (Backlog de Seguridad)
Lista de mejoras de seguridad deseables a implementar en versiones posteriores al MVP, con justificación breve de cada una.

### 10. Conclusión
Valoración final: ¿Está el sistema listo para lanzamiento tras remediar los hallazgos críticos y altos? Indicar condiciones mínimas de aceptación de seguridad.

---

## Instrucciones adicionales para el informe

- Usa un tono formal, técnico y objetivo (como un informe de pentest real)
- El documento debe ser comprensible por un evaluador académico (TFM de máster)
- Incluye referencias a estándares cuando corresponda (OWASP, NIST, RFC, GDPR)
- Las recomendaciones deben ser **concretas y accionables** para un desarrollador Node.js/TypeScript
- Marca claramente qué hallazgos deben resolverse **obligatoriamente antes del lanzamiento** vs. los que pueden ir al backlog
- El informe final debe tener entre 2500 y 4000 palabras
- Genera el documento en **español**
- Formato: Markdown
```

---

## §3. Instrucciones de Uso

1. **Abre** Claude.ai, ChatGPT o Gemini Advanced
2. **Pega** el prompt completo de la sección §2
3. **Adjunta o pega** el contenido de [docs/SECURITY-CONTEXT.md](./SECURITY-CONTEXT.md) como contexto adicional (o inclúyelo al final del prompt bajo la sección "Contexto técnico adicional")
4. **Solicita** el documento en formato Markdown para poder guardarlo directamente
5. **Revisa** el documento generado y ajusta los hallazgos si el modelo añade o modifica información no verificada
6. **Guarda** el resultado como `docs/SECURITY-REVIEW.md`

## §4. Tip para mejores resultados

Si el modelo no genera el documento completo en un solo turno, usa este follow-up:

```
Continúa generando el informe desde la sección [NÚMERO]. Mantén el mismo estilo y nivel de detalle. No repitas secciones ya generadas.
```

Para refinar una sección específica:

```
Expande la sección [NOMBRE] con más detalle técnico, incluyendo ejemplos de código de remediación en Node.js/TypeScript donde sea posible.
```
