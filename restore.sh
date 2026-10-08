#!/bin/bash

# 🔄 Sistema de Restauración de Backups
# Control de Asistencia HL - Versión 1.4.9

if [ -z "$1" ]; then
  echo "🔄 Sistema de Restauración de Backups"
  echo ""
  echo "Uso: ./restore.sh [TIMESTAMP]"
  echo ""
  echo "Backups disponibles:"
  ls -1 .backups/ | grep "backup_" | sed 's/backup_//' | nl
  echo ""
  echo "Ejemplo: ./restore.sh 20260115_143022"
  exit 1
fi

TIMESTAMP=$1
BACKUP_DIR=".backups/backup_$TIMESTAMP"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "❌ Error: Backup no encontrado en $BACKUP_DIR"
  exit 1
fi

echo "🔄 Restaurando backup desde: $BACKUP_DIR"
echo ""

# Crear backup de seguridad antes de restaurar
echo "🛡️  Creando backup de seguridad..."
./backup.sh > /dev/null 2>&1

# Restaurar archivos principales
echo "📦 Restaurando archivos principales..."
cp "$BACKUP_DIR/src/App.tsx" src/ 2>/dev/null && echo "  ✅ App.tsx" || echo "  ❌ App.tsx no encontrado en backup"
cp "$BACKUP_DIR/src/main.tsx" src/ 2>/dev/null && echo "  ✅ main.tsx" || echo "  ❌ main.tsx no encontrado en backup"
cp "$BACKUP_DIR/src/types.ts" src/ 2>/dev/null && echo "  ✅ types.ts" || echo "  ❌ types.ts no encontrado en backup"
cp "$BACKUP_DIR/src/index.css" src/ 2>/dev/null && echo "  ✅ index.css" || echo "  ❌ index.css no encontrado en backup"

# Restaurar componentes
echo "📦 Restaurando componentes..."
if [ -d "$BACKUP_DIR/src/components" ]; then
  mkdir -p src/components
  for file in "$BACKUP_DIR/src/components"/*.tsx; do
    if [ -f "$file" ]; then
      cp "$file" src/components/
      echo "  ✅ $(basename $file)"
    fi
  done
fi

# Restaurar hooks
echo "📦 Restaurando hooks..."
if [ -d "$BACKUP_DIR/src/hooks" ]; then
  mkdir -p src/hooks
  for file in "$BACKUP_DIR/src/hooks"/*.ts; do
    if [ -f "$file" ]; then
      cp "$file" src/hooks/
      echo "  ✅ $(basename $file)"
    fi
  done
fi

# Restaurar utils
echo "📦 Restaurando utilidades..."
if [ -d "$BACKUP_DIR/src/utils" ]; then
  mkdir -p src/utils
  for file in "$BACKUP_DIR/src/utils"/*.ts; do
    if [ -f "$file" ]; then
      cp "$file" src/utils/
      echo "  ✅ $(basename $file)"
    fi
  done
fi

# Restaurar configuración
echo "📦 Restaurando configuración..."
cp "$BACKUP_DIR/package.json" . 2>/dev/null && echo "  ✅ package.json" || echo "  ⚠️  package.json no encontrado"
cp "$BACKUP_DIR/tsconfig.json" . 2>/dev/null && echo "  ✅ tsconfig.json" || echo "  ⚠️  tsconfig.json no encontrado"
cp "$BACKUP_DIR/vite.config.js" . 2>/dev/null && echo "  ✅ vite.config.js" || echo "  ⚠️  vite.config.js no encontrado"

echo ""
echo "✅ Restauración completada"
echo ""
echo "🔍 Verificando integridad..."
./verify.sh
echo ""
echo "🚀 Para ejecutar el proyecto:"
echo "   npm run dev"
