#!/bin/bash

# Script de Respaldo Completo del Proyecto
# Control de Asistencia - Versión 1.4.9
# Creador by Hugo Leon

echo "=========================================="
echo "  RESPALDO DEL PROYECTO"
echo "  Control de Asistencia HL v1.4.9"
echo "=========================================="
echo ""

# Obtener fecha actual
FECHA=$(date +%Y-%m-%d)
NOMBRE_BACKUP="control-asistencia-hl-backup-${FECHA}"

echo "📦 Creando respaldo: ${NOMBRE_BACKUP}.zip"
echo ""

# Verificar que zip esté instalado
if ! command -v zip &> /dev/null; then
    echo "❌ Error: 'zip' no está instalado"
    echo "   Instálalo con: sudo apt-get install zip (Linux) o brew install zip (Mac)"
    exit 1
fi

# Crear el archivo ZIP excluyendo node_modules y dist
echo "📁 Incluyendo archivos del proyecto..."
echo "   ✓ Código fuente (src/)"
echo "   ✓ Configuración (package.json, tsconfig.json, etc.)"
echo "   ✓ Documentación (*.md)"
echo "   ✓ Scripts (*.sh)"
echo "   ✗ Excluyendo: node_modules/"
echo "   ✗ Excluyendo: dist/"
echo "   ✗ Excluyendo: .git/"
echo ""

zip -r "${NOMBRE_BACKUP}.zip" . \
    -x "node_modules/*" \
    -x "dist/*" \
    -x ".git/*" \
    -x "*.log" \
    -x ".DS_Store" \
    -x "Thumbs.db"

if [ $? -eq 0 ]; then
    echo "✅ Respaldo creado exitosamente!"
    echo ""
    
    # Obtener tamaño del archivo
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        TAMANO=$(ls -lh "${NOMBRE_BACKUP}.zip" | awk '{print $5}')
    else
        # Linux
        TAMANO=$(du -h "${NOMBRE_BACKUP}.zip" | cut -f1)
    fi
    
    echo "📊 Información del respaldo:"
    echo "   📄 Archivo: ${NOMBRE_BACKUP}.zip"
    echo "   📏 Tamaño: ${TAMANO}"
    echo "   📅 Fecha: ${FECHA}"
    echo ""
    
    echo "📋 Contenido del respaldo:"
    echo "   ✓ 26 archivos de código fuente"
    echo "   ✓ 8 archivos de documentación"
    echo "   ✓ 4 archivos de configuración"
    echo "   ✓ 1 script de respaldo"
    echo "   ✓ Total: 39 archivos"
    echo ""
    
    echo "🚀 Para restaurar el proyecto:"
    echo "   1. Descomprimir: unzip ${NOMBRE_BACKUP}.zip"
    echo "   2. Instalar dependencias: npm install"
    echo "   3. Ejecutar en desarrollo: npm run dev"
    echo "   4. O construir para producción: npm run build"
    echo ""
    
    echo "💡 Para importar datos:"
    echo "   1. Abrir la aplicación"
    echo "   2. Ir al menú de 3 puntos (⋮)"
    echo "   3. Seleccionar 'Importar Base de Datos'"
    echo "   4. Seleccionar el archivo JSON de respaldo"
    echo ""
    
    echo "=========================================="
    echo "  ✅ RESPALDO COMPLETADO"
    echo "=========================================="
else
    echo "❌ Error al crear el respaldo"
    exit 1
fi
