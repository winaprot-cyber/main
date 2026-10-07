#!/bin/bash

# Script de Backup Automático
# Control de Asistencia - Hugo Leon
# Versión 1.4.9

echo "=========================================="
echo "  BACKUP AUTOMÁTICO DEL PROYECTO"
echo "  Control de Asistencia HL v1.4.9"
echo "=========================================="
echo ""

# Crear directorio de backups si no existe
mkdir -p backups

# Obtener timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/backup_${TIMESTAMP}"

echo "📦 Creando backup en: ${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}"

# Backup de archivos críticos
echo "📄 Respaldando archivos críticos..."

# Archivo principal
if [ -f "src/App.tsx" ]; then
  cp src/App.tsx "${BACKUP_DIR}/App.tsx"
  echo "  ✅ App.tsx respaldado"
else
  echo "  ❌ App.tsx no encontrado"
fi

# Hook de almacenamiento
if [ -f "src/hooks/useAttendanceStorage.ts" ]; then
  cp src/hooks/useAttendanceStorage.ts "${BACKUP_DIR}/useAttendanceStorage.ts"
  echo "  ✅ useAttendanceStorage.ts respaldado"
fi

# Tipos
if [ -f "src/types.ts" ]; then
  cp src/types.ts "${BACKUP_DIR}/types.ts"
  echo "  ✅ types.ts respaldado"
fi

# Componentes críticos
echo "📦 Respaldando componentes críticos..."
mkdir -p "${BACKUP_DIR}/components"

CRITICAL_COMPONENTS=(
  "BalancePersonal.tsx"
  "FinancialManager.tsx"
  "ProjectionPay.tsx"
  "DecimoCuarto.tsx"
)

for component in "${CRITICAL_COMPONENTS[@]}"; do
  if [ -f "src/components/${component}" ]; then
    cp "src/components/${component}" "${BACKUP_DIR}/components/"
    echo "  ✅ ${component} respaldado"
  fi
done

# Utilidades
echo "🔧 Respaldando utilidades..."
mkdir -p "${BACKUP_DIR}/utils"

UTILITIES=(
  "calculations.ts"
  "payCalculations.ts"
  "database.ts"
  "monthlyBaseCalculator.ts"
  "cardGenerator.ts"
)

for util in "${UTILITIES[@]}"; do
  if [ -f "src/utils/${util}" ]; then
    cp "src/utils/${util}" "${BACKUP_DIR}/utils/"
    echo "  ✅ ${util} respaldado"
  fi
done

# Configuración
echo "⚙️  Respaldando configuración..."

CONFIG_FILES=(
  "package.json"
  "tsconfig.json"
  "vite.config.js"
  "tailwind.config.js"
  "index.html"
)

for config in "${CONFIG_FILES[@]}"; do
  if [ -f "${config}" ]; then
    cp "${config}" "${BACKUP_DIR}/"
    echo "  ✅ ${config} respaldado"
  fi
done

# Crear archivo de metadata
cat > "${BACKUP_DIR}/METADATA.txt" << EOF
========================================
BACKUP METADATA
========================================
Fecha: $(date)
Timestamp: ${TIMESTAMP}
Versión: 1.4.9
Programador: Hugo Leon

Archivos respaldados:
$(ls -1 ${BACKUP_DIR} | wc -l) archivos en raíz
$(ls -1 ${BACKUP_DIR}/components 2>/dev/null | wc -l) componentes
$(ls -1 ${BACKUP_DIR}/utils 2>/dev/null | wc -l) utilidades

Comando para restaurar:
./restore_backup.sh ${TIMESTAMP}
========================================
EOF

echo ""
echo "=========================================="
echo "  ✅ BACKUP COMPLETADO"
echo "=========================================="
echo ""
echo "📁 Ubicación: ${BACKUP_DIR}"
echo "📊 Archivos respaldados: $(find ${BACKUP_DIR} -type f | wc -l)"
echo "💾 Tamaño: $(du -sh ${BACKUP_DIR} | cut -f1)"
echo ""
echo "🔄 Para restaurar este backup:"
echo "   ./restore_backup.sh ${TIMESTAMP}"
echo ""
echo "📋 Para ver todos los backups:"
echo "   ls -la backups/"
echo ""
echo "💡 Recomendación: Ejecutar este script"
echo "   antes de cada cambio importante"
echo ""
echo "=========================================="
