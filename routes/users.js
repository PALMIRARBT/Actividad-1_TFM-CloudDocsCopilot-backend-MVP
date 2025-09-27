const express = require('express');
const { body } = require('express-validator');
const {
  searchUsers,
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(protect);

// Validaciones
const updateProfileValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail()
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número')
];

// Rutas
router.get('/search', searchUsers);
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.put('/change-password', changePasswordValidation, changePassword);
router.put('/deactivate', deactivateAccount);

module.exports = router;