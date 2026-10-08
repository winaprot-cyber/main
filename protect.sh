#!/bin/bash

# 🛡️ Sistema de Protección de Archivos Críticos
# Control de Asistencia HL - Versión 1.4.9

# Archivos críticos que deben protegerse
CRITICAL_FILES=(
  "src/App.tsx"
  "src/main.tsx"
  "src/types.ts"
  "src/hooks/useAttendanceStorage.ts"
  "src/components/BalancePersonal.tsx"
  "src/components/FinancialManager.tsx"
  "src/components/ProjectionPay.tsx"
)

# Crear directorio de protección
mkdir -p .protected

echo "🛡️ Sistema de Protección de Archivos Críticos"
echo ""

# Función para proteger un archivo
protect_file() {
  local file=$1
  local protected=".protected/$(basename $file).protected"
  
  if [ ! -f "$file" ]; then
    echo "  ⚠️  $file no existe"
    return 1
  fi
  
  # Crear backup protegido
  cp "$file" "$protected"
  
  # Hacer el archivo protegido de solo lectura
  chmod 444 "$protected"
  
  echo "  ✅ $file protegido"
  return 0
}

# Función para verificar integridad
verify_file() {
  local file=$1
  local protected=".protected/$(basename $file).protected"
  
  if [ ! -f "$file" ]; then
    echo "  ❌ $file FALTANTE"
    return 1
  fi
  
  if [ ! -f "$protected" ]; then
    echo "  ⚠️  $file no tiene protección"
    return 1
  fi
  
  # Comparar archivos
  if diff -q "$file" "$protected" > /dev/null 2>&1; then
    echo "  ✅ $file intacto"
    return 0
  else
    echo "  ❌ $file MODIFICADO"
    return 1
  fi
}

# Función para restaurar archivo
restore_file() {
  local file=$1
  local protected=".protected/$(basename $file).protected"
  
  if [ ! -f "$protected" ]; then
    echo "  ❌ No hay backup protegido de $file"
    return 1
  fi
  
  # Crear backup antes de restaurar
  if [ -f "$file" ]; then
    cp "$file" "$file.backup.$(date +%Y%m%d_%H%M%S)"
  fi
  
  # Restaurar desde protección
  cp "$protected" "$file"
  chmod 644 "$file"
  
  echo "  ✅ $file restaurado"
  return 0
}

# Menú de opciones
case "$1" in
  "protect")
    echo "🔒 Protegiendo archivos críticos..."
    echo ""
    for file in "${CRITICAL_FILES[@]}"; do
      protect_file "$file"
    done
    echo ""
    echo "✅ Archivos protegidos en .protected/"
    ;;
    
  "verify")
    echo "🔍 Verificando integridad..."
    echo ""
    ERRORS=0
    for file in "${CRITICAL_FILES[@]}"; do
      if ! verify_file "$file"; then
        ((ERRORS++))
      fi
    done
    echo ""
    if [ $ERRORS -eq 0 ]; then
      echo "✅ Todos los archivos críticos están intactos"
    else
      echo "❌ Se encontraron $ERRORS archivos modificados"
      echo ""
      echo "💡 Para restaurar: ./protect.sh restore"
    fi
    ;;
    
  "restore")
    echo "🔄 Restaurando archivos críticos..."
    echo ""
    for file in "${CRITICAL_FILES[@]}"; do
      restore_file "$file"
    done
    echo ""
    echo "✅ Archivos restaurados desde protección"
    ;;
    
  "status")
    echo "📊 Estado de protección:"
    echo ""
    for file in "${CRITICAL_FILES[@]}"; do
      if [ -f ".protected/$(basename $file).protected" ]; then
        SIZE=$(wc -c < ".protected/$(basename $file).protected")
        DATE=$(stat -c %y ".protected/$(basename $file).protected" 2>/dev/null || stat -f %Sm ".protected/$(basename $file).protected")
        echo "  ✅ $(basename $file) ($SIZE bytes, $DATE)"
      else
        echo "  ❌ $(basename $file) sin protección"
      fi
    done
    ;;
    
  *)
    echo "🛡️ Sistema de Protección de Archivos Críticos"
    echo ""
    echo "Uso: ./protect.sh [COMANDO]"
    echo ""
    echo "Comandos:"
    echo "  protect  - Proteger archivos críticos"
    echo "  verify   - Verificar integridad"
    echo "  restore  - Restaurar desde protección"
    echo "  status   - Ver estado de protección"
    echo ""
    echo "Archivos protegidos:"
    for file in "${CRITICAL_FILES[@]}"; do
      echo "  - $file"
    done
    ;;
esac
