#!/bin/bash

# Script de Restauración de Backup
# Control de Asistencia - Hugo Leon

if [ -z "$1" ]; then
  echo "❌ Error: Debes especificar el timestamp del backup"
  echo ""
  echo "Uso: ./restore_backup.sh <TIMESTAMP>"
  echo ""
  echo "Ejemplo: ./restore_backup.sh 20260115_143022"
  echo ""
  echo "Backups disponibles:"
  ls -1 backups/ | grep "backup_" | sed 's/backup_//'
  exit 1
fi

TIMESTAMP=$1
BACKUP_DIR="backups/backup_${TIMESTAMP}"

if [ ! -d "${BACKUP_DIR}" ]; then
  echo "❌ Error: No se encontró el backup ${TIMESTAMP}"
  echo ""
  echo "Backups disponibles:"
  ls -1 backups/ | grep "backup_" | sed 's/backup_//'
  exit 1
fi

echo "=========================================="
echo "  RESTAURACIÓN DE BACKUP"
echo "  Timestamp: ${TIMESTAMP}"
echo "=========================================="
echo ""

# Confirmar restauración
echo "⚠️  ADVERTENCIA: Esto sobrescribirá los archivos actuales"
read -p "¿Estás seguro de continuar? (s/n): " confirm

if [ "$confirm" != "s" ]; then
  echo "❌ Restauración cancelada"
  exit 0
fi

# Crear backup de seguridad antes de restaurar
echo "📦 Creando backup de seguridad..."
./backup.sh

# Restaurar archivos
echo "🔄 Restaurando archivos..."

# Archivo principal
if [ -f "${BACKUP_DIR}/App.tsx" ]; then
  cp "${BACKUP_DIR}/App.tsx" src/App.tsx
  echo "  ✅ App.tsx restaurado"
fi

# Hook
if [ -f "${BACKUP_DIR}/useAttendanceStorage.ts" ]; then
  cp "${BACKUP_DIR}/useAttendanceStorage.ts" src/hooks/useAttendanceStorage.ts
  echo "  ✅ useAttendanceStorage.ts restaurado"
fi

# Tipos
if [ -f "${BACKUP_DIR}/types.ts" ]; then
  cp "${BACKUP_DIR}/types.ts" src/types.ts
  echo "  ✅ types.ts restaurado"
fi

# Componentes
if [ -d "${BACKUP_DIR}/components" ]; then
  for component in "${BACKUP_DIR}/components"/*; do
    if [ -f "$component" ]; then
      filename=$(basename "$component")
      cp "$component" "src/components/${filename}"
      echo "  ✅ ${filename} restaurado"
    fi
  done
fi

# Utilidades
if [ -d "${BACKUP_DIR}/utils" ]; then
  for util in "${BACKUP_DIR}/utils"/*; do
    if [ -f "$util" ]; then
      filename=$(basename "$util")
      cp "$util" "src/utils/${filename}"
      echo "  ✅ ${filename} restaurado"
    fi
  done
fi

# Configuración
CONFIG_FILES=(
  "package.json"
  "tsconfig.json"
  "vite.config.js"
  "tailwind.config.js"
  "index.html"
)

for config in "${CONFIG_FILES[@]}"; do
  if [ -f "${BACKUP_DIR}/${config}" ]; then
    cp "${BACKUP_DIR}/${config}" "${config}"
    echo "  ✅ ${config} restaurado"
  fi
done

echo ""
echo "=========================================="
echo "  ✅ RESTAURACIÓN COMPLETADA"
echo "=========================================="
echo ""
echo "🔄 Verificando build..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build exitoso"
  echo ""
  echo "🚀 Para ejecutar el proyecto:"
  echo "   npm run dev"
  echo ""
  echo "📱 Abrir en: http://localhost:5173"
else
  echo ""
  echo "❌ Error en el build"
  echo "   Revisa los errores y corrige manualmente"
fi

echo ""
echo "=========================================="
