const Folder = require('../models/Folder');
const Document = require('../models/Document');

// @desc    Crear carpeta
// @route   POST /api/folders
// @access  Private
const createFolder = async (req, res, next) => {
  try {
    const { name, description, parentFolderId } = req.body;

    // Verificar si ya existe una carpeta con el mismo nombre en la misma ubicación
    const existingFolder = await Folder.findOne({
      name,
      owner: req.user.id,
      parentFolder: parentFolderId || null
    });

    if (existingFolder) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una carpeta con este nombre en esta ubicación'
      });
    }

    // Construir ruta
    let path = '/';
    if (parentFolderId) {
      const parentFolder = await Folder.findById(parentFolderId);
      if (!parentFolder || parentFolder.owner.toString() !== req.user.id) {
        return res.status(404).json({
          success: false,
          message: 'Carpeta padre no encontrada'
        });
      }
      path = `${parentFolder.path}${parentFolder.name}/`;
    }

    const folder = await Folder.create({
      name,
      description,
      owner: req.user.id,
      parentFolder: parentFolderId || null,
      path
    });

    await folder.populate('owner', 'username email');

    res.status(201).json({
      success: true,
      message: 'Carpeta creada exitosamente',
      data: folder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener carpetas del usuario
// @route   GET /api/folders
// @access  Private
const getFolders = async (req, res, next) => {
  try {
    const { parentFolder, search } = req.query;
    const query = { owner: req.user.id };

    if (parentFolder) {
      query.parentFolder = parentFolder;
    } else {
      query.parentFolder = null; // Carpetas raíz
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const folders = await Folder.find(query)
      .populate('owner', 'username email')
      .populate('parentFolder', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: folders.length,
      data: folders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener carpeta por ID
// @route   GET /api/folders/:id
// @access  Private
const getFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('parentFolder', 'name');

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Carpeta no encontrada'
      });
    }

    // Verificar permisos
    const canAccess = folder.owner.toString() === req.user.id ||
                     folder.isPublic ||
                     folder.sharedWith.some(share => share.user.toString() === req.user.id);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a esta carpeta'
      });
    }

    // Obtener subcarpetas y documentos
    const subFolders = await Folder.find({
      parentFolder: folder._id,
      owner: req.user.id
    }).select('name description createdAt');

    const documents = await Document.find({
      folder: folder._id,
      owner: req.user.id
    }).select('originalName size mimeType createdAt');

    res.json({
      success: true,
      data: {
        folder,
        subFolders,
        documents
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar carpeta
// @route   PUT /api/folders/:id
// @access  Private
const updateFolder = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Carpeta no encontrada'
      });
    }

    // Verificar que el usuario es el propietario
    if (folder.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar esta carpeta'
      });
    }

    // Verificar nombre único en la misma ubicación
    if (name && name !== folder.name) {
      const existingFolder = await Folder.findOne({
        name,
        owner: req.user.id,
        parentFolder: folder.parentFolder,
        _id: { $ne: folder._id }
      });

      if (existingFolder) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una carpeta con este nombre en esta ubicación'
        });
      }
    }

    folder.name = name || folder.name;
    folder.description = description || folder.description;

    await folder.save();

    res.json({
      success: true,
      message: 'Carpeta actualizada exitosamente',
      data: folder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar carpeta
// @route   DELETE /api/folders/:id
// @access  Private
const deleteFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Carpeta no encontrada'
      });
    }

    // Verificar que el usuario es el propietario
    if (folder.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta carpeta'
      });
    }

    // Verificar que la carpeta esté vacía
    const subFolders = await Folder.countDocuments({ parentFolder: folder._id });
    const documents = await Document.countDocuments({ folder: folder._id });

    if (subFolders > 0 || documents > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una carpeta que contiene archivos o subcarpetas'
      });
    }

    await Folder.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Carpeta eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compartir carpeta
// @route   PUT /api/folders/:id/share
// @access  Private
const shareFolder = async (req, res, next) => {
  try {
    const { userIds, permission = 'read', isPublic } = req.body;

    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Carpeta no encontrada'
      });
    }

    // Verificar que el usuario es el propietario
    if (folder.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para compartir esta carpeta'
      });
    }

    // Actualizar configuración de compartir
    if (typeof isPublic !== 'undefined') {
      folder.isPublic = isPublic;
    }

    if (userIds && Array.isArray(userIds)) {
      userIds.forEach(userId => {
        const existingShare = folder.sharedWith.find(
          share => share.user.toString() === userId
        );
        
        if (!existingShare) {
          folder.sharedWith.push({ user: userId, permission });
        }
      });
    }

    await folder.save();

    res.json({
      success: true,
      message: 'Carpeta compartida exitosamente',
      data: folder
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFolder,
  getFolders,
  getFolder,
  updateFolder,
  deleteFolder,
  shareFolder
};