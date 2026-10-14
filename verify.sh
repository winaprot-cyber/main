#!/bin/bash

# Script de Verificación de Integridad del Proyecto
# Control de Asistencia HL - v1.4.9
# Creador by Hugo Leon

echo "🔍 Verificando integridad del proyecto..."
echo ""

ERRORS=0
WARNINGS=0

# Verificar archivo crítico: App.tsx
echo "📄 Verificando App.tsx..."
if [ -f "src/App.tsx" ]; then
    LINES=$(wc -l < src/App.tsx)
    if [ "$LINES" -lt 100 ]; then
        echo "❌ ERROR: App.tsx tiene solo $LINES líneas (debería tener ~456)"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ App.tsx OK ($LINES líneas)"
    fi
else
    echo "❌ ERROR: App.tsx no existe"
    ERRORS=$((ERRORS + 1))
fi

# Verificar componentes críticos
echo ""
echo "📦 Verificando componentes..."
COMPONENTS=(
    "src/components/BalancePersonal.tsx"
    "src/components/FinancialManager.tsx"
    "src/components/ProjectionPay.tsx"
    "src/components/DecimoCuarto.tsx"
    "src/components/RecordForm.tsx"
    "src/components/RecordList.tsx"
    "src/components/Summary.tsx"
    "src/components/WeeklyChart.tsx"
    "src/components/MonthlyChart.tsx"
    "src/components/HolidayManager.tsx"
    "src/components/ProjectionPanel.tsx"
    "src/components/OptionsMenu.tsx"
    "src/components/ThemeSelector.tsx"
    "src/components/WelcomeModal.tsx"
    "src/components/ContactInfo.tsx"
)

for component in "${COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        LINES=$(wc -l < "$component")
        if [ "$LINES" -lt 10 ]; then
            echo "⚠️  WARNING: $component tiene solo $LINES líneas"
            WARNINGS=$((WARNINGS + 1))
        else
            echo "✅ $component OK ($LINES líneas)"
        fi
    else
        echo "❌ ERROR: $component no existe"
        ERRORS=$((ERRORS + 1))
    fi
done

# Verificar utilidades
echo ""
echo "🔧 Verificando utilidades..."
UTILS=(
    "src/utils/calculations.ts"
    "src/utils/cardGenerator.ts"
    "src/utils/database.ts"
    "src/utils/monthlyBaseCalculator.ts"
    "src/utils/payCalculations.ts"
    "src/utils/photoEncryption.ts"
)

for util in "${UTILS[@]}"; do
    if [ -f "$util" ]; then
        echo "✅ $util OK"
    else
        echo "❌ ERROR: $util no existe"
        ERRORS=$((ERRORS + 1))
    fi
done

# Verificar hooks
echo ""
echo "🪝 Verificando hooks..."
if [ -f "src/hooks/useAttendanceStorage.ts" ]; then
    echo "✅ useAttendanceStorage.ts OK"
else
    echo "❌ ERROR: useAttendanceStorage.ts no existe"
    ERRORS=$((ERRORS + 1))
fi

# Verificar archivos de configuración
echo ""
echo "⚙️  Verificando configuración..."
CONFIG_FILES=(
    "package.json"
    "tsconfig.json"
    "vite.config.js"
    "index.html"
    "src/main.tsx"
    "src/types.ts"
    "src/index.css"
)

for config in "${CONFIG_FILES[@]}"; do
    if [ -f "$config" ]; then
        echo "✅ $config OK"
    else
        echo "❌ ERROR: $config no existe"
        ERRORS=$((ERRORS + 1))
    fi
done

# Verificar que el proyecto compile
echo ""
echo "🔨 Verificando build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build exitoso"
else
    echo "❌ ERROR: Build falló"
    ERRORS=$((ERRORS + 1))
fi

# Resumen
echo ""
echo "═══════════════════════════════════════"
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "═══════════════════════════════════════"
echo "✅ Errores: $ERRORS"
echo "⚠️  Warnings: $WARNINGS"
echo ""

if [ "$ERRORS" -eq 0 ]; then
    echo "🎉 ¡Proyecto íntegro y funcional!"
    exit 0
else
    echo "❌ Se encontraron $ERRORS error(es)"
    echo ""
    echo "💡 Acciones recomendadas:"
    echo "   1. Ejecutar: ./restore.sh"
    echo "   2. O restaurar desde backup: cp -r backups/backup_*/src/* src/"
    exit 1
fi
