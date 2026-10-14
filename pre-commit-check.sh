#!/bin/bash

# Script de Verificación Rápida Antes de Commit
# Control de Asistencia HL - v1.4.9
# Creador by Hugo Leon

echo "🔍 Verificación rápida antes de commit..."
echo ""

# Verificar que App.tsx no esté vacío
echo "📄 Verificando App.tsx..."
LINES=$(wc -l < src/App.tsx 2>/dev/null || echo "0")
if [ "$LINES" -lt 100 ]; then
    echo "❌ ERROR: App.tsx tiene solo $LINES líneas"
    echo "💡 Esto puede indicar que el archivo está dañado"
    echo "💡 Ejecuta: ./restore.sh para restaurar desde backup"
    exit 1
else
    echo "✅ App.tsx OK ($LINES líneas)"
fi

# Verificar que el proyecto compile
echo ""
echo "🔨 Verificando build..."
if ! npm run build > /dev/null 2>&1; then
    echo "❌ ERROR: Build falló"
    echo "💡 Ejecuta: npm run build para ver errores"
    exit 1
else
    echo "✅ Build exitoso"
fi

# Verificar tamaño del bundle
echo ""
echo "📦 Verificando tamaño del bundle..."
JS_SIZE=$(stat -f%z dist/assets/*.js 2>/dev/null || stat -c%s dist/assets/*.js 2>/dev/null || echo "0")
if [ "$JS_SIZE" -lt 100000 ]; then
    echo "⚠️  WARNING: El bundle JS es muy pequeño ($JS_SIZE bytes)"
    echo "💡 Esto puede indicar que falta código"
else
    echo "✅ Bundle JS OK ($(echo "scale=2; $JS_SIZE/1024" | bc) KB)"
fi

# Verificar que existan los componentes críticos
echo ""
echo "📦 Verificando componentes críticos..."
CRITICAL_COMPONENTS=(
    "src/components/BalancePersonal.tsx"
    "src/components/FinancialManager.tsx"
    "src/components/ProjectionPay.tsx"
)

for component in "${CRITICAL_COMPONENTS[@]}"; do
    if [ ! -f "$component" ]; then
        echo "❌ ERROR: $component no existe"
        exit 1
    fi
done
echo "✅ Componentes críticos presentes"

# Resumen
echo ""
echo "═══════════════════════════════════════"
echo "✅ Verificación completada"
echo "═══════════════════════════════════════"
echo ""
echo "🎉 El proyecto está listo para commit"
echo ""
echo "💡 Recomendaciones:"
echo "   1. Hacer backup: ./backup.sh"
echo "   2. Commit con mensaje descriptivo"
echo "   3. Push al repositorio"
echo ""

exit 0
