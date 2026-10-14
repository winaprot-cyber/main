#!/bin/bash

# Script de Backup Automático
# Crea un respaldo completo del proyecto con timestamp

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
BACKUP_NAME="control-asistencia-backup-$TIMESTAMP"

echo "💾 Creando backup del proyecto..."
echo "   Timestamp: $TIMESTAMP"
echo ""

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Verificar que el proyecto esté en buen estado antes de backup
echo "🔍 Verificando estado del proyecto..."
if ! ./validate-project.sh > /dev/null 2>&1; then
    echo "⚠️  ADVERTENCIA: El proyecto tiene problemas"
    echo "   ¿Deseas crear backup de todos modos? (s/n)"
    read -r response
    if [[ "$response" != "s" ]]; then
        echo "❌ Backup cancelado"
        exit 1
    fi
fi
echo "✅ Proyecto validado"

# Crear archivo ZIP del proyecto
echo "📦 Creando archivo ZIP..."
zip -r "$BACKUP_DIR/$BACKUP_NAME.zip" . \
    -x "node_modules/*" \
    -x "dist/*" \
    -x ".git/*" \
    -x "backups/*" \
    -x "*.log" \
    -x ".DS_Store" \
    > /dev/null 2>&1

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.zip" | cut -f1)
    echo "✅ Backup creado exitosamente"
    echo "   Archivo: $BACKUP_DIR/$BACKUP_NAME.zip"
    echo "   Tamaño: $BACKUP_SIZE"
else
    echo "❌ ERROR: No se pudo crear el backup"
    exit 1
fi

# Mantener solo los últimos 10 backups
echo "🧹 Limpiando backups antiguos..."
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/control-asistencia-backup-*.zip 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 10 ]; then
    ls -1t "$BACKUP_DIR"/control-asistencia-backup-*.zip | tail -n +11 | xargs rm -f
    echo "   Backups antiguos eliminados"
else
    echo "   No hay backups antiguos para eliminar"
fi

echo ""
echo "✅✅✅ BACKUP COMPLETADO EXITOSAMENTE ✅✅✅"
echo ""
echo "📂 Ubicación: $BACKUP_DIR/$BACKUP_NAME.zip"
echo "📊 Tamaño: $BACKUP_SIZE"
echo "🔢 Total de backups: $BACKUP_COUNT"
echo ""
echo "💡 Para restaurar:"
echo "   1. Descomprime el archivo ZIP"
echo "   2. Copia los archivos al proyecto"
echo "   3. Ejecuta: npm install"
echo "   4. Ejecuta: npm run dev"
exit 0
