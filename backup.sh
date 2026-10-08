#!/bin/bash

# 🛡️ Sistema de Backup Automático
# Control de Asistencia HL - Versión 1.4.9
# Creador by Hugo Leon

echo "🛡️ Iniciando backup automático..."
echo ""

# Crear directorio de backups si no existe
mkdir -p .backups

# Obtener timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=".backups/backup_$TIMESTAMP"

# Crear directorio de backup
mkdir -p "$BACKUP_DIR/src/components"
mkdir -p "$BACKUP_DIR/src/hooks"
mkdir -p "$BACKUP_DIR/src/utils"

# Backup de archivos críticos
echo "📦 Respaldando archivos críticos..."

# Archivos principales
cp src/App.tsx "$BACKUP_DIR/src/" 2>/dev/null && echo "  ✅ App.tsx" || echo "  ❌ App.tsx no encontrado"
cp src/main.tsx "$BACKUP_DIR/src/" 2>/dev/null && echo "  ✅ main.tsx" || echo "  ❌ main.tsx no encontrado"
cp src/types.ts "$BACKUP_DIR/src/" 2>/dev/null && echo "  ✅ types.ts" || echo "  ❌ types.ts no encontrado"
cp src/index.css "$BACKUP_DIR/src/" 2>/dev/null && echo "  ✅ index.css" || echo "  ❌ index.css no encontrado"

# Componentes
for file in src/components/*.tsx; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/src/components/"
    echo "  ✅ $(basename $file)"
  fi
done

# Hooks
for file in src/hooks/*.ts; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/src/hooks/"
    echo "  ✅ $(basename $file)"
  fi
done

# Utils
for file in src/utils/*.ts; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/src/utils/"
    echo "  ✅ $(basename $file)"
  fi
done

# Configuración
cp package.json "$BACKUP_DIR/" 2>/dev/null && echo "  ✅ package.json" || echo "  ❌ package.json no encontrado"
cp tsconfig.json "$BACKUP_DIR/" 2>/dev/null && echo "  ✅ tsconfig.json" || echo "  ❌ tsconfig.json no encontrado"
cp vite.config.js "$BACKUP_DIR/" 2>/dev/null && echo "  ✅ vite.config.js" || echo "  ❌ vite.config.js no encontrado"

# Crear archivo de metadata
cat > "$BACKUP_DIR/BACKUP_INFO.txt" << EOF
📦 INFORMACIÓN DEL BACKUP
========================

Fecha: $(date)
Timestamp: $TIMESTAMP
Versión: 1.4.9

Archivos respaldados:
- $(find $BACKUP_DIR -type f | wc -l) archivos totales

Estructura:
$BACKUP_DIR/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── types.ts
│   ├── index.css
│   ├── components/
│   ├── hooks/
│   └── utils/
├── package.json
├── tsconfig.json
└── vite.config.js

Para restaurar:
./restore.sh $TIMESTAMP
EOF

echo ""
echo "✅ Backup completado exitosamente"
echo "📁 Ubicación: $BACKUP_DIR"
echo ""
echo "💡 Para restaurar este backup, ejecuta:"
echo "   ./restore.sh $TIMESTAMP"
echo ""

# Mantener solo los últimos 10 backups
cd .backups
ls -dt backup_* | tail -n +11 | xargs -r rm -rf
cd ..

echo "🗑️  Backups antiguos eliminados (se mantienen los últimos 10)"
