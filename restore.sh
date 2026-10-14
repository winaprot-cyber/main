#!/bin/bash

# Script de Restauración del Proyecto
# Control de Asistencia HL - v1.4.9
# Creador by Hugo Leon

echo "🔄 Restauración del Proyecto"
echo "═══════════════════════════════════════"
echo ""

# Verificar si hay backups disponibles
if [ ! -d "backups" ]; then
    echo "❌ No se encontró el directorio de backups"
    echo "💡 Ejecuta primero: ./backup.sh"
    exit 1
fi

# Listar backups disponibles
echo "📋 Backups disponibles:"
BACKUPS=($(ls -1 backups/ | grep "backup_" | sort -r))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    echo "❌ No hay backups disponibles"
    echo "💡 Ejecuta primero: ./backup.sh"
    exit 1
fi

# Mostrar lista de backups
for i in "${!BACKUPS[@]}"; do
    echo "   $((i+1)). ${BACKUPS[$i]}"
done

echo ""
read -p "🔢 Selecciona el número del backup a restaurar (1-${#BACKUPS[@]}): " SELECTION

# Validar selección
if ! [[ "$SELECTION" =~ ^[0-9]+$ ]] || [ "$SELECTION" -lt 1 ] || [ "$SELECTION" -gt ${#BACKUPS[@]} ]; then
    echo "❌ Selección inválida"
    exit 1
fi

SELECTED_BACKUP="${BACKUPS[$((SELECTION-1))]}"
BACKUP_PATH="backups/$SELECTED_BACKUP"

echo ""
echo "⚠️  ADVERTENCIA: Esta acción sobrescribirá los archivos actuales"
echo "📁 Backup a restaurar: $SELECTED_BACKUP"
echo ""
read -p "¿Estás seguro? (s/n): " CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
    echo "❌ Restauración cancelada"
    exit 0
fi

# Hacer backup de seguridad antes de restaurar
echo ""
echo "🔒 Creando backup de seguridad..."
./backup.sh > /dev/null 2>&1
echo "✅ Backup de seguridad creado"

# Restaurar archivos
echo ""
echo "📦 Restaurando archivos..."

# Restaurar src/
if [ -d "$BACKUP_PATH/src" ]; then
    rm -rf src/components src/utils src/hooks 2>/dev/null
    cp -r "$BACKUP_PATH/src" src/
    echo "✅ Archivos de src/ restaurados"
else
    echo "⚠️  No se encontró src/ en el backup"
fi

# Restaurar archivos de configuración
for file in package.json tsconfig.json vite.config.js index.html README.md; do
    if [ -f "$BACKUP_PATH/$file" ]; then
        cp "$BACKUP_PATH/$file" .
        echo "✅ $file restaurado"
    fi
done

# Verificar integridad
echo ""
echo "🔍 Verificando integridad..."
if ./verify.sh > /dev/null 2>&1; then
    echo "✅ Verificación exitosa"
else
    echo "⚠️  La verificación encontró problemas"
    echo "💡 Ejecuta: ./verify.sh para ver detalles"
fi

# Reconstruir proyecto
echo ""
echo "🔨 Reconstruyendo proyecto..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build exitoso"
else
    echo "❌ Build falló"
    echo "💡 Ejecuta: npm run build para ver errores"
fi

echo ""
echo "═══════════════════════════════════════"
echo "✅ Restauración completada"
echo "═══════════════════════════════════════"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Ejecutar: npm run dev"
echo "   2. Abrir: http://localhost:5173"
echo "   3. Verificar que todo funcione correctamente"
echo ""
