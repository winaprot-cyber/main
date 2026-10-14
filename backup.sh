#!/bin/bash

# Script de Backup Automático
# Control de Asistencia HL - v1.4.9
# Creador by Hugo Leon

# Crear directorio de backups si no existe
mkdir -p backups

# Obtener fecha y hora actual
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/backup_${TIMESTAMP}"

# Crear directorio de backup específico
mkdir -p "$BACKUP_DIR/src"

echo "🔄 Iniciando backup del proyecto..."
echo ""

# Backup de archivos críticos
echo "📁 Respaldando archivos críticos..."

# Backup de App.tsx (el más importante)
cp src/App.tsx "$BACKUP_DIR/src/App.tsx" 2>/dev/null && echo "✅ App.tsx respaldado" || echo "⚠️  App.tsx no encontrado"

# Backup de todos los componentes
cp -r src/components "$BACKUP_DIR/src/" 2>/dev/null && echo "✅ Componentes respaldados" || echo "⚠️  Componentes no encontrados"

# Backup de utilidades
cp -r src/utils "$BACKUP_DIR/src/" 2>/dev/null && echo "✅ Utilidades respaldadas" || echo "⚠️  Utilidades no encontradas"

# Backup de hooks
cp -r src/hooks "$BACKUP_DIR/src/" 2>/dev/null && echo "✅ Hooks respaldados" || echo "⚠️  Hooks no encontrados"

# Backup de archivos de configuración
cp src/main.tsx "$BACKUP_DIR/src/" 2>/dev/null && echo "✅ main.tsx respaldado" || echo "⚠️  main.tsx no encontrado"
cp src/types.ts "$BACKUP_DIR/src/" 2>/dev/null && echo "✅ types.ts respaldado" || echo "⚠️  types.ts no encontrado"
cp src/index.css "$BACKUP_DIR/src/" 2>/dev/null && echo "✅ index.css respaldado" || echo "⚠️  index.css no encontrado"

# Backup de archivos de configuración del proyecto
cp package.json "$BACKUP_DIR/" 2>/dev/null && echo "✅ package.json respaldado" || echo "⚠️  package.json no encontrado"
cp tsconfig.json "$BACKUP_DIR/" 2>/dev/null && echo "✅ tsconfig.json respaldado" || echo "⚠️  tsconfig.json no encontrado"
cp vite.config.js "$BACKUP_DIR/" 2>/dev/null && echo "✅ vite.config.js respaldado" || echo "⚠️  vite.config.js no encontrado"
cp index.html "$BACKUP_DIR/" 2>/dev/null && echo "✅ index.html respaldado" || echo "⚠️  index.html no encontrado"

# Backup de documentación
cp README.md "$BACKUP_DIR/" 2>/dev/null && echo "✅ README.md respaldado" || echo "⚠️  README.md no encontrado"

echo ""
echo "✅ Backup completado exitosamente!"
echo "📁 Ubicación: $BACKUP_DIR"
echo ""

# Mostrar tamaño del backup
if [ -d "$BACKUP_DIR" ]; then
    SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
    echo "📊 Tamaño del backup: $SIZE"
fi

# Listar archivos respaldados
echo ""
echo "📋 Archivos respaldados:"
find "$BACKUP_DIR" -type f | wc -l | xargs echo "Total:"

echo ""
echo "💡 Para restaurar un backup:"
echo "   cp -r $BACKUP_DIR/src/* src/"
echo ""
echo "🔒 Recomendación: Ejecutar este script antes de cambios importantes"
