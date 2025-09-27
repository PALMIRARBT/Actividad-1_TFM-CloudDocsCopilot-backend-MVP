# API Documentation - CloudDocs Backend

## Ejemplos de uso de la API

### 1. Registro de Usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "password": "MiPassword123"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f123abc456def789",
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "role": "user"
  }
}
```

### 2. Inicio de Sesión

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "MiPassword123"
  }'
```

### 3. Subir Documento

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/ruta/a/tu/documento.pdf" \
  -F "description=Mi documento importante" \
  -F "tags=trabajo,importante"
```

### 4. Crear Carpeta

```bash
curl -X POST http://localhost:3000/api/folders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Proyectos",
    "description": "Carpeta para mis proyectos"
  }'
```

### 5. Listar Documentos

```bash
curl -X GET "http://localhost:3000/api/documents?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Compartir Documento

```bash
curl -X PUT http://localhost:3000/api/documents/DOCUMENT_ID/share \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userIds": ["64f123abc456def790"],
    "permission": "read",
    "isPublic": false
  }'
```

### 7. Descargar Documento

```bash
curl -X GET http://localhost:3000/api/documents/DOCUMENT_ID/download \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o documento_descargado.pdf
```

### 8. Buscar Usuarios

```bash
curl -X GET "http://localhost:3000/api/users/search?search=usuario" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 9. Estado de la API

```bash
curl -X GET http://localhost:3000/api/health
```

## Códigos de Estado HTTP

- `200` - Éxito
- `201` - Recurso creado
- `400` - Error de validación
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `500` - Error del servidor

## Headers Requeridos

### Para rutas autenticadas:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Para subida de archivos:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

## Tipos de Archivo Soportados

- Imágenes: JPEG, PNG, GIF
- Documentos: PDF, DOC, DOCX
- Hojas de cálculo: XLS, XLSX
- Texto: TXT, CSV
- Comprimidos: ZIP, RAR

## Límites

- Tamaño máximo de archivo: 10MB
- Archivos por subida: 1
- Longitud de nombres de carpeta: 100 caracteres
- Longitud de descripción: 500 caracteres