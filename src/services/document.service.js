import Document from '../models/document.model.js';
import Folder from '../models/folder.model.js';
import fs from 'fs';

export async function shareDocument(id, userIds) {
  const doc = await Document.findByIdAndUpdate(
    id,
    { $addToSet: { sharedWith: { $each: userIds } } },
    { new: true }
  );
  if (!doc) throw new Error('Documento no encontrado');
  return doc;
}

export async function deleteDocument(id) {
  const doc = await Document.findByIdAndDelete(id);
  if (!doc) throw new Error('Documento no encontrado');
  const filePath = `storage/${doc.filename}`;
  fs.unlink(filePath, (err) => { if (err) console.error('Error al eliminar archivo:', err); });
  return doc;
}

export async function uploadDocument({ file, userId, folderId }) {
  const doc = await Document.create({
    filename: file.filename,
    originalname: file.originalname,
    url: `/storage/${file.filename}`,
    uploadedBy: userId,
    folder: folderId
  });
  if (folderId) {
    await Folder.findByIdAndUpdate(folderId, { $push: { documents: doc._id } });
  }
  return doc;
}

export function listDocuments(userId) {
  return Document.find({ uploadedBy: userId }).populate('folder');
}

export async function findDocumentById(id) {
  return Document.findById(id);
}
