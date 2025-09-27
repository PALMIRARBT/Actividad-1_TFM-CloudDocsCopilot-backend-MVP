## Respaldos y documentación

En la carpeta `postman` encontrarás la colección de endpoints exportada desde Postman para pruebas y documentación de la API.

En la carpeta `mongo-backup` se incluyen respaldos de las colecciones principales de MongoDB Compass (por ejemplo, `documents.json`, `users.json`) para restauración o referencia.
# CloudDocs Copilot Backend (MVP)

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
