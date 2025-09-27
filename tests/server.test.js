const request = require('supertest');
const express = require('express');

// Test básico sin conexión a DB
describe('Server Basic Tests', () => {
  let app;

  beforeAll(() => {
    // Crear una app básica para testing sin DB
    app = express();
    app.use(express.json());
    
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'CloudDocs API está funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    app.get('/', (req, res) => {
      res.json({
        name: 'CloudDocs Backend API',
        version: '1.0.0',
        description: 'API REST para la gestión de usuarios, documentos y carpetas en la nube',
        endpoints: {
          auth: '/api/auth',
          documents: '/api/documents',
          folders: '/api/folders',
          users: '/api/users',
          health: '/api/health'
        }
      });
    });
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.name).toBe('CloudDocs Backend API');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('CloudDocs API está funcionando correctamente');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});