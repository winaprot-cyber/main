#!/bin/bash

# Script de Configuración Inicial de Protección
# Control de Asistencia HL - v1.4.9
# Creador by Hugo Leon

echo "🚀 Configuración Inicial de Protección"
echo "═══════════════════════════════════════"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    echo "💡 Asegúrate de ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Paso 1: Crear directorio de backups
echo "📁 Paso 1: Creando directorio de backups..."
mkdir -p backups
echo "✅ Directorio backups/ creado"
echo ""

# Paso 2: Dar permisos de ejecución a los scripts
echo "🔐 Paso 2: Configurando permisos de scripts..."
chmod +x backup.sh 2>/dev/null && echo "✅ backup.sh configurado" || echo "⚠️  backup.sh no encontrado"
chmod +x verify.sh 2>/dev/null && echo "✅ verify.sh configurado" || echo "⚠️  verify.sh no encontrado"
chmod +x restore.sh 2>/dev/null && echo "✅ restore.sh configurado" || echo "⚠️  restore.sh no encontrado"
chmod +x pre-commit-check.sh 2>/dev/null && echo "✅ pre-commit-check.sh configurado" || echo "⚠️  pre-commit-check.sh no encontrado"
chmod +x monitor.sh 2>/dev/null && echo "✅ monitor.sh configurado" || echo "⚠️  monitor.sh no encontrado"
chmod +x setup-git-hooks.sh 2>/dev/null && echo "✅ setup-git-hooks.sh configurado" || echo "⚠️  setup-git-hooks.sh no encontrado"
echo ""

# Paso 3: Hacer primer backup
echo "💾 Paso 3: Creando primer backup..."
./backup.sh > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Primer backup creado exitosamente"
else
    echo "⚠️  Error al crear el primer backup"
fi
echo ""

# Paso 4: Verificar integridad
echo "🔍 Paso 4: Verificando integridad del proyecto..."
./verify.sh > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Proyecto íntegro y funcional"
else
    echo "⚠️  Se encontraron problemas de integridad"
    echo "💡 Ejecuta: ./verify.sh para ver detalles"
fi
echo ""

# Paso 5: Configurar Git hooks (si hay repositorio Git)
echo "🔒 Paso 5: Configurando Git hooks..."
if [ -d ".git" ]; then
    ./setup-git-hooks.sh > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Git hooks configurados"
    else
        echo "⚠️  Error al configurar Git hooks"
    fi
else
    echo "⚠️  No se encontró repositorio Git"
    echo "💡 Para configurar Git hooks, ejecuta primero: git init"
fi
echo ""

# Paso 6: Crear archivo .gitignore si no existe
echo "📝 Paso 6: Verificando .gitignore..."
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build outputs
dist/
build/
.cache/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea/
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Testing
coverage/
.nyc_output/

# Temporary files
*.tmp
*.temp
.cache-loader/

# Backups (opcional, puedes comentar esta línea si quieres respaldar los backups)
# backups/
EOF
    echo "✅ .gitignore creado"
else
    echo "✅ .gitignore ya existe"
fi
echo ""

# Paso 7: Verificar dependencias
echo "📦 Paso 7: Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules no encontrado"
    echo "💡 Ejecutando: npm install"
    npm install > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Dependencias instaladas"
    else
        echo "❌ Error al instalar dependencias"
    fi
else
    echo "✅ Dependencias ya instaladas"
fi
echo ""

# Paso 8: Hacer build de prueba
echo "🔨 Paso 8: Haciendo build de prueba..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build exitoso"
else
    echo "❌ Error en el build"
    echo "💡 Ejecuta: npm run build para ver errores"
fi
echo ""

# Resumen final
echo "═══════════════════════════════════════"
echo "✅ CONFIGURACIÓN COMPLETADA"
echo "═══════════════════════════════════════"
echo ""
echo "📋 Scripts configurados:"
echo "   ✅ backup.sh - Crear backups"
echo "   ✅ verify.sh - Verificar integridad"
echo "   ✅ restore.sh - Restaurar desde backup"
echo "   ✅ pre-commit-check.sh - Verificación pre-commit"
echo "   ✅ monitor.sh - Monitoreo automático"
echo "   ✅ setup-git-hooks.sh - Configurar Git hooks"
echo ""
echo "🔒 Protecciones activas:"
echo "   ✅ Backups automáticos"
echo "   ✅ Verificación de integridad"
echo "   ✅ Git hooks protectores"
echo "   ✅ Monitoreo continuo (opcional)"
echo ""
echo "📚 Documentación disponible:"
echo "   📖 GUIA_PREVENCION.md - Guía completa de prevención"
echo "   📖 DIAGNOSTICO_PROYECTO.md - Análisis del daño anterior"
echo "   📖 CHECKPOINT_FINAL.md - Estado actual del proyecto"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Leer: cat GUIA_PREVENCION.md"
echo "   2. Hacer backup: ./backup.sh"
echo "   3. Verificar: ./verify.sh"
echo "   4. Ejecutar: npm run dev"
echo ""
echo "💡 Comandos útiles:"
echo "   • Backup: ./backup.sh"
echo "   • Verificar: ./verify.sh"
echo "   • Restaurar: ./restore.sh"
echo "   • Monitorear: ./monitor.sh &"
echo ""
echo "🎉 ¡Tu proyecto está protegido!"
echo ""
