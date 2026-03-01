import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as folderService from '../../../src/services/folder.service';
import User from '../../../src/models/user.model';
import Organization from '../../../src/models/organization.model';
import Folder from '../../../src/models/folder.model';
import Document from '../../../src/models/document.model';
import * as fs from 'fs';
import * as path from 'path';

let mongoServer: MongoMemoryServer;

describe('FolderService Integration Tests', (): void => {
  let testUserId: mongoose.Types.ObjectId;
  let testUser2Id: mongoose.Types.ObjectId;
  let testOrgId: mongoose.Types.ObjectId;
  let testOrgSlug: string;
  let rootFolderId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Crear usuario de prueba
    const user = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'hashedPassword123',
      role: 'user',
      storageUsed: 0
    });

    const user2 = await User.create({
      name: 'Test User 2',
      email: 'test2@test.com',
      password: 'hashedPassword123',
      role: 'user',
      storageUsed: 0
    });

    testUserId = user._id as mongoose.Types.ObjectId;
    testUser2Id = user2._id as mongoose.Types.ObjectId;

    // Crear organización
    const org = await Organization.create({
      name: 'Test Organization',
      slug: 'test-org',
      owner: testUserId,
      members: [testUserId, testUser2Id],
      settings: {
        maxStoragePerUser: 5368709120,
        allowedFileTypes: ['*'],
        maxUsers: 10
      }
    });

    testOrgId = org._id as mongoose.Types.ObjectId;
    testOrgSlug = org.slug;

    // Asignar organización a usuarios
    user.organization = testOrgId;
    await user.save();
    user2.organization = testOrgId;
    await user2.save();

    // Crear carpeta raíz
    const rootFolder = await Folder.create({
      name: `root_${testOrgSlug}_${testUserId}`,
      displayName: 'Mi Unidad',
      type: 'root',
      organization: testOrgId,
      owner: testUserId,
      parent: null,
      path: `/${testOrgSlug}/${testUserId}`,
      permissions: [
        {
          userId: testUserId,
          role: 'owner'
        }
      ]
    });

    rootFolderId = rootFolder._id as mongoose.Types.ObjectId;

    user.rootFolder = rootFolderId;
    await user.save();

    // Crear directorio físico
    const storageRoot = path.join(process.cwd(), 'storage');
    const orgPath = path.join(storageRoot, testOrgSlug, testUserId.toString());
    if (!fs.existsSync(orgPath)) {
      fs.mkdirSync(orgPath, { recursive: true });
    }
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Folder.deleteMany({});
    await Document.deleteMany({});

    // Limpiar directorios de prueba
    const storageRoot = path.join(process.cwd(), 'storage');
    if (fs.existsSync(storageRoot)) {
      try {
        fs.rmSync(storageRoot, { recursive: true, force: true });
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'code' in err) {
          const e = err as { code?: string };
          if (e.code === 'ENOTEMPTY' || e.code === 'EBUSY' || e.code === 'EPERM') {
            console.warn('Warning: could not fully remove storageRoot during cleanup:', e.code);
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    }
  });

  describe('validateFolderAccess', (): void => {
    it('should validate owner access', async (): Promise<void> => {
      const result = await folderService.validateFolderAccess(
        rootFolderId.toString(),
        testUserId.toString(),
        'owner'
      );

      expect(result).toBe(true);
    });

    it('should fail if user does not have required role', async (): Promise<void> => {
      // Compartir carpeta con viewer role
      const folder = await Folder.findById(rootFolderId);
      folder!.shareWith(testUser2Id.toString(), 'viewer');
      await folder!.save();

      await expect(
        folderService.validateFolderAccess(rootFolderId.toString(), testUser2Id.toString(), 'owner')
      ).rejects.toThrow('User does not have owner access to this folder');
    });

    it('should fail if folder does not exist', async (): Promise<void> => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        folderService.validateFolderAccess(fakeId.toString(), testUserId.toString())
      ).rejects.toThrow('Folder not found');
    });
  });

  describe('createFolder', (): void => {
    it('should create a folder with required parentId', async (): Promise<void> => {
      const newFolder = await folderService.createFolder({
        name: 'Projects',
        displayName: 'My Projects',
        owner: testUserId.toString(),
        organizationId: testOrgId.toString(),
        parentId: rootFolderId.toString()
      });

      expect(newFolder).toBeDefined();
      expect(newFolder.name).toBe('Projects');
      expect(newFolder.displayName).toBe('My Projects');
      expect(newFolder.type).toBe('folder');
      expect(newFolder.parent).toEqual(rootFolderId);
      expect(newFolder.organization).toEqual(testOrgId);
      expect(newFolder.path).toContain('Projects');
    });

    it('should create physical directory', async (): Promise<void> => {
      await folderService.createFolder({
        name: 'Documents',
        owner: testUserId.toString(),
        organizationId: testOrgId.toString(),
        parentId: rootFolderId.toString()
      });

      // Verificamos que el directorio del usuario exista
      const userPath = path.join(process.cwd(), 'storage', testOrgSlug, testUserId.toString());
      expect(fs.existsSync(userPath)).toBe(true);
    });

    it('should fail without parentId', async (): Promise<void> => {
      await expect(
        folderService.createFolder({
          name: 'Invalid Folder',
          owner: testUserId.toString(),
          organizationId: testOrgId.toString(),
          parentId: ''
        })
      ).rejects.toThrow('Parent folder ID is required');
    });

    it('should fail if parent folder does not exist', async (): Promise<void> => {
      const fakeParentId = new mongoose.Types.ObjectId();

      await expect(
        folderService.createFolder({
          name: 'Orphan Folder',
          owner: testUserId.toString(),
          organizationId: testOrgId.toString(),
          parentId: fakeParentId.toString()
        })
      ).rejects.toThrow('Folder not found');
    });

    it('should fail if user does not have editor access to parent', async (): Promise<void> => {
      // User2 no tiene acceso a la carpeta raíz de User1
      await expect(
        folderService.createFolder({
          name: 'Unauthorized Folder',
          owner: testUser2Id.toString(),
          organizationId: testOrgId.toString(),
          parentId: rootFolderId.toString()
        })
      ).rejects.toThrow('User does not have editor access to this folder');
    });
  });

  describe('getFolderContents', (): void => {
    it('should return folder with subfolders and documents', async (): Promise<void> => {
      // Crear subcarpeta
      const subfolder = await Folder.create({
        name: 'Subfolder',
        type: 'folder',
        organization: testOrgId,
        owner: testUserId,
        parent: rootFolderId,
        path: `/${testOrgSlug}/${testUserId}/Subfolder`,
        permissions: [{ userId: testUserId, role: 'owner' }]
      });

      // Crear documento
      const document = await Document.create({
        filename: 'test.txt',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 100,
        uploadedBy: testUserId,
        folder: rootFolderId,
        organization: testOrgId,
        path: `/${testOrgSlug}/${testUserId}/test.txt`
      });

      const result = await folderService.getFolderContents({
        folderId: rootFolderId.toString(),
        userId: testUserId.toString()
      });

      expect(result.folder).toBeDefined();
      expect(result.subfolders).toHaveLength(1);
      expect(result.subfolders[0]._id).toEqual(subfolder._id);
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0]._id).toEqual(document._id);
    });

    it('should fail if user does not have access', async (): Promise<void> => {
      await expect(
        folderService.getFolderContents({
          folderId: rootFolderId.toString(),
          userId: testUser2Id.toString()
        })
      ).rejects.toThrow('User does not have viewer access to this folder');
    });
  });

  describe('getUserFolderTree', (): void => {
    it('should return hierarchical folder tree', async (): Promise<void> => {
      // Crear estructura de carpetas
      const folder1 = await Folder.create({
        name: 'Folder1',
        type: 'folder',
        organization: testOrgId,
        owner: testUserId,
        parent: rootFolderId,
        path: `/${testOrgSlug}/${testUserId}/Folder1`,
        permissions: [{ userId: testUserId, role: 'owner' }]
      });

      await Folder.create({
        name: 'Folder2',
        type: 'folder',
        organization: testOrgId,
        owner: testUserId,
        parent: folder1._id,
        path: `/${testOrgSlug}/${testUserId}/Folder1/Folder2`,
        permissions: [{ userId: testUserId, role: 'owner' }]
      });

      const tree = await folderService.getUserFolderTree({
        userId: testUserId.toString(),
        organizationId: testOrgId.toString()
      });

      expect(tree).toBeDefined();
      expect(tree).not.toBeNull();
      expect(tree!._id.toString()).toBe(rootFolderId.toString());
      // El árbol debe tener hijos
      expect((tree as any).children).toBeDefined();
    });
  });

  describe('shareFolder', (): void => {
    it('should share folder with another user', async (): Promise<void> => {
      const sharedFolder = await folderService.shareFolder({
        folderId: rootFolderId.toString(),
        userId: testUserId.toString(),
        targetUserId: testUser2Id.toString(),
        role: 'editor'
      });

      expect(sharedFolder).toBeDefined();

      // Verificar que el usuario tenga acceso
      const hasAccess = sharedFolder.hasAccess(testUser2Id.toString(), 'editor');
      expect(hasAccess).toBe(true);
    });

    it('should fail if user is not owner', async (): Promise<void> => {
      // User2 no es owner
      await expect(
        folderService.shareFolder({
          folderId: rootFolderId.toString(),
          userId: testUser2Id.toString(),
          targetUserId: testUserId.toString(),
          role: 'viewer'
        })
      ).rejects.toThrow('User does not have owner access to this folder');
    });

    it('should fail if target user does not exist', async (): Promise<void> => {
      const fakeUserId = new mongoose.Types.ObjectId();

      await expect(
        folderService.shareFolder({
          folderId: rootFolderId.toString(),
          userId: testUserId.toString(),
          targetUserId: fakeUserId.toString(),
          role: 'viewer'
        })
      ).rejects.toThrow('Target user not found');
    });
  });

  describe('deleteFolder', (): void => {
    it('should delete empty folder', async (): Promise<void> => {
      const folder = await Folder.create({
        name: 'EmptyFolder',
        type: 'folder',
        organization: testOrgId,
        owner: testUserId,
        parent: rootFolderId,
        path: `/${testOrgSlug}/${testUserId}/EmptyFolder`,
        permissions: [{ userId: testUserId, role: 'owner' }]
      });

      const result = await folderService.deleteFolder({
        id: folder._id.toString(),
        userId: testUserId.toString()
      });

      expect(result.success).toBe(true);

      const deletedFolder = await Folder.findById(folder._id);
      expect(deletedFolder).toBeNull();
    });

    it('should fail to delete folder with documents without force', async (): Promise<void> => {
      const folder = await Folder.create({
        name: 'FolderWithDoc',
        type: 'folder',
        organization: testOrgId,
        owner: testUserId,
        parent: rootFolderId,
        path: `/${testOrgSlug}/${testUserId}/FolderWithDoc`,
        permissions: [{ userId: testUserId, role: 'owner' }]
      });

      await Document.create({
        filename: 'doc.txt',
        originalName: 'doc.txt',
        mimeType: 'text/plain',
        size: 100,
        uploadedBy: testUserId,
        folder: folder._id,
        organization: testOrgId,
        path: `/${testOrgSlug}/${testUserId}/FolderWithDoc/doc.txt`
      });

      await expect(
        folderService.deleteFolder({
          id: folder._id.toString(),
          userId: testUserId.toString()
        })
      ).rejects.toThrow('Folder is not empty');
    });

    it('should delete folder with documents when force is true', async (): Promise<void> => {
      const folder = await Folder.create({
        name: 'FolderToForceDelete',
        type: 'folder',
        organization: testOrgId,
        owner: testUserId,
        parent: rootFolderId,
        path: `/${testOrgSlug}/${testUserId}/FolderToForceDelete`,
        permissions: [{ userId: testUserId, role: 'owner' }]
      });

      await Document.create({
        filename: 'doc.txt',
        originalName: 'doc.txt',
        mimeType: 'text/plain',
        size: 100,
        uploadedBy: testUserId,
        folder: folder._id,
        organization: testOrgId,
        path: `/${testOrgSlug}/${testUserId}/FolderToForceDelete/doc.txt`
      });

      const result = await folderService.deleteFolder({
        id: folder._id.toString(),
        userId: testUserId.toString(),
        force: true
      });

      expect(result.success).toBe(true);

      const deletedFolder = await Folder.findById(folder._id);
      expect(deletedFolder).toBeNull();
    });

    it('should fail to delete root folder', async (): Promise<void> => {
      await expect(
        folderService.deleteFolder({
          id: rootFolderId.toString(),
          userId: testUserId.toString()
        })
      ).rejects.toThrow('Cannot delete root folder');
    });
  });

  describe('renameFolder', (): void => {
    it('should rename folder', async (): Promise<void> => {
      const folder = await Folder.create({
        name: 'OldName',
        type: 'folder',
        organization: testOrgId,
        owner: testUserId,
        parent: rootFolderId,
        path: `/${testOrgSlug}/${testUserId}/OldName`,
        permissions: [{ userId: testUserId, role: 'owner' }]
      });

      const renamed = await folderService.renameFolder({
        id: folder._id.toString(),
        userId: testUserId.toString(),
        name: 'NewName',
        displayName: 'New Display Name'
      });

      expect(renamed.name).toBe('NewName');
      expect(renamed.displayName).toBe('New Display Name');
      expect(renamed.path).toContain('NewName');
    });

    it('should update subfolder paths when parent is renamed', async (): Promise<void> => {
      const parent = await Folder.create({
        name: 'Parent',
        type: 'folder',
        organization: testOrgId,
        owner: testUserId,
        parent: rootFolderId,
        path: `/${testOrgSlug}/${testUserId}/Parent`,
        permissions: [{ userId: testUserId, role: 'owner' }]
      });

      const child = await Folder.create({
        name: 'Child',
        type: 'folder',
        organization: testOrgId,
        owner: testUserId,
        parent: parent._id,
        path: `/${testOrgSlug}/${testUserId}/Parent/Child`,
        permissions: [{ userId: testUserId, role: 'owner' }]
      });

      await folderService.renameFolder({
        id: parent._id.toString(),
        userId: testUserId.toString(),
        name: 'RenamedParent'
      });

      const updatedChild = await Folder.findById(child._id);
      expect(updatedChild!.path).toBe(`/${testOrgSlug}/${testUserId}/RenamedParent/Child`);
    });

    it('should fail to rename root folder technical name', async (): Promise<void> => {
      await expect(
        folderService.renameFolder({
          id: rootFolderId.toString(),
          userId: testUserId.toString(),
          name: 'NewRootName'
        })
      ).rejects.toThrow('Cannot rename root folder technical name');
    });

    it('should allow changing root folder displayName', async (): Promise<void> => {
      const renamed = await folderService.renameFolder({
        id: rootFolderId.toString(),
        userId: testUserId.toString(),
        name: `root_${testOrgSlug}_${testUserId}`, // Same technical name
        displayName: 'My New Drive'
      });

      expect(renamed.displayName).toBe('My New Drive');
    });
  });
});
