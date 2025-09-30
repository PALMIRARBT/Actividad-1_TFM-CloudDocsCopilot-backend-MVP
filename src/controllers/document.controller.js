import { shareDocument, deleteDocument, uploadDocument, listDocuments, findDocumentById } from '../services/document.service.js';

export async function share(req, res) {
  try {
    const doc = await shareDocument(req.params.id, req.body.userIds);
    res.json({ message: 'Documento compartido', doc });
  } catch (err) {
    const status = err.message === 'Documento no encontrado' ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
}

export async function remove(req, res) {
  try {
    await deleteDocument(req.params.id);
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (err) {
    const status = err.message === 'Documento no encontrado' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function upload(req, res) {
  try {
    const doc = await uploadDocument({ file: req.file, userId: req.user.id, folderId: req.body.folderId });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function list(req, res) {
  const docs = await listDocuments(req.user.id);
  res.json(docs);
}

export async function download(req, res) {
  try {
    const doc = await findDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
    const filePath = `storage/${doc.filename}`;
    res.download(filePath, doc.originalname);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
