#!/bin/bash

# Script de Verificación de Integridad
# Verifica que todos los archivos críticos estén presentes y no dañados

echo "🔍 Verificando integridad del proyecto..."
echo ""

ERRORS=0

# Función para verificar archivo
check_file() {
    local file=$1
    local min_lines=$2
    local description=$3
    
    if [ ! -f "$file" ]; then
        echo "❌ FALTA: $description ($file)"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
    
    local lines=$(wc -l < "$file")
    if [ "$lines" -lt "$min_lines" ]; then
        echo "❌ DAÑADO: $description tiene solo $lines líneas (mínimo: $min_lines)"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
    
    echo "✅ OK: $description ($lines líneas)"
    return 0
}

# Verificar archivos principales
echo "📄 Archivos Principales:"
check_file "src/App.tsx" 400 "App.tsx (componente principal)"
check_file "src/main.tsx" 5 "main.tsx (punto de entrada)"
check_file "src/types.ts" 50 "types.ts (tipos TypeScript)"
check_file "src/index.css" 1 "index.css (estilos globales)"
echo ""

# Verificar componentes críticos
echo "🧩 Componentes Críticos:"
check_file "src/components/BalancePersonal.tsx" 2000 "BalancePersonal.tsx"
check_file "src/components/FinancialManager.tsx" 900 "FinancialManager.tsx"
check_file "src/components/ProjectionPay.tsx" 700 "ProjectionPay.tsx"
check_file "src/components/DecimoCuarto.tsx" 200 "DecimoCuarto.tsx"
check_file "src/components/RecordForm.tsx" 150 "RecordForm.tsx"
check_file "src/components/RecordList.tsx" 100 "RecordList.tsx"
check_file "src/components/Summary.tsx" 80 "Summary.tsx"
check_file "src/components/WeeklyChart.tsx" 50 "WeeklyChart.tsx"
check_file "src/components/MonthlyChart.tsx" 50 "MonthlyChart.tsx"
check_file "src/components/ProjectionPanel.tsx" 80 "ProjectionPanel.tsx"
check_file "src/components/HolidayManager.tsx" 100 "HolidayManager.tsx"
check_file "src/components/OptionsMenu.tsx" 80 "OptionsMenu.tsx"
check_file "src/components/ThemeSelector.tsx" 80 "ThemeSelector.tsx"
check_file "src/components/ContactInfo.tsx" 100 "ContactInfo.tsx"
check_file "src/components/WelcomeModal.tsx" 80 "WelcomeModal.tsx"
echo ""

# Verificar utilidades
echo "🔧 Utilidades:"
check_file "src/utils/calculations.ts" 100 "calculations.ts"
check_file "src/utils/payCalculations.ts" 100 "payCalculations.ts"
check_file "src/utils/cardGenerator.ts" 300 "cardGenerator.ts"
check_file "src/utils/database.ts" 150 "database.ts"
check_file "src/utils/monthlyBaseCalculator.ts" 150 "monthlyBaseCalculator.ts"
check_file "src/utils/photoEncryption.ts" 80 "photoEncryption.ts"
echo ""

# Verificar hooks
echo "🪝 Hooks:"
check_file "src/hooks/useAttendanceStorage.ts" 200 "useAttendanceStorage.ts"
echo ""

# Verificar configuración
echo "⚙️  Configuración:"
check_file "package.json" 30 "package.json"
check_file "tsconfig.json" 20 "tsconfig.json"
check_file "vite.config.js" 10 "vite.config.js"
check_file "tailwind.config.js" 10 "tailwind.config.js"
check_file "index.html" 10 "index.html"
echo ""

# Verificar que node_modules exista
echo "📦 Dependencias:"
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules no existe"
    echo "   Ejecuta: npm install"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ node_modules existe"
fi
echo ""

# Resumen
echo "═══════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
    echo "✅✅✅ INTEGRIDAD VERIFICADA ✅✅✅"
    echo ""
    echo "Todos los archivos están presentes y no dañados"
    echo "El proyecto está listo para usar"
    exit 0
else
    echo "❌❌❌ PROBLEMAS DETECTADOS ❌❌❌"
    echo ""
    echo "Se encontraron $ERRORS problema(s)"
    echo ""
    echo "💡 Soluciones:"
    echo "   1. Restaurar desde backup: ./restore-backup.sh"
    echo "   2. Reinstalar dependencias: npm install"
    echo "   3. Verificar archivos dañados manualmente"
    exit 1
fi
