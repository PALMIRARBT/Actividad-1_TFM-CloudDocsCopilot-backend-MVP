<<<<<<< HEAD
import request from 'supertest';
import app from '../../src/app';
=======
import { request, app } from '../setup';
>>>>>>> origin/main
import DocumentModel from '../../src/models/document.model';
import OrganizationModel from '../../src/models/organization.model';
import UserModel from '../../src/models/user.model';
import MembershipModel from '../../src/models/membership.model';
import FolderModel from '../../src/models/folder.model';
import * as searchService from '../../src/services/search.service';
<<<<<<< HEAD
import jwt from 'jsonwebtoken';

// Desmockear el servicio de búsqueda para este test
jest.unmock('../../src/services/search.service');
=======
import { bodyOf } from '../helpers';
import type { Response } from 'supertest';
import { signToken } from '../../src/services/jwt.service';

// Mock the search service with data-driven responses for this test suite
// The global mock in jest.setup.ts provides default empty responses
// Here we override with responses that match our test data
>>>>>>> origin/main

describe('Search API - Elasticsearch Integration', () => {
  let authToken: string;
  let userId: string;
  let organizationId: string;
<<<<<<< HEAD
  let documentIds: string[] = [];

  beforeAll(async () => {
=======
  let testDocuments: Array<Record<string, unknown>> = [];

  // Setup test data before each test (setup.ts clears collections after each test)
  beforeEach(async () => {
    // Reset testDocuments array
    testDocuments = [];
>>>>>>> origin/main
    // Crear usuario de prueba
    const user = await UserModel.create({
      name: 'Search Tester',
      email: 'searchtester@test.com',
      password: 'hashedpassword123',
<<<<<<< HEAD
      role: 'user'
=======
      role: 'user',
      active: true
>>>>>>> origin/main
    });
    userId = user._id.toString();

    // Crear organización
    const org = await OrganizationModel.create({
      name: 'Search Test Org',
<<<<<<< HEAD
      ownerId: userId,
=======
      owner: user._id,
>>>>>>> origin/main
      plan: 'enterprise',
      settings: {
        allowedFileTypes: ['application/pdf', 'image/png', 'image/jpeg', 'text/plain']
      }
    });
    organizationId = org._id.toString();

    // Crear membership
    await MembershipModel.create({
<<<<<<< HEAD
      userId: user._id,
      organizationId: org._id,
=======
      user: user._id,
      organization: org._id,
>>>>>>> origin/main
      role: 'owner',
      status: 'active'
    });

    // Crear carpeta raíz
    const folder = await FolderModel.create({
      name: 'Root',
      path: '/',
      organization: org._id,
<<<<<<< HEAD
      uploadedBy: user._id
=======
      owner: user._id,
      type: 'root'
>>>>>>> origin/main
    });

    // Crear documentos de prueba con diferentes nombres
    const testDocs = [
      { filename: 'zonificacion-2023.pdf', originalname: 'ZONIFICACION_CASA_NUEVA.pdf' },
      { filename: 'predial-recibo.pdf', originalname: 'Recibo Predial 2024.pdf' },
      { filename: 'constancia.pdf', originalname: 'Constancia zonificacion empresa.pdf' },
      { filename: 'factura-123.pdf', originalname: 'Factura Servicios Enero.pdf' },
      { filename: 'contrato-arrendamiento.pdf', originalname: 'Contrato Arrendamiento Local.pdf' }
    ];

    for (const doc of testDocs) {
      const document = await DocumentModel.create({
        filename: doc.filename,
        originalname: doc.originalname,
        path: `/uploads/${doc.filename}`,
        mimeType: 'application/pdf',
        size: 1024,
        uploadedBy: user._id,
        organization: org._id,
        folder: folder._id,
        uploadedAt: new Date()
      });
<<<<<<< HEAD
      documentIds.push(document._id.toString());

      // Indexar en Elasticsearch
      await searchService.indexDocument(document);
    }

    // Generar token JWT
    authToken = jwt.sign(
      { id: userId, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Esperar a que Elasticsearch indexe
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Limpiar documentos de Elasticsearch
    for (const id of documentIds) {
      await searchService.removeDocumentFromIndex(id);
    }

    // Limpiar base de datos
    await DocumentModel.deleteMany({});
    await FolderModel.deleteMany({});
    await MembershipModel.deleteMany({});
    await OrganizationModel.deleteMany({});
    await UserModel.deleteMany({});
=======
      testDocuments.push({
        id: document._id.toString(),
        filename: document.filename,
        originalname: document.originalname,
        mimeType: document.mimeType,
        organization: organizationId,
        score: 1.0
      });
    }

    // Generar token JWT
    authToken = signToken({
      id: userId,
      email: user.email,
      role: user.role,
      tokenVersion: 0
    });

    // Configure search service mock to return test documents based on query
    // searchDocuments receives a SearchParams object: { query, userId, organizationId, mimeType, limit, offset, ... }
    (searchService.searchDocuments as jest.Mock).mockImplementation(
      async (params: { query: string; organizationId?: string; mimeType?: string; limit?: number; offset?: number }) => {
        const q = params.query.toLowerCase();
        const results = testDocuments.filter((doc) => {
          const original = String(doc.originalname || '').toLowerCase();
          const filename = String(doc.filename || '').toLowerCase();
          return original.includes(q) || filename.includes(q);
        });

        // Apply mimeType filter if provided
        let filtered = results;
        if (params.mimeType) {
          filtered = filtered.filter(d => String(d.mimeType || '') === params.mimeType);
        }

        // Apply organization filter
        if (params.organizationId) {
          filtered = filtered.filter(d => String(d.organization || '') === params.organizationId);
        }

        // Apply pagination
        const offset = params.offset || 0;
        const limit = params.limit || 10;
        const paginatedResults = filtered.slice(offset, offset + limit);

        return {
          documents: paginatedResults,
          total: filtered.length,
          took: 5
        };
      }
    );

    // getAutocompleteSuggestions receives: (query, userId, organizationId?, limit?)
    (searchService.getAutocompleteSuggestions as jest.Mock).mockImplementation(
      async (query: string, _userId: string, _organizationId?: string, limit: number = 5) => {
        const q = query.toLowerCase();
        const suggestions = testDocuments
          .filter(doc => String(doc.originalname || '').toLowerCase().includes(q))
          .map(doc => String(doc.originalname || ''))
          .slice(0, limit);
        return suggestions;
      }
    );
>>>>>>> origin/main
  });

  describe('GET /api/search', () => {
    it('debe buscar documentos con búsqueda parcial (zonificacion)', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ q: 'zonificacion' })
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Organization-ID', organizationId);
<<<<<<< HEAD

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.total).toBeGreaterThan(0);
=======
      expect(response.status).toBe(200);
      const body = bodyOf(response as Response) as { success?: boolean; data?: Array<Record<string, unknown>>; total?: number };
      expect(body.success).toBe(true);
      expect(body.data?.length).toBeGreaterThan(0);
      expect(body.total).toBeGreaterThan(0);
>>>>>>> origin/main
    });

    it('debe buscar con búsqueda case-insensitive (PREDIAL)', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ q: 'PREDIAL' })
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Organization-ID', organizationId);
<<<<<<< HEAD

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
=======
      expect(response.status).toBe(200);
      const body = bodyOf(response as Response) as { success?: boolean; data?: Array<Record<string, unknown>> };
      expect(body.success).toBe(true);
      expect(body.data?.length).toBeGreaterThan(0);
>>>>>>> origin/main
    });

    it('debe buscar con palabra parcial (constan)', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ q: 'constan' })
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Organization-ID', organizationId);
<<<<<<< HEAD

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
=======
      expect(response.status).toBe(200);
      const body = bodyOf(response as Response) as { success?: boolean; data?: Array<Record<string, unknown>> };
      expect(body.success).toBe(true);
      expect(body.data?.length).toBeGreaterThan(0);
>>>>>>> origin/main
    });

    it('debe filtrar por tipo MIME', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ 
          q: 'pdf',
          mimeType: 'application/pdf'
        })
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Organization-ID', organizationId);
<<<<<<< HEAD

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      response.body.data.forEach((doc: any) => {
        expect(doc.mimeType).toBe('application/pdf');
=======
      expect(response.status).toBe(200);
      const body = bodyOf(response as Response) as { success?: boolean; data?: Array<Record<string, unknown>> };
      expect(body.success).toBe(true);
      (body.data || []).forEach((doc) => {
        expect(String(doc.mimeType || '')).toBe('application/pdf');
>>>>>>> origin/main
      });
    });

    it('debe respetar paginación (limit y offset)', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ 
          q: 'pdf',
          limit: 2,
          offset: 0
        })
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Organization-ID', organizationId);
<<<<<<< HEAD

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
=======
      expect(response.status).toBe(200);
      const body = bodyOf(response as Response) as { data?: Array<Record<string, unknown>> };
      expect(body.data?.length).toBeLessThanOrEqual(2);
>>>>>>> origin/main
    });

    it('debe retornar 400 si falta el parámetro q', async () => {
      const response = await request(app)
        .get('/api/search')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Organization-ID', organizationId);
<<<<<<< HEAD

=======
>>>>>>> origin/main
      expect(response.status).toBe(400);
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ q: 'test' });

      expect(response.status).toBe(401);
    });

    it('debe filtrar solo documentos de la organización', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ q: 'zonificacion' })
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Organization-ID', organizationId);

      expect(response.status).toBe(200);
<<<<<<< HEAD
      response.body.data.forEach((doc: any) => {
        expect(doc.organization).toBe(organizationId);
=======
      const body = bodyOf(response as Response) as { data?: Array<Record<string, unknown>> };
      (body.data || []).forEach((doc) => {
        expect(String(doc.organization || '')).toBe(organizationId);
>>>>>>> origin/main
      });
    });
  });

  describe('GET /api/search/autocomplete', () => {
    it('debe retornar sugerencias de autocompletado', async () => {
      const response = await request(app)
        .get('/api/search/autocomplete')
        .query({ q: 'zonif' })
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Organization-ID', organizationId);

      expect(response.status).toBe(200);
<<<<<<< HEAD
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.suggestions)).toBe(true);
=======
      const b = bodyOf(response as Response) as Record<string, unknown>;
      expect(b['success']).toBe(true);
      expect(Array.isArray(b['suggestions'])).toBe(true);
>>>>>>> origin/main
    });

    it('debe limitar el número de sugerencias', async () => {
      const response = await request(app)
        .get('/api/search/autocomplete')
        .query({ 
          q: 'a',
          limit: 3
        })
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Organization-ID', organizationId);

      expect(response.status).toBe(200);
<<<<<<< HEAD
      expect(response.body.suggestions.length).toBeLessThanOrEqual(3);
=======
      const b2 = bodyOf(response as Response) as Record<string, unknown>;
      expect((b2['suggestions'] as unknown[]).length).toBeLessThanOrEqual(3);
>>>>>>> origin/main
    });

    it('debe retornar 400 si falta el parámetro q', async () => {
      const response = await request(app)
        .get('/api/search/autocomplete')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Organization-ID', organizationId);

      expect(response.status).toBe(400);
    });
  });
});
