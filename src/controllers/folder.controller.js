import { createFolder, listFolders } from '../services/folder.service.js';

export async function create(req, res) {
  try {
    const folder = await createFolder({ name: req.body.name, owner: req.user.id });
    res.status(201).json(folder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function list(req, res) {
  const folders = await listFolders(req.user.id);
  res.json(folders);
}
