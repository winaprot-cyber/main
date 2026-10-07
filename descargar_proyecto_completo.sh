#!/bin/bash

# Script para descargar el proyecto completo en ZIP
# Control de Asistencia HL - v1.4.9

echo "📦 Empaquetando proyecto completo..."
echo ""

# Nombre del archivo ZIP
ZIP_NAME="control-asistencia-hl-v1.4.9-completo.zip"

# Eliminar ZIP anterior si existe
if [ -f "$ZIP_NAME" ]; then
    echo "🗑️  Eliminando ZIP anterior..."
    rm "$ZIP_NAME"
fi

# Crear ZIP con todos los archivos del proyecto
echo "📁 Incluyendo archivos..."
zip -r "$ZIP_NAME" \
    index.html \
    package.json \
    package-lock.json \
    tsconfig.json \
    vite.config.js \
    tailwind.config.js \
    README.md \
    src/ \
    -x "node_modules/*" \
    -x "dist/*" \
    -x ".git/*" \
    -x "*.log" \
    -x ".DS_Store" \
    -x "Thumbs.db"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ZIP creado exitosamente!"
    echo ""
    echo "📊 Información del archivo:"
    echo "   Nombre: $ZIP_NAME"
    echo "   Tamaño: $(du -h "$ZIP_NAME" | cut -f1)"
    echo "   Ubicación: $(pwd)/$ZIP_NAME"
    echo ""
    echo "📦 Contenido incluido:"
    echo "   ✓ Archivos de configuración (7 archivos)"
    echo "   ✓ Código fuente src/ (23 archivos)"
    echo "   ✓ README.md"
    echo "   ✓ Total: ~52 archivos principales"
    echo ""
    echo "🚀 Para usar el proyecto:"
    echo "   1. Descomprimir: unzip $ZIP_NAME"
    echo "   2. Instalar dependencias: npm install"
    echo "   3. Ejecutar: npm run dev"
    echo "   4. Abrir: http://localhost:5173"
    echo ""
    echo "📤 Para subir al repositorio:"
    echo "   1. Descomprimir el ZIP"
    echo "   2. git init"
    echo "   3. git add ."
    echo "   4. git commit -m '✅ Versión 1.4.9 completa'"
    echo "   5. git remote add origin <TU-REPO-URL>"
    echo "   6. git push -u origin main"
    echo ""
else
    echo ""
    echo "❌ Error al crear el ZIP"
    exit 1
fi
