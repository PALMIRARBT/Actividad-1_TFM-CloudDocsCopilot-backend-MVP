import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../../../src/middlewares/auth.middleware';
import {
  upload,
  replaceFile,
  list,
  listSharedToMe,
  getRecent,
  getById,
  share,
  move,
  copy,
  remove
} from '../../../src/controllers/document.controller';
import * as documentService from '../../../src/services/document.service';
import HttpError from '../../../src/models/error.model';
import { IDocument } from '../../../src/models/document.model';

jest.mock('../../../src/services/document.service');
jest.mock('../../../src/utils/path-sanitizer');
jest.mock('../../../src/services/membership.service');

describe('Document Controller', (): void => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<(err?: unknown) => void>;

  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockOrgId = new mongoose.Types.ObjectId().toString();
  const mockDocId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    mockRequest = {
      user: { id: mockUserId, email: 'test@example.com' } as AuthRequest['user'],
      body: {},
      params: {},
      query: {},
      file: undefined
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendFile: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn() as jest.MockedFunction<(err?: unknown) => void>;
    jest.clearAllMocks();
  });

  describe('upload', (): void => {
    it('should upload document successfully', async (): Promise<void> => {
      const mockFile = {
        originalname: 'test.pdf',
        filename: 'test-123.pdf',
        path: '/uploads/test-123.pdf',
        mimetype: 'application/pdf',
        size: 1024
      } as Express.Multer.File;

      mockRequest.file = mockFile;

      const mockDocument = {
        _id: mockDocId,
        filename: 'test-123.pdf',
        originalname: 'test.pdf',
        uploadedBy: mockUserId
      };

      (documentService.uploadDocument as jest.Mock).mockResolvedValue(mockDocument);

      await upload(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(documentService.uploadDocument).toHaveBeenCalledWith({
        file: mockFile,
        userId: mockUserId,
        folderId: undefined
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Document uploaded successfully',
        document: mockDocument
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when file is missing', async (): Promise<void> => {
      mockRequest.file = undefined;

      await upload(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new HttpError(400, 'File is required'));
      expect(documentService.uploadDocument).not.toHaveBeenCalled();
    });

    it('should upload document with folderId', async (): Promise<void> => {
      const mockFile = {
        originalname: 'test.pdf',
        filename: 'test-123.pdf',
        path: '/uploads/test-123.pdf',
        mimetype: 'application/pdf',
        size: 1024
      } as Express.Multer.File;

      mockRequest.file = mockFile;
      mockRequest.body = { folderId: 'folder-123' };

      const mockDocument = { _id: mockDocId, filename: 'test.pdf' };
      (documentService.uploadDocument as jest.Mock).mockResolvedValue(mockDocument);

      await upload(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(documentService.uploadDocument).toHaveBeenCalledWith({
        file: mockFile,
        userId: mockUserId,
        folderId: 'folder-123'
      });
    });

    it('should handle upload errors', async (): Promise<void> => {
      const mockFile = { originalname: 'test.pdf' } as Express.Multer.File;
      mockRequest.file = mockFile;

      const error = new Error('Upload failed');
      (documentService.uploadDocument as jest.Mock).mockRejectedValue(error);

      await upload(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle database errors during upload', async (): Promise<void> => {
      const mockFile = { originalname: 'test.pdf' } as Express.Multer.File;
      mockRequest.file = mockFile;

      const dbError = new Error('Database connection failed');
      (documentService.uploadDocument as jest.Mock).mockRejectedValue(dbError);

      await upload(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(dbError);
    });
  });

  describe('replaceFile', (): void => {
    it('should replace document file successfully', async (): Promise<void> => {
      const mockFile = { originalname: 'new-file.pdf' } as Express.Multer.File;
      mockRequest.file = mockFile;
      mockRequest.params = { id: mockDocId };

      const mockDocument = { _id: mockDocId, filename: 'new-file.pdf' };
      (documentService.replaceDocumentFile as jest.Mock).mockResolvedValue(mockDocument);

      await replaceFile(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(documentService.replaceDocumentFile).toHaveBeenCalledWith({
        documentId: mockDocId,
        userId: mockUserId,
        file: mockFile
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Document file replaced successfully',
        document: mockDocument
      });
    });

    it('should return 400 when file is missing', async (): Promise<void> => {
      mockRequest.file = undefined;
      mockRequest.params = { id: mockDocId };

      await replaceFile(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new HttpError(400, 'File is required'));
    });

    it('should return 404 when document not found', async (): Promise<void> => {
      const mockFile = { originalname: 'new-file.pdf' } as Express.Multer.File;
      mockRequest.file = mockFile;
      mockRequest.params = { id: 'non-existent-id' };

      const error = new Error('Document not found');
      (documentService.replaceDocumentFile as jest.Mock).mockRejectedValue(error);

      await replaceFile(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new HttpError(404, 'Document not found'));
    });

    it('should pass through other errors', async (): Promise<void> => {
      const mockFile = { originalname: 'new-file.pdf' } as Express.Multer.File;
      mockRequest.file = mockFile;
      mockRequest.params = { id: mockDocId };

      const error = new Error('Permission denied');
      (documentService.replaceDocumentFile as jest.Mock).mockRejectedValue(error);

      await replaceFile(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('list', (): void => {
    it('should list user documents successfully', async (): Promise<void> => {
      const mockDocuments = [
        { _id: '1', filename: 'doc1.pdf' },
        { _id: '2', filename: 'doc2.pdf' }
      ];

      (documentService.listDocuments as jest.Mock).mockResolvedValue(mockDocuments);

      await list(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(documentService.listDocuments).toHaveBeenCalledWith(mockUserId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        documents: mockDocuments
      });
    });

    it('should return empty array when user has no documents', async (): Promise<void> => {
      (documentService.listDocuments as jest.Mock).mockResolvedValue([]);

      await list(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        documents: []
      });
    });

    it('should handle errors when listing documents', async (): Promise<void> => {
      const error = new Error('Database error');
      (documentService.listDocuments as jest.Mock).mockRejectedValue(error);

      await list(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listSharedToMe', (): void => {
    it('should list shared documents successfully', async (): Promise<void> => {
      const mockSharedDocs = [
        { _id: '1', filename: 'shared1.pdf', sharedBy: 'user123' },
        { _id: '2', filename: 'shared2.pdf', sharedBy: 'user456' }
      ];

      (documentService.listSharedDocumentsToUser as jest.Mock).mockResolvedValue(mockSharedDocs);

      await listSharedToMe(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(documentService.listSharedDocumentsToUser).toHaveBeenCalledWith(mockUserId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        documents: mockSharedDocs
      });
    });

    it('should return empty array when no documents are shared', async (): Promise<void> => {
      (documentService.listSharedDocumentsToUser as jest.Mock).mockResolvedValue([]);

      await listSharedToMe(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        documents: []
      });
    });

    it('should handle errors when listing shared documents', async (): Promise<void> => {
      const error = new Error('Database error');
      (documentService.listSharedDocumentsToUser as jest.Mock).mockRejectedValue(error);

      await listSharedToMe(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getRecent', (): void => {
    it('should get recent documents with default limit', async (): Promise<void> => {
      mockRequest.params = { organizationId: mockOrgId };
      mockRequest.query = {};

      const mockRecentDocs = [{ _id: '1', filename: 'recent.pdf' }];
      (documentService.getUserRecentDocuments as jest.Mock).mockResolvedValue(mockRecentDocs);

      await getRecent(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(documentService.getUserRecentDocuments).toHaveBeenCalledWith({
        userId: mockUserId,
        limit: 10
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        documents: mockRecentDocs
      });
    });

    it('should get recent documents with custom limit', async (): Promise<void> => {
      mockRequest.params = { organizationId: mockOrgId };
      mockRequest.query = { limit: '5' };

      const mockRecentDocs: IDocument[] = [];
      (documentService.getUserRecentDocuments as jest.Mock).mockResolvedValue(mockRecentDocs);

      await getRecent(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(documentService.getUserRecentDocuments).toHaveBeenCalledWith({
        userId: mockUserId,
        limit: 5
      });
    });

    it('should return 400 when organizationId is missing', async (): Promise<void> => {
      mockRequest.params = {};

      await getRecent(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new HttpError(400, 'Organization ID is required'));
    });

    it('should return 400 when organizationId is invalid', async (): Promise<void> => {
      mockRequest.params = { organizationId: 'invalid-id' };

      await getRecent(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new HttpError(400, 'Invalid Organization ID'));
    });

    it('should handle errors when getting recent documents', async (): Promise<void> => {
      mockRequest.params = { organizationId: mockOrgId };
      mockRequest.query = {};

      const error = new Error('Database error');
      (documentService.getUserRecentDocuments as jest.Mock).mockRejectedValue(error);

      await getRecent(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', (): void => {
    it('should get document by ID successfully', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };

      const mockDocument: IDocument = {
        _id: new mongoose.Types.ObjectId(),
        filename: 'document.pdf',
        mimeType: 'application/pdf',
        size: 123,
        uploadedBy: new mongoose.Types.ObjectId(),
        organization: new mongoose.Types.ObjectId(),
        folder: new mongoose.Types.ObjectId(),
        path: '/uploads/document.pdf',
        uploadedAt: new Date(),
        sharedWith: [],
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Add additional required fields with mock values as needed for your IDocument interface
      } as unknown as IDocument;
      (documentService.findDocumentById as jest.Mock).mockResolvedValue(mockDocument);

      await getById(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(documentService.findDocumentById).toHaveBeenCalledWith(mockDocId);
    });

    it('should return 404 when document not found', async (): Promise<void> => {
      mockRequest.params = { id: 'non-existent-id' };

      (documentService.findDocumentById as jest.Mock).mockResolvedValue(null);

      await getById(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new HttpError(404, 'Document not found'));
    });
  });

  describe('share', (): void => {
    it('should share document successfully', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };
      mockRequest.body = { userIds: ['user456', 'user789'] };

      const mockSharedDoc: IDocument = {
        _id: new mongoose.Types.ObjectId(),
        filename: 'shared.pdf',
        mimeType: 'application/pdf',
        size: 123,
        uploadedBy: new mongoose.Types.ObjectId(),
        organization: new mongoose.Types.ObjectId(),
        folder: new mongoose.Types.ObjectId(),
        path: '/uploads/shared.pdf',
        uploadedAt: new Date(),
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        sharedWith: [
          new mongoose.Types.ObjectId('64b7f7f7f7f7f7f7f7f7f7f7'),
          new mongoose.Types.ObjectId('64b7f7f7f7f7f7f7f7f7f7f8')
        ],
        // Add any additional required fields with mock values as needed
      } as unknown as IDocument;
      (documentService.shareDocument as jest.Mock).mockResolvedValue(mockSharedDoc);

      await share(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(documentService.shareDocument).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Document shared successfully',
        document: mockSharedDoc
      });
    });

    it('should return 400 when userIds is missing', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };
      mockRequest.body = {};

      await share(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new HttpError(400, 'User IDs array is required'));
    });

    it('should return 400 when userIds is not an array', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };
      mockRequest.body = { userIds: 'user456' };

      await share(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new HttpError(400, 'User IDs array is required'));
    });

    it('should return 400 when userIds is empty array', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };
      mockRequest.body = { userIds: [] };

      await share(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new HttpError(400, 'User IDs array is required'));
    });

    it('should return 404 when document not found', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };
      mockRequest.body = { userIds: ['user456'] };

      const error = new Error('Document not found');
      (documentService.shareDocument as jest.Mock).mockRejectedValue(error);

      await share(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new HttpError(404, 'Document not found'));
    });

    it('should handle errors when sharing document', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };
      mockRequest.body = { userIds: ['user456'] };

      const error = new Error('Permission denied');
      (documentService.shareDocument as jest.Mock).mockRejectedValue(error);

      await share(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('move', (): void => {
    it('should move document successfully', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };
      mockRequest.body = { targetFolderId: 'folder-456' };

      const mockMovedDoc: IDocument = {
        _id: new mongoose.Types.ObjectId(),
        filename: 'moved.pdf',
        mimeType: 'application/pdf',
        size: 123,
        uploadedBy: new mongoose.Types.ObjectId(),
        organization: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        folder: new mongoose.Types.ObjectId(),
        path: '/uploads/moved.pdf',
        uploadedAt: new Date(),
        sharedWith: [],
        isDeleted: false,
        // Add any additional required fields with mock values as needed
      } as unknown as IDocument;
      (documentService.moveDocument as jest.Mock).mockResolvedValue(mockMovedDoc);

      await move(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(documentService.moveDocument).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Document moved successfully',
        document: mockMovedDoc
      });
    });

    it('should return 400 when targetFolderId is missing', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };
      mockRequest.body = {};

      await move(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new HttpError(400, 'Target folder ID is required'));
    });

    it('should handle errors when moving document', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };
      mockRequest.body = { targetFolderId: 'folder-456' };

      const error = new Error('Folder not found');
      (documentService.moveDocument as jest.Mock).mockRejectedValue(error);

      await move(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('copy', (): void => {
    it('should copy document successfully', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };
      mockRequest.body = { targetFolderId: 'folder-789' };

      const mockCopiedDoc: IDocument = {
        _id: new mongoose.Types.ObjectId(),
        filename: 'document-copy.pdf',
        mimeType: 'application/pdf',
        size: 123,
        uploadedBy: new mongoose.Types.ObjectId(),
        organization: new mongoose.Types.ObjectId(),
        folder: new mongoose.Types.ObjectId(),
        path: '/uploads/document-copy.pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
        uploadedAt: new Date(),
        sharedWith: [],
        // Add any additional required fields with mock values as needed
      } as unknown as IDocument;
      (documentService.copyDocument as jest.Mock).mockResolvedValue(mockCopiedDoc);

      await copy(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(documentService.copyDocument).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Document copied successfully',
        document: mockCopiedDoc
      });
    });

    it('should return 400 when targetFolderId is missing', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };
      mockRequest.body = {};

      await copy(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new HttpError(400, 'Target folder ID is required'));
    });

    it('should handle errors when copying document', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };
      mockRequest.body = { targetFolderId: 'folder-789' };

      const error = new Error('Document not found');
      (documentService.copyDocument as jest.Mock).mockRejectedValue(error);

      await copy(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('remove', (): void => {
    it('should remove document successfully', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };

      (documentService.deleteDocument as jest.Mock).mockResolvedValue(undefined);

      await remove(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(documentService.deleteDocument).toHaveBeenCalled();
    });

    it('should handle errors when removing document', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };

      const error = new Error('Document not found');
      (documentService.deleteDocument as jest.Mock).mockRejectedValue(error);

      await remove(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('Edge cases', (): void => {
    it('should handle missing user in request', async (): Promise<void> => {
      mockRequest.user = undefined;

      await upload(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      // Should handle gracefully or throw error based on implementation
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle invalid document IDs', async (): Promise<void> => {
      mockRequest.params = { id: 'invalid-object-id' };

      const error = new Error('Invalid ID');
      (documentService.findDocumentById as jest.Mock).mockRejectedValue(error);

      await getById(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle concurrent operations', async (): Promise<void> => {
      mockRequest.params = { id: mockDocId };

      const mockDocument = { _id: mockDocId, filename: 'test.pdf' };
      (documentService.findDocumentById as jest.Mock).mockResolvedValue(mockDocument);

      const promises = [
        getById(mockRequest as AuthRequest, mockResponse as Response, mockNext),
        getById(mockRequest as AuthRequest, mockResponse as Response, mockNext)
      ];

      await Promise.all(promises);

      expect(documentService.findDocumentById).toHaveBeenCalledTimes(2);
    });
  });
});
