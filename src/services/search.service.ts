import { IDocument } from '../models/document.model';
import type { Client } from '@elastic/elasticsearch';
import ElasticsearchClient from '../configurations/elasticsearch-config';

export const getEsClient = (): Client => {
  return ElasticsearchClient.getInstance();
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

interface IndexedDocumentSource {
  filename: string;
  originalname: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  organization: string | null;
  folder: string | null;
  uploadedAt?: Date;
  content: string | null;
  aiCategory: string | null;
  aiTags: string[];
  aiSummary: string | null;
  aiKeyPoints: string[];
  aiProcessingStatus: string;
  aiConfidence: number | null;
}

interface SearchHitLike {
  _id: string;
  _score?: number;
  _source?: Record<string, unknown>;
}

interface SearchResultLike {
  hits: {
    hits: SearchHitLike[];
    total?: { value: number } | number;
  };
  took: number;
}

/**
 * Interfaz para parámetros de búsqueda
 */
export interface SearchParams {
  query: string;
  userId: string;
  organizationId?: string;
  mimeType?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Interfaz para resultados de búsqueda
 */
export interface SearchResult {
  documents: Array<Record<string, unknown>>;
  total: number;
  took: number;
}

/**
 * Indexar un documento en Elasticsearch
 *
 * ACTUALIZADO (RFE-AI-004): Ahora incluye:
 * - Campo 'content' para búsqueda full-text (antes 'extractedContent' nunca se indexaba)
 * - Campos AI: aiCategory, aiTags, aiProcessingStatus
 *
 * @param document - Documento de MongoDB a indexar
 * @param extractedText - Contenido extraído del documento (opcional)
 */
export async function indexDocument(document: IDocument, extractedText?: string): Promise<void> {
  try {
    const client = getEsClient();

    await client.index({
      index: 'documents',
      id: String(document._id),
      document: {
        // Campos básicos
        filename: document.filename || '',
        originalname: document.originalname || '',
        extractedContent: document.extractedContent || '',
        mimeType: document.mimeType,
        size: document.size,
        uploadedBy: String(document.uploadedBy),
        organization: document.organization ? String(document.organization) : null,
        folder: document.folder ? String(document.folder) : null,
        uploadedAt: document.uploadedAt,

        // 🔍 NUEVO: Contenido extraído para búsqueda full-text
        // Limitado a 100KB para no saturar Elasticsearch
        content: extractedText ? extractedText.slice(0, 100000) : null,

        // 🤖 NUEVO: Campos AI para búsqueda facetada y filtrado (RFE-AI-002, RFE-AI-004)
        aiCategory: document.aiCategory || null,
        aiTags: document.aiTags || [],
        aiSummary: document.aiSummary || null,
        aiKeyPoints: document.aiKeyPoints || [],
        aiProcessingStatus: document.aiProcessingStatus || 'none',
        aiConfidence: document.aiConfidence || null
      } as IndexedDocumentSource
    });

    console.warn(`✅ Document indexed: ${String(document._id)}`);
  } catch (error: unknown) {
    console.error(`❌ Error indexing document ${String(document._id)}:`, getErrorMessage(error));
    throw error;
  }
}

/**
 * Eliminar un documento del índice de Elasticsearch
 */
export async function removeDocumentFromIndex(documentId: string): Promise<void> {
  try {
    const client = getEsClient();

    await client.delete({
      index: 'documents',
      id: documentId
    });

    console.warn(`✅ Document removed from index: ${documentId}`);
  } catch (error: unknown) {
    const statusCode =
      typeof error === 'object' &&
      error !== null &&
      'meta' in error &&
      typeof (error as { meta?: { statusCode?: unknown } }).meta?.statusCode === 'number'
        ? (error as { meta: { statusCode: number } }).meta.statusCode
        : undefined;

    if (statusCode === 404) {
      console.warn(`⚠️  Document not found in index: ${documentId}`);
    } else {
      console.error(`❌ Error removing document from index:`, getErrorMessage(error));
      throw error;
    }
  }
}

/**
 * Buscar documentos por nombre
 */
export async function searchDocuments(params: SearchParams): Promise<SearchResult> {
  try {
    const client = getEsClient();
    const {
      query,
      userId,
      organizationId,
      mimeType,
      fromDate,
      toDate,
      limit = 20,
      offset = 0
    } = params;

    // Construir filtros
    const filters: Array<Record<string, unknown>> = [];

    // Si hay organizationId, buscar en toda la organización
    // Si NO hay organizationId, buscar solo documentos del usuario
    if (organizationId) {
      filters.push({ term: { organization: organizationId } });
    } else {
      filters.push({ term: { uploadedBy: userId } });
    }

    if (mimeType) {
      console.log(`🔍 [Elasticsearch] Filtering by mimeType: ${mimeType}`);
      
      // Usar coincidencia exacta para el mimeType específico
      // Esto asegura que se filtren exactamente los documentos del tipo seleccionado
      filters.push({ 
        term: { 
          "mimeType.keyword": mimeType 
        } 
      });
      
      console.log(`📋 [Elasticsearch] Added exact mimeType filter: ${mimeType}`);
    }

    if (fromDate || toDate) {
      const dateRange: { gte?: string; lte?: string } = {};
      if (fromDate) dateRange.gte = fromDate.toISOString();
      if (toDate) dateRange.lte = toDate.toISOString();
      filters.push({ range: { createdAt: dateRange } });
    }

    // Realizar búsqueda con query_string para mayor flexibilidad
    // Agregar wildcards automáticamente para búsqueda parcial
    const searchQuery = `*${query.toLowerCase()}*`;
    
    console.log(`🔍 [Elasticsearch] Searching with query: "${searchQuery}"`);
    console.log(`📊 [Elasticsearch] Filters:`, JSON.stringify(filters, null, 2));
    
    const result = (await client.search({
      index: 'documents',
      query: {
        bool: {
          must: [
            {
              query_string: {
                query: searchQuery,
                fields: ['filename', 'originalname', 'content'],
                default_operator: 'AND',
                analyze_wildcard: true
              }
            }
          ],
          filter: filters
        }
      },
      from: offset,
      size: limit,
      sort: [
        { _score: { order: 'desc' } },
        { createdAt: { order: 'desc' } }
      ]
    })) as SearchResultLike;

    console.log(`✅ [Elasticsearch] Found ${typeof result.hits.total === 'object' ? result.hits.total.value : result.hits.total} documents in ${result.took}ms`);

    const documents = result.hits.hits.map((hit: any) => ({
      const doc = {
        id: hit._id,
        score: hit._score,
      ...(hit._source || {})
      };
      
      // Debug: Log cada documento encontrado
      console.log(`📄 [Elasticsearch] Document found:`, {
        id: doc.id,
        filename: doc.filename || doc.originalname,
        mimeType: doc.mimeType,
        score: doc.score
      });
      
      return doc;
    });

    return {
      documents,
      total:
        typeof result.hits.total === 'object' ? result.hits.total.value : result.hits.total || 0,
      took: result.took
    };
  } catch (error: unknown) {
    console.error('❌ Error searching documents:', getErrorMessage(error));
    throw error;
  }
}

/**
 * Obtener sugerencias de autocompletado
 */
export async function getAutocompleteSuggestions(
  query: string,
  userId: string,
  organizationId?: string,
  limit: number = 5
): Promise<string[]> {
  try {
    const client = getEsClient();

    // Construir filtros
    const filters: any[] = [];
    if (organizationId) {
      filters.push({ term: { organization: organizationId } });
    } else {
      filters.push({ term: { uploadedBy: userId } });
    }

    const searchQuery = `*${query.toLowerCase()}*`;
    
    const result = (await client.search({
      index: 'documents',
      query: {
        bool: {
          must: [
            {
              query_string: {
                query: searchQuery,
                fields: ['filename', 'originalname'],
                analyze_wildcard: true
              }
            }
          ],
          filter: filters
        }
      },
      size: limit,
      _source: ['filename', 'originalname']
    })) as SearchResultLike;

    const suggestions = result.hits.hits.map(hit => {
      const source = hit._source || {};
      const originalname = source.originalname;
      const filename = source.filename;
      if (typeof originalname === 'string') return originalname;
      if (typeof filename === 'string') return filename;
      return '';
    });

    // Eliminar duplicados manteniendo el orden y respetar el límite
    const unique: string[] = [];
    const seen = new Set<string>();
    for (const s of suggestions) {
      if (!s) continue;
      if (!seen.has(s)) {
        seen.add(s);
        unique.push(s);
        if (unique.length >= limit) break;
      }
    }

    return unique;
  } catch (error: unknown) {
    console.error('❌ Error getting autocomplete suggestions:', getErrorMessage(error));
    return [];
  }
}

export default {
  indexDocument,
  removeDocumentFromIndex,
  searchDocuments,
  getAutocompleteSuggestions
};
