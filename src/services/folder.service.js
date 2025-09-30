import Folder from '../models/folder.model.js';

export function createFolder({ name, owner }) {
  return Folder.create({ name, owner });
}

export function listFolders(owner) {
  return Folder.find({ owner }).populate('documents');
}
