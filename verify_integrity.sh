#!/bin/bash

# Script de Verificación de Integridad
# Control de Asistencia - Hugo Leon

echo "=========================================="
echo "  VERIFICACIÓN DE INTEGRIDAD"
echo "  Control de Asistencia HL v1.4.9"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Función para verificar archivo
verify_file() {
  local file=$1
  local min_lines=$2
  local description=$3
  
  if [ ! -f "$file" ]; then
    echo "  ❌ ${file} NO EXISTE"
    ERRORS=$((ERRORS + 1))
    return 1
  fi
  
  lines=$(wc -l < "$file")
  
  if [ "$lines" -lt "$min_lines" ]; then
    echo "  ⚠️  ${file} tiene solo ${lines} líneas (mínimo: ${min_lines})"
    WARNINGS=$((WARNINGS + 1))
    return 1
  fi
  
  echo "  ✅ ${file} (${lines} líneas)"
  return 0
}

# Verificar archivos críticos
echo "📄 Verificando archivos críticos..."

verify_file "src/App.tsx" 400 "Componente principal"
verify_file "src/main.tsx" 5 "Punto de entrada"
verify_file "src/types.ts" 100 "Tipos TypeScript"
verify_file "src/hooks/useAttendanceStorage.ts" 150 "Hook de almacenamiento"

echo ""
echo "📦 Verificando componentes..."

verify_file "src/components/BalancePersonal.tsx" 2000 "Balance personal"
verify_file "src/components/FinancialManager.tsx" 900 "Gestor financiero"
verify_file "src/components/ProjectionPay.tsx" 700 "Proyección de pagos"
verify_file "src/components/DecimoCuarto.tsx" 200 "Décimo cuarto"
verify_file "src/components/RecordForm.tsx" 200 "Formulario de registro"
verify_file "src/components/RecordList.tsx" 150 "Lista de registros"
verify_file "src/components/Summary.tsx" 100 "Resumen semanal"
verify_file "src/components/WeeklyChart.tsx" 50 "Gráfico semanal"
verify_file "src/components/MonthlyChart.tsx" 70 "Gráfico mensual"
verify_file "src/components/HolidayManager.tsx" 150 "Gestor de feriados"
verify_file "src/components/ProjectionPanel.tsx" 100 "Panel de proyecciones"
verify_file "src/components/OptionsMenu.tsx" 100 "Menú de opciones"
verify_file "src/components/ThemeSelector.tsx" 100 "Selector de temas"
verify_file "src/components/ContactInfo.tsx" 150 "Información de contacto"
verify_file "src/components/WelcomeModal.tsx" 100 "Modal de bienvenida"

echo ""
echo "🔧 Verificando utilidades..."

verify_file "src/utils/calculations.ts" 150 "Cálculos generales"
verify_file "src/utils/payCalculations.ts" 100 "Cálculos de pagos"
verify_file "src/utils/database.ts" 200 "Exportación/importación"
verify_file "src/utils/monthlyBaseCalculator.ts" 150 "Bases mensuales"
verify_file "src/utils/cardGenerator.ts" 400 "Generador de fichas"
verify_file "src/utils/photoEncryption.ts" 100 "Encriptación de fotos"

echo ""
echo "⚙️  Verificando configuración..."

verify_file "index.html" 50 "HTML principal"
verify_file "package.json" 30 "Dependencias"
verify_file "tsconfig.json" 20 "Config TypeScript"
verify_file "vite.config.js" 10 "Config Vite"
verify_file "tailwind.config.js" 10 "Config Tailwind"

echo ""
echo "=========================================="
echo "  RESULTADO DE VERIFICACIÓN"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ TODOS LOS ARCHIVOS ESTÁN CORRECTOS"
  echo ""
  echo "📊 Resumen:"
  echo "   - Errores: 0"
  echo "   - Advertencias: 0"
  echo "   - Estado: ✅ ÓPTIMO"
  echo ""
  echo "🚀 El proyecto está listo para ejecutar:"
  echo "   npm run dev"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo "⚠️  PROYECTO FUNCIONAL CON ADVERTENCIAS"
  echo ""
  echo "📊 Resumen:"
  echo "   - Errores: 0"
  echo "   - Advertencias: ${WARNINGS}"
  echo "   - Estado: ⚠️  REVISAR"
  echo ""
  echo "💡 Algunos archivos tienen menos líneas de lo esperado."
  echo "   Esto puede ser normal si son componentes pequeños."
  exit 0
else
  echo "❌ PROYECTO CON ERRORES CRÍTICOS"
  echo ""
  echo "📊 Resumen:"
  echo "   - Errores: ${ERRORS}"
  echo "   - Advertencias: ${WARNINGS}"
  echo "   - Estado: ❌ CRÍTICO"
  echo ""
  echo "🔧 ACCIONES RECOMENDADAS:"
  echo ""
  echo "1. Restaurar desde backup:"
  echo "   ./restore_backup.sh <TIMESTAMP>"
  echo ""
  echo "2. Ver backups disponibles:"
  echo "   ls -la backups/"
  echo ""
  echo "3. Si no hay backup, recrear archivos manualmente"
  echo ""
  exit 1
fi
