#!/bin/bash

# 🔍 Sistema de Verificación de Integridad
# Control de Asistencia HL - Versión 1.4.9

echo "🔍 Verificando integridad del proyecto..."
echo ""

ERRORS=0
WARNINGS=0

# Función para verificar archivo
check_file() {
  local file=$1
  local min_lines=$2
  local description=$3
  
  if [ ! -f "$file" ]; then
    echo "  ❌ FALTANTE: $file"
    ((ERRORS++))
    return 1
  fi
  
  local lines=$(wc -l < "$file")
  if [ "$lines" -lt "$min_lines" ]; then
    echo "  ⚠️  SUSPECTO: $file (solo $lines líneas, mínimo esperado: $min_lines)"
    ((WARNINGS++))
    return 1
  fi
  
  echo "  ✅ OK: $file ($lines líneas)"
  return 0
}

# Verificar archivos principales
echo "📋 Archivos principales:"
check_file "src/App.tsx" 100 "Componente principal"
check_file "src/main.tsx" 5 "Punto de entrada"
check_file "src/types.ts" 50 "Definiciones de tipos"
check_file "src/index.css" 1 "Estilos globales"
echo ""

# Verificar componentes críticos
echo "🎨 Componentes críticos:"
check_file "src/components/BalancePersonal.tsx" 500 "Balance personal completo"
check_file "src/components/FinancialManager.tsx" 200 "Gestor financiero"
check_file "src/components/ProjectionPay.tsx" 200 "Proyección de pagos"
echo ""

# Verificar componentes secundarios
echo "🧩 Componentes secundarios:"
check_file "src/components/RecordForm.tsx" 50 "Formulario de registro"
check_file "src/components/RecordList.tsx" 50 "Lista de registros"
check_file "src/components/Summary.tsx" 30 "Resumen semanal"
check_file "src/components/HolidayManager.tsx" 30 "Gestor de feriados"
check_file "src/components/DecimoCuarto.tsx" 30 "Cálculo de décimo"
echo ""

# Verificar componentes de UI
echo "🎭 Componentes de UI:"
check_file "src/components/WeeklyChart.tsx" 20 "Gráfico semanal"
check_file "src/components/MonthlyChart.tsx" 20 "Gráfico mensual"
check_file "src/components/ProjectionPanel.tsx" 20 "Panel de proyecciones"
check_file "src/components/WelcomeModal.tsx" 20 "Modal de bienvenida"
check_file "src/components/OptionsMenu.tsx" 20 "Menú de opciones"
check_file "src/components/ThemeSelector.tsx" 20 "Selector de temas"
check_file "src/components/ContactInfo.tsx" 20 "Información de contacto"
echo ""

# Verificar hooks
echo "🪝 Hooks:"
check_file "src/hooks/useAttendanceStorage.ts" 100 "Hook de almacenamiento"
echo ""

# Verificar utilidades
echo "🔧 Utilidades:"
check_file "src/utils/calculations.ts" 50 "Cálculos generales"
check_file "src/utils/payCalculations.ts" 30 "Cálculos de pagos"
check_file "src/utils/database.ts" 30 "Exportación/importación"
check_file "src/utils/cardGenerator.ts" 50 "Generador de fichas"
check_file "src/utils/monthlyBaseCalculator.ts" 30 "Calculadora de bases mensuales"
check_file "src/utils/photoEncryption.ts" 20 "Encriptación de fotos"
echo ""

# Verificar configuración
echo "⚙️  Configuración:"
check_file "package.json" 20 "Dependencias"
check_file "tsconfig.json" 10 "Configuración TypeScript"
check_file "vite.config.js" 5 "Configuración Vite"
check_file "index.html" 10 "HTML principal"
echo ""

# Verificar que el proyecto compila
echo "🔨 Verificando compilación:"
if npm run build > /dev/null 2>&1; then
  echo "  ✅ Build exitoso"
else
  echo "  ❌ Build falló"
  ((ERRORS++))
fi
echo ""

# Resumen
echo "═══════════════════════════════════════"
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "═══════════════════════════════════════"
echo "  Errores:    $ERRORS"
echo "  Advertencias: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ PROYECTO EN PERFECTO ESTADO"
  echo ""
  echo "🎉 Todos los archivos están presentes y correctos"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo "⚠️  PROYECTO FUNCIONAL CON ADVERTENCIAS"
  echo ""
  echo "💡 Hay algunos archivos que podrían estar incompletos"
  echo "   pero el proyecto debería funcionar"
  exit 0
else
  echo "❌ PROYECTO DAÑADO"
  echo ""
  echo "🚨 Se encontraron $ERRORS errores críticos"
  echo ""
  echo "💡 Acciones recomendadas:"
  echo "   1. Restaurar desde backup: ./restore.sh [TIMESTAMP]"
  echo "   2. Ver backups disponibles: ls -la .backups/"
  echo "   3. Recrear archivos faltantes manualmente"
  exit 1
fi
