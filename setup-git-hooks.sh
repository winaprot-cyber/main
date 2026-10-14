#!/bin/bash

# Script de Configuración de Git Hooks
# Control de Asistencia HL - v1.4.9
# Creador by Hugo Leon

echo "🔧 Configurando Git Hooks..."
echo ""

# Verificar si estamos en un repositorio Git
if [ ! -d ".git" ]; then
    echo "❌ No se encontró un repositorio Git"
    echo "💡 Ejecuta primero: git init"
    exit 1
fi

# Crear directorio de hooks si no existe
mkdir -p .git/hooks

# Crear hook pre-commit
echo "📝 Creando hook pre-commit..."
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Hook de pre-commit para Control de Asistencia HL
# Este hook verifica la integridad del proyecto antes de cada commit

echo "🔍 Verificando integridad del proyecto antes del commit..."
echo ""

# Verificar que App.tsx no esté vacío
LINES=$(wc -l < src/App.tsx 2>/dev/null || echo "0")
if [ "$LINES" -lt 100 ]; then
    echo "❌ ERROR: App.tsx tiene solo $LINES líneas"
    echo "💡 Esto puede indicar que el archivo está dañado"
    echo "💡 Ejecuta: ./restore.sh para restaurar desde backup"
    exit 1
fi

# Verificar que el proyecto compile
echo "🔨 Verificando build..."
if ! npm run build > /dev/null 2>&1; then
    echo "❌ ERROR: Build falló"
    echo "💡 Ejecuta: npm run build para ver errores"
    exit 1
fi

# Verificar componentes críticos
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

echo "✅ Verificación exitosa"
echo ""
exit 0
EOF

# Dar permisos de ejecución
chmod +x .git/hooks/pre-commit

echo "✅ Hook pre-commit configurado"
echo ""

# Crear hook post-commit
echo "📝 Creando hook post-commit..."
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash

# Hook de post-commit para Control de Asistencia HL
# Este hook hace un backup automático después de cada commit

echo "🔄 Creando backup automático post-commit..."

# Ejecutar backup
if [ -f "./backup.sh" ]; then
    ./backup.sh > /dev/null 2>&1
    echo "✅ Backup creado exitosamente"
else
    echo "⚠️  Script de backup no encontrado"
fi

echo ""
exit 0
EOF

# Dar permisos de ejecución
chmod +x .git/hooks/post-commit

echo "✅ Hook post-commit configurado"
echo ""

# Crear hook pre-push
echo "📝 Creando hook pre-push..."
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

# Hook de pre-push para Control de Asistencia HL
# Este hook verifica la integridad antes de hacer push

echo "🔍 Verificación final antes de push..."
echo ""

# Verificar que App.tsx tenga contenido sustancial
LINES=$(wc -l < src/App.tsx 2>/dev/null || echo "0")
if [ "$LINES" -lt 400 ]; then
    echo "⚠️  WARNING: App.tsx tiene solo $LINES líneas"
    echo "💡 Verifica que el archivo esté completo"
    read -p "¿Continuar con el push? (s/n): " CONFIRM
    if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
        echo "❌ Push cancelado"
        exit 1
    fi
fi

# Verificar build
if ! npm run build > /dev/null 2>&1; then
    echo "❌ ERROR: Build falló"
    echo "💡 No se puede hacer push con errores de build"
    exit 1
fi

echo "✅ Verificación exitosa"
echo ""
exit 0
EOF

# Dar permisos de ejecución
chmod +x .git/hooks/pre-push

echo "✅ Hook pre-push configurado"
echo ""

# Resumen
echo "═══════════════════════════════════════"
echo "✅ Git Hooks configurados exitosamente"
echo "═══════════════════════════════════════"
echo ""
echo "📋 Hooks configurados:"
echo "   • pre-commit: Verifica integridad antes de commit"
echo "   • post-commit: Crea backup automático después de commit"
echo "   • pre-push: Verificación final antes de push"
echo ""
echo "🔒 Estos hooks protegerán tu proyecto de:"
echo "   • Commits con archivos dañados"
echo "   • Builds fallidos"
echo "   • Pérdida de código"
echo ""
echo "💡 Para desactivar los hooks:"
echo "   rm .git/hooks/pre-commit"
echo "   rm .git/hooks/post-commit"
echo "   rm .git/hooks/pre-push"
echo ""
