#!/bin/bash

# Hook de Git Pre-Commit
# Este script se ejecuta automáticamente antes de cada commit
# Verifica que el proyecto esté en buen estado

echo "🔍 Ejecutando validaciones pre-commit..."
echo ""

# Verificar que el proyecto compile
echo "🔨 Verificando build..."
if ! npm run build > /dev/null 2>&1; then
    echo "❌ ERROR: El proyecto no compila"
    echo "   Ejecuta 'npm run build' para ver los errores"
    echo ""
    echo "💡 Para ignorar esta validación (NO RECOMENDADO):"
    echo "   git commit --no-verify"
    exit 1
fi
echo "✅ Build exitoso"

# Verificar que App.tsx no esté vacío
echo "📄 Verificando App.tsx..."
APP_SIZE=$(wc -l < src/App.tsx)
if [ "$APP_SIZE" -lt 100 ]; then
    echo "❌ ERROR: src/App.tsx tiene solo $APP_SIZE líneas"
    echo "   El archivo principal parece estar dañado"
    echo ""
    echo "💡 Para ignorar esta validación (NO RECOMENDADO):"
    echo "   git commit --no-verify"
    exit 1
fi
echo "✅ App.tsx válido ($APP_SIZE líneas)"

# Verificar integridad de componentes críticos
echo "🧩 Verificando componentes..."
CRITICAL_COMPONENTS=(
    "src/components/BalancePersonal.tsx:2000"
    "src/components/FinancialManager.tsx:900"
    "src/components/ProjectionPay.tsx:700"
)

for comp_info in "${CRITICAL_COMPONENTS[@]}"; do
    IFS=':' read -r comp min_lines <<< "$comp_info"
    if [ ! -f "$comp" ]; then
        echo "❌ ERROR: Falta $comp"
        exit 1
    fi
    lines=$(wc -l < "$comp")
    if [ "$lines" -lt "$min_lines" ]; then
        echo "❌ ERROR: $comp tiene solo $lines líneas (mínimo: $min_lines)"
        exit 1
    fi
done
echo "✅ Componentes críticos válidos"

# Verificar que no haya archivos temporales
echo "🧹 Verificando archivos temporales..."
if ls *.log 1> /dev/null 2>&1; then
    echo "⚠️  ADVERTENCIA: Hay archivos .log en el directorio raíz"
    echo "   Considera agregarlos a .gitignore"
fi
echo "✅ No hay archivos temporales problemáticos"

echo ""
echo "✅✅✅ VALIDACIONES PRE-COMMIT COMPLETADAS ✅✅✅"
echo ""
echo "El proyecto está en buen estado y listo para commit"
exit 0
