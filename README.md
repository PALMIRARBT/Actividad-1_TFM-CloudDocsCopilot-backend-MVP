<div align="center">

# CloudDocs API Service

Multi-tenant REST API for cloud document management with AI-powered features: RAG, classification, summarization, and semantic search.

**Tech Stack:** Node.js · Express · TypeScript · MongoDB · OpenAI / Ollama · Elasticsearch

[![Node](https://img.shields.io/badge/Node.js-20+-green)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

</div>


---

## ✨ Features

- **Multi-tenant Architecture** - Users belong to multiple organizations with role-based access
- **Document Management** - Upload, organize, and share documents with folder hierarchy
- **Full-text Search** - Elasticsearch-powered search across documents (optional)
- **Subscription Plans** - FREE, BASIC, PREMIUM, ENTERPRISE with storage quotas
- **Security** - JWT auth, CSRF protection, rate limiting, input sanitization

### AI Features (RAG Module)

- **RAG Q&A** - Ask natural language questions across organization documents or a specific document
- **Document Classification** - Automatic categorization with confidence scores and tags
- **Document Summarization** - AI-generated summaries with key points extraction
- **Text Extraction** - PDF, DOCX, DOC, TXT, MD support with intelligent chunking
- **Vector Search** - MongoDB Atlas `$vectorSearch` with cosine similarity
- **Provider Abstraction** - Swap between OpenAI, Ollama (local/free), or Mock providers via a single env var
- **Multi-tenancy Isolation** - RAG results strictly filtered by organization

> 📖 See [docs/AI-MODULE.md](docs/AI-MODULE.md) for full AI module documentation and [docs/AI-SETUP-GUIDE.md](docs/AI-SETUP-GUIDE.md) for setup instructions.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker (for MongoDB)
- npm or yarn

### Local Development (5 minutes)

```bash
# 1. Clone and install
git clone <repository-url>
cd cloud-docs-api-service
npm install

# 2. Start MongoDB with Docker
docker run -d --name mongodb -p 27017:27017 mongo:6.0

# 3. Start the development server
npm run dev

# 4. (Optional) Load test data
npm run seed:dev
```

**That's it!** The API is now running at <http://localhost:4000>

> **Note:** The app automatically loads `.env.example` as defaults, so no manual `.env` setup is required for basic development. To override any variable, create a `.env.local` file (git-ignored):
> ```bash
> cp .env.example .env.local
> # Edit only the variables you need to change
> ```

### Enabling AI Features

AI features require additional setup. Choose one of three providers:

| Provider | Cost | Requirements |
|----------|------|--------------|
| **Mock** | Free | Nothing — deterministic responses for testing |
| **Ollama** | Free | [Ollama](https://ollama.com) installed locally |
| **OpenAI** | Paid | OpenAI API key + MongoDB Atlas (vector search) |

**Quick start with Ollama (free, local):**

```bash
# 1. Install Ollama (macOS)
brew install ollama

# 2. Download required models
ollama pull llama3.2:3b
ollama pull nomic-embed-text

# 3. Set provider in .env.local
echo 'AI_PROVIDER=ollama' >> .env.local
```

**Quick start with Mock (testing, no setup):**

```bash
echo 'AI_PROVIDER=mock' >> .env.local
```

> 📖 See [docs/AI-SETUP-GUIDE.md](docs/AI-SETUP-GUIDE.md) for complete instructions including OpenAI and MongoDB Atlas setup.

### Test Accounts (after seeding)

| Email                 | Password  | Role  |
| --------------------- | --------- | ----- |
| admin@clouddocs.local | Test@1234 | Admin |
| john@clouddocs.local  | Test@1234 | User  |
| jane@clouddocs.local  | Test@1234 | User  |

See [docs/MOCK-DATA.md](docs/MOCK-DATA.md) for complete test data documentation.

### Using Docker Compose (Full Stack)

```bash
# From the workspace root (parent directory)
cp .env.example .env.local
# Edit .env.local with your configuration
docker-compose up -d

# API available at http://localhost:4000
# Frontend at http://localhost:3000
```

## 🤖 AI API Endpoints

All AI endpoints require authentication and are under `/api/ai`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/ask` | Ask a question across all organization documents (RAG) |
| `POST` | `/ai/documents/:id/ask` | Ask a question about a specific document |
| `GET` | `/ai/documents/:id/extract-text` | Extract text content from a document |
| `POST` | `/ai/documents/:id/process` | Chunk and embed a document for RAG |
| `DELETE` | `/ai/documents/:id/chunks` | Delete processed chunks for a document |
| `POST` | `/ai/documents/:id/classify` | Classify document (category, confidence, tags) |
| `POST` | `/ai/documents/:id/summarize` | Summarize document (summary + key points) |

> 📖 See [docs/AI-MODULE.md](docs/AI-MODULE.md) for detailed endpoint documentation with request/response examples.

## 📚 Documentation

| Document                                              | Description                             |
| ----------------------------------------------------- | --------------------------------------- |
| [AI Module](docs/AI-MODULE.md)                        | **Full AI/RAG module documentation**    |
| [AI Setup Guide](docs/AI-SETUP-GUIDE.md)              | **AI provider setup (local & production)** |
| [Architecture](docs/ARCHITECTURE.md)                  | System design and code organization     |
| [Phase Status Report](docs/PHASE-STATUS-REPORT.md)    | AI implementation progress tracking     |
| [Test Configuration](docs/TEST-CONFIGURATION.md)      | Testing setup and CI configuration      |
| [OpenAPI Spec](docs/openapi/openapi.json)             | API specification (Swagger/OpenAPI 3.0) |
| [Mock Data](docs/MOCK-DATA.md)                        | Test data for local development         |
| [Testing Guide](docs/ENDPOINTS-TESTING-GUIDE.md)      | How to test API endpoints               |
| [Contributing](CONTRIBUTING.md)                       | Development setup and guidelines        |

### RFCs (Technical Design Documents)

| Document                                               | Description                         |
| ------------------------------------------------------ | ----------------------------------- |
| [CSRF Protection](docs/rfc/CSRF-PROTECTION.md)         | Security implementation details     |
| [Multi-tenancy](docs/rfc/MULTITENANCY-MIGRATION.md)    | Organization model explanation      |
| [Password Validation](docs/rfc/PASSWORD-VALIDATION.md) | Password strength requirements      |
| [Security Fixes](docs/rfc/SECURITY-FIXES.md)           | Security improvements documentation |

### RFEs (AI Feature Enhancement Proposals)

| Document                                                                            | Status |
| ----------------------------------------------------------------------------------- | ------ |
| [RFE-AI-001 Provider Abstraction](docs/RFE/RFE-AI-001-PROVIDER-ABSTRACTION.md)     | ✅ Implemented |
| [RFE-AI-002 Document Model AI Fields](docs/RFE/RFE-AI-002-DOCUMENT-MODEL-AI-FIELDS.md) | Proposed |
| [RFE-AI-003 Classification & Tagging](docs/RFE/RFE-AI-003-CLASSIFICATION-TAGGING.md) | ✅ Implemented |
| [RFE-AI-004 ES Content Search Fix](docs/RFE/RFE-AI-004-FIX-ES-CONTENT-SEARCH.md)  | ✅ Implemented |
| [RFE-AI-005 Cross-Org RAG Fix](docs/RFE/RFE-AI-005-FIX-CROSS-ORG-RAG.md)          | ✅ Implemented |
| [RFE-AI-006 OCR with Tesseract](docs/RFE/RFE-AI-006-OCR-TESSERACT.md)              | Proposed |
| [RFE-AI-007 Summarization](docs/RFE/RFE-AI-007-SUMMARIZATION.md)                   | ✅ Implemented |

## 🛠️ Scripts

| Script                     | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `npm run dev`              | Start development server with hot reload       |
| `npm run build`            | Compile TypeScript to JavaScript               |
| `npm start`                | Run production server                          |
| **Testing**                |                                                |
| `npm run test:ci`          | **Run ALL tests + coverage (use in CI)** ⭐    |
| `npm test`                 | Run main test suite (integration + most unit)  |
| `npm run test:unit`        | Run unit tests only (includes embedding tests) |
| `npm run test:integration` | Run integration tests only                     |
| `npm run test:coverage`    | Run tests with coverage report                 |
| `npm run test:watch`       | Run tests in watch mode                        |
| **Utilities**              |                                                |
| `npm run seed:dev`         | Load test data into database                   |
| `npm run format`           | Format code with Prettier                      |

## 📁 Project Structure

```text
├── docs/
│   ├── openapi/          # OpenAPI/Swagger specifications
│   ├── rfc/              # Technical design documents (RFCs)
│   └── RFE/              # AI feature enhancement proposals (RFEs)
├── scripts/
│   ├── seed-dev.ts               # Development data seeding
│   ├── clean-orphaned-documents.ts  # Cleanup orphaned DB records
│   ├── reindex-documents.ts      # Re-index documents in Elasticsearch
│   └── migrate-add-org-to-chunks.ts # Add organizationId to chunks
├── src/
│   ├── configurations/   # Database, CORS, Elasticsearch, OpenAI configs
│   ├── controllers/      # HTTP request handlers (incl. ai.controller)
│   ├── middlewares/       # Auth, CSRF, rate-limit, validation
│   ├── models/            # Mongoose schemas and TypeScript types
│   ├── routes/            # API route definitions (incl. ai.routes)
│   ├── services/
│   │   ├── ai/            # AI services layer
│   │   │   ├── providers/ # OpenAI, Ollama, Mock provider implementations
│   │   │   ├── embedding.service.ts
│   │   │   ├── llm.service.ts
│   │   │   ├── rag.service.ts
│   │   │   ├── text-extraction.service.ts
│   │   │   └── prompt.builder.ts
│   │   └── ...            # Other business logic services
│   └── utils/             # Helper functions (incl. chunking.util)
└── tests/
    ├── integration/       # API integration tests (incl. AI tests)
    └── unit/              # Unit tests (incl. AI service tests)
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed documentation.

## 🔐 Security Features

- JWT authentication with token invalidation
- CSRF protection (Double Submit Cookie)
- Password strength validation
- NoSQL injection prevention
- Path traversal protection
- Rate limiting per IP
- HTTP security headers (Helmet)
- Multi-tenancy isolation for RAG/vector search

## 🌐 Environment Variables

Key variables (see [.env.example](.env.example) for full list):

| Variable                | Description               | Default                               |
| ----------------------- | ------------------------- | ------------------------------------- |
| `PORT`                  | Server port               | `4000`                                |
| `MONGO_URI`             | MongoDB connection string | `mongodb://localhost:27017/clouddocs` |
| `JWT_SECRET`            | Token signing key         | -                                     |
| `ELASTICSEARCH_ENABLED` | Enable search             | `false`                               |
| `ALLOWED_ORIGINS`       | CORS allowed origins      | `http://localhost:5173`               |

### AI-Specific Variables

| Variable               | Description                          | Default                      |
| ---------------------- | ------------------------------------ | ---------------------------- |
| `AI_PROVIDER`          | Provider: `openai` / `ollama` / `mock` | `openai`                    |
| `OPENAI_API_KEY`       | OpenAI API key (when using openai)   | -                            |
| `MONGO_ATLAS_URI`      | MongoDB Atlas URI (vector search)    | -                            |
| `OLLAMA_BASE_URL`      | Ollama server URL                    | `http://localhost:11434`     |
| `OLLAMA_CHAT_MODEL`    | Ollama chat model                    | `llama3.2:3b`               |
| `OLLAMA_EMBEDDING_MODEL` | Ollama embedding model             | `nomic-embed-text`           |

> 📖 See [docs/AI-SETUP-GUIDE.md](docs/AI-SETUP-GUIDE.md) for detailed setup instructions for each provider.

## 🧪 Testing

```bash
# CI/CD - Run ALL tests with combined coverage (recommended)
npm run test:ci

# Development
npm test                    # Main suite
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
```

**Features:**

- ✅ Dual Jest configurations for optimal testing
- ✅ MongoDB Memory Server - no external database required
- ✅ AI provider tests (Mock provider for deterministic testing)
- ✅ Multi-tenancy RAG isolation tests
- ✅ Automatic coverage merging in CI

> 📖 See [docs/TEST-CONFIGURATION.md](docs/TEST-CONFIGURATION.md) for detailed testing documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**[Documentation](docs/)** · **[Report Bug](../../issues)** · **[Request Feature](../../issues)**

</div>
