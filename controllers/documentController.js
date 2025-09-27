const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');

// @desc    Subir documento
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se seleccionó ningún archivo'
      });
    }

    const { description, tags, folderId } = req.body;

    const document = await Document.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      owner: req.user.id,
      folder: folderId || null,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await document.populate('owner', 'username email');
    
    res.status(201).json({
      success: true,
      message: 'Documento subido exitosamente',
      data: document
    });
  } catch (error) {
    // Eliminar archivo si hay error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log('Error eliminando archivo:', err);
      });
    }
    next(error);
  }
};

// @desc    Obtener documentos del usuario
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res, next) => {
  try {
    const { folder, search, page = 1, limit = 10 } = req.query;
    const query = { owner: req.user.id };

    if (folder) {
      query.folder = folder;
    }

    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const documents = await Document.find(query)
      .populate('owner', 'username email')
      .populate('folder', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      count: documents.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit)
      },
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Descargar documento
// @route   GET /api/documents/:id/download
// @access  Private
const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar permisos
    const canAccess = document.owner.toString() === req.user.id ||
                     document.isPublic ||
                     document.sharedWith.some(share => share.user.toString() === req.user.id);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para descargar este documento'
      });
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado en el servidor'
      });
    }

    // Incrementar contador de descargas
    await Document.findByIdAndUpdate(req.params.id, {
      $inc: { downloadCount: 1 }
    });

    // Enviar archivo
    res.download(document.path, document.originalName);
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar documento
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar que el usuario es el propietario
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este documento'
      });
    }

    // Eliminar archivo del sistema de archivos
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    // Eliminar documento de la base de datos
    await Document.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Documento eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compartir documento
// @route   PUT /api/documents/:id/share
// @access  Private
const shareDocument = async (req, res, next) => {
  try {
    const { userIds, permission = 'read', isPublic } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar que el usuario es el propietario
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para compartir este documento'
      });
    }

    // Actualizar configuración de compartir
    if (typeof isPublic !== 'undefined') {
      document.isPublic = isPublic;
    }

    if (userIds && Array.isArray(userIds)) {
      // Agregar nuevos usuarios compartidos
      userIds.forEach(userId => {
        const existingShare = document.sharedWith.find(
          share => share.user.toString() === userId
        );
        
        if (!existingShare) {
          document.sharedWith.push({ user: userId, permission });
        }
      });
    }

    await document.save();

    res.json({
      success: true,
      message: 'Documento compartido exitosamente',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  downloadDocument,
  deleteDocument,
  shareDocument
};