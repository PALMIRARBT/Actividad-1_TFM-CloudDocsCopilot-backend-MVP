// IMPORTANT: These mocks must be set up BEFORE importing search.service
// We unmock search.service since it's auto-mocked in jest.unit.setup.ts
jest.unmock('../../../src/services/search.service');

// Mock Elasticsearch with a proper factory function  
jest.mock('../../../src/configurations/elasticsearch-config', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn()
  }
}));

// Mock Document model
jest.mock('../../../src/models/document.model');

// NOW import after mocks are configured
import { searchDocuments, getAutocompleteSuggestions, SearchParams } from '../../../src/services/search.service';
import Document from '../../../src/models/document.model';
import ElasticsearchClient from '../../../src/configurations/elasticsearch-config';

describe('Search Service - Fallback to MongoDB', () => {
  const VALID_OBJECT_ID = '507f1f77bcf86cd799439011';
  const VALID_ORG_ID = '507f1f77bcf86cd799439012';
  const VALID_FOLDER_ID = '507f1f77bcf86cd799439013';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchDocuments', () => {
    it('should use Elasticsearch when available', async () => {
      // Arrange
      const mockEsClient = {
        search: jest.fn().mockResolvedValue({
          hits: {
            total: { value: 1 },
            hits: [
              {
                _id: '123',
                _score: 1.5,
                _source: {
                  filename: 'test.pdf',
                  originalname: 'test.pdf',
                  mimeType: 'application/pdf'
                }
              }
            ]
          },
          took: 50
        })
      };

      (ElasticsearchClient.getInstance as jest.Mock).mockReturnValue(mockEsClient);

      const params: SearchParams = {
        query: 'test',
        userId: VALID_OBJECT_ID,
        organizationId: VALID_ORG_ID
      };

      // Act
      const result = await searchDocuments(params);

      // Assert
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].filename).toBe('test.pdf');
      expect(result.total).toBe(1);
      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should fallback to MongoDB when Elasticsearch fails', async () => {
      // Arrange
      const mockEsClient = {
        search: jest.fn().mockRejectedValue(new Error('ES Connection failed'))
      };

      (ElasticsearchClient.getInstance as jest.Mock).mockReturnValue(mockEsClient);

      const mockMongoDocs = [
        {
          _id: { toString: () => VALID_OBJECT_ID },
          filename: 'test.pdf',
          originalname: 'test.pdf',
          mimeType: 'application/pdf',
          size: 1000,
          uploadedBy: { toString: () => VALID_OBJECT_ID },
          organization: { toString: () => VALID_ORG_ID },
          folder: { toString: () => VALID_FOLDER_ID },
          uploadedAt: new Date(),
          isDeleted: false
        }
      ];

      (Document.countDocuments as jest.Mock).mockResolvedValue(1);
      (Document.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockMongoDocs)
      });

      const params: SearchParams = {
        query: 'test',
        userId: VALID_OBJECT_ID,
        organizationId: VALID_ORG_ID
      };

      // Act
      const result = await searchDocuments(params);

      // Assert
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].filename).toBe('test.pdf');
      expect(result.total).toBe(1);
    });

    it('should throw HttpError when both ES and MongoDB fail', async () => {
      // Arrange
      const mockEsClient = {
        search: jest.fn().mockRejectedValue(new Error('ES failed'))
      };

      (ElasticsearchClient.getInstance as jest.Mock).mockReturnValue(mockEsClient);
      (Document.countDocuments as jest.Mock).mockRejectedValue(new Error('MongoDB failed'));

      const params: SearchParams = {
        query: 'test',
        userId: VALID_OBJECT_ID
      };

      // Act & Assert
      await expect(searchDocuments(params)).rejects.toThrow('Error searching documents');
    });
  });

  describe('getAutocompleteSuggestions', () => {
    it('should use Elasticsearch when available', async () => {
      // Arrange
      const mockEsClient = {
        search: jest.fn().mockResolvedValue({
          hits: {
            hits: [
              {
                _score: 1.5,
                _source: {
                  filename: 'report.pdf',
                  originalname: 'Annual Report.pdf'
                }
              }
            ]
          }
        })
      };

      (ElasticsearchClient.getInstance as jest.Mock).mockReturnValue(mockEsClient);

      // Act
      const result = await getAutocompleteSuggestions('report', VALID_OBJECT_ID, VALID_ORG_ID, 5);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('Annual Report.pdf');
      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should fallback to MongoDB when Elasticsearch fails', async () => {
      // Arrange
      const mockEsClient = {
        search: jest.fn().mockRejectedValue(new Error('ES Connection failed'))
      };

      (ElasticsearchClient.getInstance as jest.Mock).mockReturnValue(mockEsClient);

      const mockMongoDocs = [
        {
          _id: { toString: () => '123' },
          filename: 'report.pdf',
          originalname: 'Annual Report.pdf'
        }
      ];

      (Document.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockMongoDocs)
      });

      // Act
      const result = await getAutocompleteSuggestions('report', VALID_OBJECT_ID, VALID_ORG_ID, 5);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('Annual Report.pdf');
    });

    it('should return empty array when both ES and MongoDB fail', async () => {
      // Arrange
      const mockEsClient = {
        search: jest.fn().mockRejectedValue(new Error('ES failed'))
      };

      (ElasticsearchClient.getInstance as jest.Mock).mockReturnValue(mockEsClient);
      (Document.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error('MongoDB failed'))
      });

      // Act
      const result = await getAutocompleteSuggestions('report', VALID_OBJECT_ID);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
