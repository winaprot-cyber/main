#!/bin/bash

# Script de Restauración de Backup
# Restaura el proyecto desde el backup más reciente

echo "🔄 Script de Restauración de Backup"
echo ""

BACKUP_DIR="backups"

# Verificar que existan backups
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ ERROR: No existe el directorio de backups"
    echo "   No hay backups disponibles para restaurar"
    exit 1
fi

# Listar backups disponibles
echo "📂 Backups disponibles:"
BACKUPS=($(ls -1t "$BACKUP_DIR"/control-asistencia-backup-*.zip 2>/dev/null))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    echo "❌ ERROR: No hay backups en $BACKUP_DIR"
    exit 1
fi

for i in "${!BACKUPS[@]}"; do
    backup=${BACKUPS[$i]}
    size=$(du -h "$backup" | cut -f1)
    date=$(stat -f%Sm "$backup" 2>/dev/null || stat -c%y "$backup" 2>/dev/null | cut -d' ' -f1)
    echo "   $((i+1)). $(basename "$backup") ($size) - $date"
done
echo ""

# Preguntar cuál backup restaurar
echo "¿Cuál backup deseas restaurar?"
echo "   1. El más reciente (recomendado)"
echo "   2. Elegir manualmente"
echo "   3. Cancelar"
echo ""
read -p "Opción (1-3): " option

case $option in
    1)
        SELECTED_BACKUP=${BACKUPS[0]}
        ;;
    2)
        read -p "Número del backup (1-${#BACKUPS[@]}): " backup_num
        if [ "$backup_num" -lt 1 ] || [ "$backup_num" -gt ${#BACKUPS[@]} ]; then
            echo "❌ ERROR: Número inválido"
            exit 1
        fi
        SELECTED_BACKUP=${BACKUPS[$((backup_num-1))]}
        ;;
    3)
        echo "❌ Restauración cancelada"
        exit 0
        ;;
    *)
        echo "❌ ERROR: Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "📦 Backup seleccionado: $(basename "$SELECTED_BACKUP")"
echo ""

# Confirmar restauración
echo "⚠️  ADVERTENCIA: Esto sobrescribirá los archivos actuales del proyecto"
echo "   Se recomienda hacer un backup antes de continuar"
echo ""
read -p "¿Deseas continuar? (s/n): " confirm

if [[ "$confirm" != "s" ]]; then
    echo "❌ Restauración cancelada"
    exit 0
fi

# Crear backup de seguridad antes de restaurar
echo ""
echo "💾 Creando backup de seguridad..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SAFETY_BACKUP="$BACKUP_DIR/pre-restore-backup-$TIMESTAMP.zip"
zip -r "$SAFETY_BACKUP" . \
    -x "node_modules/*" \
    -x "dist/*" \
    -x ".git/*" \
    -x "backups/*" \
    > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Backup de seguridad creado: $SAFETY_BACKUP"
else
    echo "⚠️  No se pudo crear backup de seguridad"
fi

# Restaurar backup
echo ""
echo "🔄 Restaurando backup..."
TEMP_DIR=$(mktemp -d)
unzip -q "$SELECTED_BACKUP" -d "$TEMP_DIR"

# Copiar archivos restaurados
rsync -a --exclude='node_modules' --exclude='dist' --exclude='.git' --exclude='backups' \
    "$TEMP_DIR/" .

# Limpiar directorio temporal
rm -rf "$TEMP_DIR"

if [ $? -eq 0 ]; then
    echo "✅ Backup restaurado exitosamente"
else
    echo "❌ ERROR: No se pudo restaurar el backup"
    exit 1
fi

# Verificar integridad
echo ""
echo "🔍 Verificando integridad del proyecto restaurado..."
if ./check-integrity.sh > /dev/null 2>&1; then
    echo "✅ Integridad verificada"
else
    echo "⚠️  ADVERTENCIA: El proyecto restaurado tiene problemas"
    echo "   Ejecuta ./check-integrity.sh para ver los detalles"
fi

# Reinstalar dependencias
echo ""
echo "📦 Reinstalando dependencias..."
if npm install > /dev/null 2>&1; then
    echo "✅ Dependencias instaladas"
else
    echo "⚠️  ERROR: No se pudieron instalar las dependencias"
    echo "   Ejecuta: npm install"
fi

echo ""
echo "═══════════════════════════════════════"
echo "✅✅✅ RESTAURACIÓN COMPLETADA ✅✅✅"
echo "═══════════════════════════════════════"
echo ""
echo "📂 Backup restaurado: $(basename "$SELECTED_BACKUP")"
echo "💾 Backup de seguridad: $(basename "$SAFETY_BACKUP")"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Verificar que el proyecto funcione: npm run dev"
echo "   2. Ejecutar tests: npm test"
echo "   3. Si hay problemas, restaurar el backup de seguridad"
echo ""
exit 0
