const Folder = require('../models/folder.model.js');

function createFolder({ name, owner }) {
  return Folder.create({ name, owner });
}

function listFolders(owner) {
  return Folder.find({ owner }).populate('documents');
}

module.exports = { createFolder, listFolders };
