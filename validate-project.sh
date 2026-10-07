#!/bin/bash

# Script de Validación Pre-Commit
# Este script verifica que el proyecto esté en buen estado antes de hacer commit

echo "🔍 Validando estado del proyecto..."
echo ""

# Verificar que App.tsx no esté vacío
APP_SIZE=$(wc -l < src/App.tsx)
if [ "$APP_SIZE" -lt 100 ]; then
    echo "❌ ERROR: src/App.tsx tiene solo $APP_SIZE líneas"
    echo "   El archivo principal parece estar dañado o vacío"
    echo "   Mínimo requerido: 100 líneas"
    exit 1
fi
echo "✅ App.tsx válido ($APP_SIZE líneas)"

# Verificar que el proyecto compile
echo "🔨 Verificando build..."
if ! npm run build > /dev/null 2>&1; then
    echo "❌ ERROR: El proyecto no compila"
    echo "   Ejecuta 'npm run build' para ver los errores"
    exit 1
fi
echo "✅ Build exitoso"

# Verificar tamaño del bundle
JS_SIZE=$(stat -f%z dist/assets/*.js 2>/dev/null || stat -c%s dist/assets/*.js 2>/dev/null)
if [ "$JS_SIZE" -lt 100000 ]; then
    echo "❌ ERROR: El bundle JS es muy pequeño ($JS_SIZE bytes)"
    echo "   Esto puede indicar que falta código"
    exit 1
fi
echo "✅ Bundle JS válido ($JS_SIZE bytes)"

# Verificar que existan los componentes principales
COMPONENTS=(
    "src/components/BalancePersonal.tsx"
    "src/components/FinancialManager.tsx"
    "src/components/ProjectionPay.tsx"
    "src/components/DecimoCuarto.tsx"
)

for comp in "${COMPONENTS[@]}"; do
    if [ ! -f "$comp" ]; then
        echo "❌ ERROR: Falta el componente $comp"
        exit 1
    fi
done
echo "✅ Todos los componentes principales existen"

# Verificar que existan las utilidades
UTILS=(
    "src/utils/calculations.ts"
    "src/utils/payCalculations.ts"
    "src/utils/cardGenerator.ts"
    "src/utils/database.ts"
)

for util in "${UTILS[@]}"; do
    if [ ! -f "$util" ]; then
        echo "❌ ERROR: Falta la utilidad $util"
        exit 1
    fi
done
echo "✅ Todas las utilidades existen"

echo ""
echo "✅✅✅ VALIDACIÓN COMPLETADA EXITOSAMENTE ✅✅✅"
echo ""
echo "El proyecto está en buen estado y listo para commit"
exit 0
