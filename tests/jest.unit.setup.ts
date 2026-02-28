/**
 * Jest setup for UNIT TESTS only
 *
 * This setup file is identical to jest.setup.ts EXCEPT:
 * - It DOES NOT patch embedding service methods globally
 * - This allows unit tests to control their own embedding mocks
 * - Unit tests can test error conditions, edge cases, etc.
 */

// Load environment variables from .env for tests
import dotenv from 'dotenv';
dotenv.config();

// Mock pdf-parse to avoid loading native bindings in tests
jest.mock('pdf-parse', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    numpages: 1,
    text: 'Mocked PDF text content for testing',
    info: {
      Title: 'Test PDF',
      Author: 'Test Author',
      Creator: 'Test Creator',
      Producer: 'Test Producer'
    }
  })
}));

// Mock mammoth to avoid loading heavy native/binary parsing code in unit tests
jest.mock('mammoth', () => ({
  __esModule: true,
  default: {
    extractRawText: jest.fn(async (_buffer: unknown) => ({ value: '' }))
  }
}));

// Mock the search service so tests don't require a running Elasticsearch instance
jest.mock('../src/services/search.service', () => ({
  indexDocument: jest.fn().mockResolvedValue(undefined),
  removeDocumentFromIndex: jest.fn().mockResolvedValue(undefined),
  searchDocuments: jest.fn().mockResolvedValue({ documents: [], total: 0, took: 0 }),
  getAutocompleteSuggestions: jest.fn().mockResolvedValue([])
}));

// Optional: silence noisy logs from Elasticsearch config during tests
const originalConsoleErrorUnit = console.error;
console.error = (...args: unknown[]) => {
  const msg = String(args[0] || '');
  // Suppress known noisy messages from Elasticsearch/indexing and search
  if (
    msg.includes('Error indexing document') ||
    msg.includes('Failed to index document in search') ||
    msg.includes('Elasticsearch client initialized') ||
    msg.includes('Elasticsearch cluster status') ||
    msg.includes('Error creating Elasticsearch index')
  ) {
    return; // suppress in tests
  }
  originalConsoleErrorUnit(...args);
};

// Mock email service to avoid real SMTP attempts during tests
jest.mock('../src/mail/emailService', () => ({
  sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendInvitationEmail: jest.fn().mockResolvedValue(undefined)
}));

// Mock Elasticsearch configuration/client to avoid network calls and init logs
jest.mock('../src/configurations/elasticsearch-config', () => {
  const mockClient = {
    getInstance: jest.fn(() => ({
      cluster: { health: jest.fn().mockResolvedValue({ status: 'green' }) },
      indices: {
        exists: jest.fn().mockResolvedValue(false),
        create: jest.fn().mockResolvedValue(undefined)
      },
      index: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      search: jest.fn().mockResolvedValue({ body: { hits: { hits: [], total: 0 }, took: 1 } })
    })),
    checkConnection: jest.fn().mockResolvedValue(true),
    createDocumentIndex: jest.fn().mockResolvedValue(undefined)
  };

  return { __esModule: true, default: mockClient };
});

// ⚠️ IMPORTANT: DO NOT patch embedding service methods here
// Unit tests need full control over embedding mocks to test error conditions
// Integration tests use jest.setup.ts which includes the global embedding mocks

// Note: OpenAI client instance is not globally mocked here to allow per-test overrides.

// Provide a global hook for OpenAI chat completions so tests can set it reliably.
// Default implementation returns a small mock response to avoid real API calls
(global as unknown as { __OPENAI_CREATE_IMPL__?: (...args: unknown[]) => Promise<unknown> }).__OPENAI_CREATE_IMPL__ = async (_opts: unknown) => ({
  choices: [{ message: { content: 'Mocked answer from OpenAI (test)' } }],
  usage: { total_tokens: 5 },
  id: 'mocked-response'
});
(global as unknown as { __OPENAI_CREATE__?: (...args: unknown[]) => Promise<unknown> }).__OPENAI_CREATE__ = async (...args: unknown[]) => {
  const g = global as unknown as { __OPENAI_CREATE_IMPL__?: (...args: unknown[]) => Promise<unknown> };
  if (g.__OPENAI_CREATE_IMPL__) {
    return g.__OPENAI_CREATE_IMPL__(...args);
  }
  return { choices: [{ message: { content: 'Mocked answer from OpenAI (fallback)' } }] };
};

// Patch MongoDB Atlas module to use an in-memory collection implementation
jest.mock('../src/configurations/database-config/mongoAtlas', () => {
  const stores: Record<string, unknown[]> = {};

  const collectionFactory = (name: string) => {
    stores[name] = stores[name] || [];

    return {
      insertMany: jest.fn().mockImplementation(async (docs: unknown[]) => {
        stores[name].push(...docs.map(d => ({ ...(d as Record<string, unknown>) })));
        return { insertedCount: docs.length };
      }),
      deleteMany: jest.fn().mockImplementation(async (filter: unknown) => {
        if (!filter || !(filter as Record<string, unknown>).hasOwnProperty('documentId')) {
          const deleted = stores[name].length;
          stores[name] = [];
          return { deletedCount: deleted };
        }
        const before = stores[name].length;
        const docId = String((filter as Record<string, unknown>).documentId as unknown);
        stores[name] = (stores[name] || []).filter(d => (d as Record<string, unknown>).documentId !== docId);
        return { deletedCount: before - (stores[name] || []).length };
      }),
      find: jest.fn().mockImplementation((filter: unknown) => ({
        sort: () => ({
          toArray: async () => (stores[name] || []).filter(d => (d as Record<string, unknown>).documentId === (filter as Record<string, unknown>).documentId)
        })
      })),
      countDocuments: jest.fn().mockImplementation(async (filter: unknown, _opts?: unknown) => {
        if (filter && (filter as Record<string, unknown>).hasOwnProperty('documentId'))
          return (stores[name] || []).filter(d => (d as Record<string, unknown>).documentId === (filter as Record<string, unknown>).documentId).length;
        return (stores[name] || []).length;
      }),
      distinct: jest.fn().mockImplementation(async (field: string) =>
        Array.from(new Set((stores[name] || []).map(d => (d as Record<string, unknown>)[field])))),
      aggregate: jest.fn().mockImplementation((pipeline: unknown[]) => ({
        toArray: async () => {
          const all = (stores[name] || []) as unknown[];

          const vsStage = Array.isArray(pipeline)
            ? pipeline.find(p => {
                if (!p || typeof p !== 'object') return false;
                const obj = p as Record<string, unknown>;
                return ('$vectorSearch' in obj) || ('$vectorSearch' in obj);
              })
            : null;

          let results = all.slice();

          if (vsStage && typeof vsStage === 'object') {
            const stageObj = vsStage as Record<string, unknown>;
            const stage = (stageObj['$vectorSearch'] ?? stageObj['$vectorSearch']) as Record<string, unknown> | undefined;

            const filter = stage && (stage['filter'] as Record<string, unknown> | undefined);
            let docId: string | undefined;
            if (filter && 'documentId' in filter) {
              const docField = filter['documentId'] as Record<string, unknown> | undefined;
              if (docField && '$eq' in docField) {
                docId = String(docField['$eq']);
              }
            }
            if (docId) {
              results = (results as unknown[]).filter(d => (d as Record<string, unknown>).documentId === docId);
            }

            const limitVal = stage && stage['limit'];
            const limit = typeof limitVal === 'number' ? limitVal : undefined;
            if (typeof limit === 'number') {
              results = (results as unknown[]).slice(0, limit);
            }
          }

          return (results as unknown[]).map((d: unknown, i: number) => ({
            _id: ((d as Record<string, unknown>)['_id'] ?? `mock-${i}`) as unknown,
            documentId: (d as Record<string, unknown>)['documentId'],
            content: (d as Record<string, unknown>)['content'],
            embedding: (d as Record<string, unknown>)['embedding'],
            createdAt: (d as Record<string, unknown>)['createdAt'],
            chunkIndex: (d as Record<string, unknown>)['chunkIndex'],
            wordCount: (d as Record<string, unknown>)['wordCount'],
            score: typeof (d as Record<string, unknown>)['score'] === 'number' ? (d as Record<string, unknown>)['score'] : 0.8
          }));
        }
      })),
      command: jest.fn().mockResolvedValue({ ok: 1 })
    };
  };

  const getDb = jest.fn().mockResolvedValue({
    collection: (name: string) => collectionFactory(name),
    command: async () => ({ ok: 1 })
  });

  // Provide a client-like object synchronously so tests calling `getClient()` receive a usable object
  const fakeClient = {
    db: jest.fn(() => ({
      collection: (name: string) => collectionFactory(name)
    }))
  };

  const getClient = jest.fn().mockReturnValue(fakeClient);
  const closeAtlasConnection = jest.fn().mockResolvedValue(undefined);
  const isConnected = jest.fn().mockReturnValue(true);

  return { __esModule: true, getDb, getClient, closeAtlasConnection, isConnected };
});
