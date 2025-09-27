#!/bin/bash

echo "🚀 CloudDocs Backend - Script de Inicialización"
echo "==============================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instale Node.js primero."
    exit 1
fi

# Verificar si MongoDB está disponible
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB no está instalado localmente."
    echo "   Puede usar MongoDB Atlas o instalar MongoDB localmente."
    echo "   Actualice MONGODB_URI en el archivo .env"
fi

# Verificar si el archivo .env existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "✅ Archivo .env creado. Por favor, actualice las variables según su entorno."
else
    echo "✅ Archivo .env encontrado."
fi

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
else
    echo "✅ Dependencias ya instaladas."
fi

# Crear directorio de uploads si no existe
if [ ! -d "uploads" ]; then
    echo "📁 Creando directorio de uploads..."
    mkdir -p uploads
fi

echo ""
echo "🎉 Configuración completada!"
echo ""
echo "Para iniciar el servidor:"
echo "  npm run dev    (modo desarrollo)"
echo "  npm start      (modo producción)"
echo ""
echo "Para ejecutar tests:"
echo "  npm test"
echo ""
echo "URL de la API: http://localhost:3000"
echo "Documentación: README.md"
echo "Ejemplos de API: API_EXAMPLES.md"