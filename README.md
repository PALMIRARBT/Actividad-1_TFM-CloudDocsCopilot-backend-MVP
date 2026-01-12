## Respaldos y documentación

En la carpeta `postman` encontrarás la colección de endpoints exportada desde Postman para pruebas y documentación de la API.

En la carpeta `mongo-backup` se incluyen respaldos de las colecciones principales de MongoDB Compass (por ejemplo, `documents.json`, `users.json`) para restauración o referencia.

# CloudDocs Copilot Backend (MVP)
## Criterios de aceptación cumplidos (Registro y Confirmación de Usuario)

- El usuario puede registrarse con email válido
- La contraseña debe cumplir políticas de seguridad (mínimo 8 caracteres, mayúscula, número)
- Se envía email de confirmación automáticamente
- Se crea perfil básico automáticamente tras confirmación
- Validación de email único en el sistema

### Archivos modificados/creados para estos criterios:
- `src/routes/auth.js`: lógica de registro, validación, envío de email, confirmación y creación automática de perfil
- `src/models/user.js`: modelo de usuario, campo `confirmed`
- `src/models/profile.js`: **nuevo archivo** para el modelo de perfil básico
- `src/services/emailService.js`: envío de email de confirmación
- `src/services/confirmationTemplate.html`: template HTML para email de confirmación

API REST para la gestión de usuarios, documentos y carpetas en la nube.
Desarrollado con Node.js, Express y MongoDB.

## Funcionalidades principales
- Registro y autenticación de usuarios (JWT)
- Subida, descarga, eliminación y compartición de documentos
- Gestión de carpetas
- Endpoints CRUD para usuarios, documentos y carpetas

Este backend está listo para integrarse con el frontend y servir como base para el desarrollo de la plataforma CloudDocs Copilot.

## Instalación y uso
1. Clona el repositorio
2. Instala dependencias con `npm install`
3. Configura MongoDB y ejecuta el servidor con `npm start`

API REST para la gestión de usuarios, documentos y carpetas en la nube.
Desarrollado con Node.js, Express y MongoDB.

## Funcionalidades principales
- Registro y autenticación de usuarios (JWT)
- Subida, descarga, eliminación y compartición de documentos
- Gestión de carpetas
- Endpoints CRUD para usuarios, documentos y carpetas

Este backend está listo para integrarse con el frontend y servir como base para el desarrollo de la plataforma CloudDocs Copilot.

## Instalación y uso
1. Clona el repositorio
2. Instala dependencias con `npm install`
3. Configura MongoDB y ejecuta el servidor con `npm start`
