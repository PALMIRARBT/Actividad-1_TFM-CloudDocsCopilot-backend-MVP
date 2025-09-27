// Configuración global para las pruebas
require('dotenv').config({ path: '.env.test' });

// Timeout para las pruebas
jest.setTimeout(10000);

// Configurar variables de entorno para pruebas
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing';
process.env.MONGODB_URI_TEST = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/clouddocs-test';