#!/bin/bash

# Script de Recuperación de Emergencia
# Control de Asistencia - Hugo Leon

echo "=========================================="
echo "  🚨 RECUPERACIÓN DE EMERGENCIA"
echo "  Control de Asistencia HL v1.4.9"
echo "=========================================="
echo ""

# 1. Detener servidor si está corriendo
echo "🛑 Deteniendo servidor..."
pkill -f "npm run dev" 2>/dev/null
pkill -f "vite" 2>/dev/null
echo "  ✅ Servidor detenido"

# 2. Verificar backups
echo ""
echo "📦 Buscando backups disponibles..."
if [ -d "backups" ] && [ "$(ls -A backups 2>/dev/null)" ]; then
  latest=$(ls -t backups/ | head -1)
  echo "  ✅ Backup encontrado: ${latest}"
  
  # Mostrar información del backup
  if [ -f "backups/${latest}/METADATA.txt" ]; then
    echo ""
    echo "📋 Información del backup:"
    cat "backups/${latest}/METADATA.txt"
  fi
  
  echo ""
  read -p "¿Restaurar este backup? (s/n): " confirm
  
  if [ "$confirm" = "s" ]; then
    echo ""
    echo "🔄 Restaurando backup..."
    ./restore_backup.sh ${latest}
    exit $?
  fi
else
  echo "  ❌ No hay backups disponibles"
fi

# 3. Verificar Git
echo ""
echo "📝 Verificando Git..."
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "  ✅ Git disponible"
  echo ""
  echo "📋 Commits recientes:"
  git log --oneline | head -10
  echo ""
  
  # Verificar si hay cambios sin commit
  if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Hay cambios sin commit:"
    git status --short
    echo ""
    read -p "¿Descartar cambios y volver a commit anterior? (s/n): " confirm
    
    if [ "$confirm" = "s" ]; then
      echo ""
      read -p "Ingresa el hash del commit (de la lista arriba): " commit_hash
      
      if [ -n "$commit_hash" ]; then
        echo ""
        echo "🔄 Volviendo a commit ${commit_hash}..."
        git checkout $commit_hash
        echo "  ✅ Commit restaurado"
        echo ""
        echo "📦 Reinstalando dependencias..."
        npm install
        echo ""
        echo "📦 Verificando build..."
        npm run build
        exit $?
      fi
    fi
  else
    echo "✅ No hay cambios sin commit"
  fi
else
  echo "  ❌ Git no está configurado"
  echo ""
  echo "💡 Para configurar Git:"
  echo "   git init"
  echo "   git add ."
  echo "   git commit -m 'Initial commit'"
fi

# 4. Verificar integridad
echo ""
echo "🔍 Verificando integridad de archivos..."
./verify_integrity.sh
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Los archivos están correctos"
  echo ""
  echo "🚀 El proyecto debería funcionar"
  echo "   Ejecutar: npm run dev"
  exit 0
else
  echo ""
  echo "❌ Hay problemas de integridad"
fi

# 5. Recuperación manual
echo ""
echo "=========================================="
echo "  📋 RECUPERACIÓN MANUAL"
echo "=========================================="
echo ""
echo "Si los métodos automáticos fallaron, sigue estos pasos:"
echo ""
echo "1. 📄 Revisar documentación:"
echo "   - DIAGNOSTICO_PROYECTO.md"
echo "   - CHECKPOINT_FINAL.md"
echo "   - GUIA_PREVENCION.md"
echo ""
echo "2. 🔍 Identificar archivos dañados:"
echo "   wc -l src/App.tsx"
echo "   # Debe tener > 400 líneas"
echo ""
echo "3. 📦 Recrear desde cero (último recurso):"
echo "   a. Hacer backup de datos: cp -r src backups/src_$(date +%Y%m%d)"
echo "   b. Recrear App.tsx desde CHECKPOINT_FINAL.md"
echo "   c. Recrear componentes críticos"
echo "   d. Verificar con ./verify_integrity.sh"
echo ""
echo "4. 🆘 Contactar soporte:"
echo "   Programador: Hugo Leon"
echo "   Versión: 1.4.9"
echo ""
echo "=========================================="
echo ""

# 6. Ofrecer crear backup de emergencia
read -p "¿Crear backup de emergencia del estado actual? (s/n): " confirm

if [ "$confirm" = "s" ]; then
  echo ""
  echo "📦 Creando backup de emergencia..."
  mkdir -p backups
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  BACKUP_DIR="backups/emergency_${TIMESTAMP}"
  mkdir -p "${BACKUP_DIR}"
  
  # Copiar todos los archivos src
  cp -r src "${BACKUP_DIR}/"
  
  # Copiar configuración
  cp package.json "${BACKUP_DIR}/" 2>/dev/null
  cp tsconfig.json "${BACKUP_DIR}/" 2>/dev/null
  cp vite.config.js "${BACKUP_DIR}/" 2>/dev/null
  cp index.html "${BACKUP_DIR}/" 2>/dev/null
  
  # Crear metadata
  cat > "${BACKUP_DIR}/METADATA.txt" << EOF
========================================
EMERGENCY BACKUP
========================================
Fecha: $(date)
Timestamp: ${TIMESTAMP}
Motivo: Recuperación de emergencia

Archivos respaldados:
$(find ${BACKUP_DIR} -type f | wc -l) archivos

Para restaurar:
cp -r ${BACKUP_DIR}/src ./src
cp ${BACKUP_DIR}/package.json ./
cp ${BACKUP_DIR}/tsconfig.json ./
cp ${BACKUP_DIR}/vite.config.js ./
cp ${BACKUP_DIR}/index.html ./
========================================
EOF
  
  echo "  ✅ Backup creado en: ${BACKUP_DIR}"
fi

echo ""
echo "=========================================="
echo "  Fin de la recuperación de emergencia"
echo "=========================================="
