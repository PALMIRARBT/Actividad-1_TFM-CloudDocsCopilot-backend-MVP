# CloudDocs Backend MVP

API REST completa para la gestión de usuarios, documentos y carpetas en la nube. Sistema robusto implementado con las mejores prácticas de desarrollo backend.

## 🚀 Tecnologías Principales

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web minimalista y flexible  
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación y autorización
- **Multer** - Manejo de archivos multipart
- **bcryptjs** - Hashing de contraseñas

## ✨ Funcionalidades Implementadas

### 🔐 Sistema de Autenticación
- ✅ Registro de usuarios con validaciones robustas
- ✅ Inicio de sesión con JWT
- ✅ Middleware de protección de rutas
- ✅ Gestión de perfiles de usuario
- ✅ Cambio de contraseñas seguro

### 📁 Gestión de Documentos
- ✅ Subida de archivos con validación de tipo y tamaño
- ✅ Descarga segura de documentos
- ✅ Eliminación de archivos
- ✅ Sistema de compartir documentos
- ✅ Búsqueda y filtrado avanzado
- ✅ Contador de descargas
- ✅ Sistema de etiquetas

### 🗂️ Gestión de Carpetas
- ✅ Creación y organización jerárquica
- ✅ Navegación por estructura de carpetas
- ✅ Compartir carpetas con permisos
- ✅ Eliminación segura (solo carpetas vacías)

### 👥 Gestión de Usuarios
- ✅ Búsqueda de usuarios para compartir
- ✅ Actualización de perfiles
- ✅ Desactivación de cuentas
- ✅ Sistema de roles (user/admin)

## 📊 Estado Actual

**✅ MVP COMPLETO - LISTO PARA INTEGRACIÓN CON FRONTEND**

- ✅ Todos los endpoints implementados y probados
- ✅ Middleware de seguridad configurado
- ✅ Validaciones y manejo de errores
- ✅ Estructura de proyecto escalable
- ✅ Documentación completa de API

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (v14 o superior)
- MongoDB (v4.4 o superior)
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone https://github.com/PALMIRARBT/Actividad-1_TFM-CloudDocsCopilot-backend-MVP.git
cd Actividad-1_TFM-CloudDocsCopilot-backend-MVP
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus configuraciones
```

Configuración del archivo `.env`:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration  
MONGODB_URI=mongodb://localhost:27017/clouddocs

# JWT Configuration
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000
```

### 4. Iniciar MongoDB
```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS con Homebrew
brew services start mongodb-community

# Windows - Ejecutar mongod.exe
```

### 5. Ejecutar la aplicación

#### Modo desarrollo
```bash
npm run dev
```

#### Modo producción
```bash
npm start
```

## 🧪 Testing

### Ejecutar pruebas
```bash
# Todas las pruebas
npm test

# Con coverage
npm run test:coverage

# Modo watch para desarrollo
npm run test:watch
```

## 📚 API Endpoints

### Base URL: `http://localhost:3000`

### 🔐 Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registrar nuevo usuario | ❌ |
| POST | `/login` | Iniciar sesión | ❌ |
| GET | `/me` | Obtener usuario actual | ✅ |

### 📁 Documentos (`/api/documents`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar documentos | ✅ |
| POST | `/` | Subir documento | ✅ |
| GET | `/:id/download` | Descargar documento | ✅ |
| DELETE | `/:id` | Eliminar documento | ✅ |
| PUT | `/:id/share` | Compartir documento | ✅ |

### 🗂️ Carpetas (`/api/folders`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar carpetas | ✅ |
| POST | `/` | Crear carpeta | ✅ |
| GET | `/:id` | Obtener carpeta específica | ✅ |
| PUT | `/:id` | Actualizar carpeta | ✅ |
| DELETE | `/:id` | Eliminar carpeta | ✅ |
| PUT | `/:id/share` | Compartir carpeta | ✅ |

### 👥 Usuarios (`/api/users`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/search` | Buscar usuarios | ✅ |
| GET | `/profile` | Obtener perfil | ✅ |
| PUT | `/profile` | Actualizar perfil | ✅ |
| PUT | `/change-password` | Cambiar contraseña | ✅ |
| PUT | `/deactivate` | Desactivar cuenta | ✅ |

### 🏥 Estado (`/api/health`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Estado de la API | ❌ |

## 🔧 Estructura del Proyecto

```
├── config/
│   └── database.js          # Configuración de MongoDB
├── controllers/
│   ├── authController.js    # Lógica de autenticación
│   ├── documentController.js # Lógica de documentos
│   ├── folderController.js  # Lógica de carpetas
│   └── userController.js    # Lógica de usuarios
├── middleware/
│   ├── auth.js             # Middleware de autenticación
│   ├── error.js            # Manejo de errores
│   └── upload.js           # Middleware de archivos
├── models/
│   ├── User.js             # Modelo de usuario
│   ├── Document.js         # Modelo de documento
│   └── Folder.js           # Modelo de carpeta
├── routes/
│   ├── auth.js             # Rutas de autenticación
│   ├── documents.js        # Rutas de documentos
│   ├── folders.js          # Rutas de carpetas
│   └── users.js            # Rutas de usuarios
├── tests/
│   ├── auth.test.js        # Tests de autenticación
│   └── setup.js            # Configuración de tests
├── uploads/                # Directorio de archivos
├── .env.example            # Variables de entorno ejemplo
├── .gitignore              # Archivos ignorados por git
├── jest.config.json        # Configuración de Jest
├── package.json            # Dependencias y scripts
├── server.js               # Archivo principal
└── README.md               # Documentación
```

## 🔒 Seguridad

- **Helmet** - Headers de seguridad HTTP
- **CORS** - Configuración de origen cruzado
- **JWT** - Tokens seguros para autenticación
- **bcryptjs** - Hashing seguro de contraseñas
- **Validación** - Validación robusta de entrada
- **Rate Limiting** - Preparado para implementar
- **File Validation** - Validación de tipos de archivo

## 🚀 Características Avanzadas

### Sistema de Permisos
- Propietarios con control total
- Usuarios compartidos con permisos específicos
- Documentos y carpetas públicas

### Validaciones Robustas
- Validación de entrada con express-validator
- Sanitización de datos
- Manejo de errores centralizado

### Optimización
- Índices de base de datos optimizados
- Paginación en listados
- Búsqueda eficiente

## 🔄 Próximas Mejoras

- [ ] Rate limiting
- [ ] Logs estructurados
- [ ] Cache con Redis
- [ ] Websockets para actualizaciones en tiempo real
- [ ] Compresión de archivos
- [ ] Thumbnails para imágenes
- [ ] Auditoría de acciones

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📞 Soporte

Para soporte técnico o preguntas sobre la API, contactar al equipo de desarrollo.

---

**CloudDocs Backend MVP v1.0.0** - ✅ Listo para producción
