#!/bin/bash

# Script de Configuración Inicial
# Configura todos los scripts y hooks necesarios para la prevención

echo "🚀 Configurando sistema de prevención del proyecto..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: No se encuentra package.json"
    echo "   Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Hacer scripts ejecutables
echo "📝 Haciendo scripts ejecutables..."
chmod +x validate-project.sh
chmod +x backup-project.sh
chmod +x check-integrity.sh
chmod +x pre-commit-hook.sh
chmod +x restore-backup.sh
chmod +x setup-prevention.sh
echo "✅ Scripts configurados"
echo ""

# Crear directorio de backups
echo "📂 Creando directorio de backups..."
mkdir -p backups
echo "✅ Directorio creado: backups/"
echo ""

# Instalar hook de Git
echo "🪝 Instalando hook de Git pre-commit..."
if [ -d ".git" ]; then
    cp pre-commit-hook.sh .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo "✅ Hook instalado en .git/hooks/pre-commit"
else
    echo "⚠️  ADVERTENCIA: No se encontró directorio .git"
    echo "   Inicializa Git primero: git init"
fi
echo ""

# Verificar dependencias
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules no existe"
    echo "   Ejecutando: npm install"
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ Dependencias instaladas"
    else
        echo "❌ ERROR: No se pudieron instalar las dependencias"
        exit 1
    fi
else
    echo "✅ Dependencias ya instaladas"
fi
echo ""

# Validar proyecto
echo "🔍 Validando estado del proyecto..."
if ./validate-project.sh > /dev/null 2>&1; then
    echo "✅ Proyecto validado correctamente"
else
    echo "⚠️  ADVERTENCIA: El proyecto tiene problemas"
    echo "   Ejecuta: ./validate-project.sh para ver los detalles"
fi
echo ""

# Crear primer backup
echo "💾 Creando primer backup..."
if ./backup-project.sh > /dev/null 2>&1; then
    echo "✅ Primer backup creado"
else
    echo "⚠️  ADVERTENCIA: No se pudo crear el primer backup"
fi
echo ""

# Mostrar resumen
echo "═══════════════════════════════════════"
echo "✅✅✅ CONFIGURACIÓN COMPLETADA ✅✅✅"
echo "═══════════════════════════════════════"
echo ""
echo "📋 Scripts disponibles:"
echo "   • ./validate-project.sh    - Validar proyecto"
echo "   • ./backup-project.sh      - Crear backup"
echo "   • ./check-integrity.sh     - Verificar integridad"
echo "   • ./restore-backup.sh      - Restaurar desde backup"
echo "   • ./setup-prevention.sh    - Este script (configuración)"
echo ""
echo "🪝 Hook de Git:"
if [ -f ".git/hooks/pre-commit" ]; then
    echo "   ✅ Instalado y activo"
    echo "   Se ejecutará automáticamente antes de cada commit"
else
    echo "   ⚠️  No instalado"
    echo "   Inicializa Git primero: git init"
fi
echo ""
echo "📂 Backups:"
BACKUP_COUNT=$(ls -1 backups/control-asistencia-backup-*.zip 2>/dev/null | wc -l)
echo "   $BACKUP_COUNT backup(s) disponible(s)"
echo "   Ubicación: backups/"
echo ""
echo "📚 Documentación:"
echo "   • GUIA_PREVENCION.md       - Guía completa de prevención"
echo "   • DIAGNOSTICO_PROYECTO.md  - Análisis del daño anterior"
echo "   • CHECKPOINT_FINAL.md      - Estado actual del proyecto"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Leer GUIA_PREVENCION.md"
echo "   2. Ejecutar: ./validate-project.sh"
echo "   3. Ejecutar: ./check-integrity.sh"
echo "   4. Iniciar desarrollo: npm run dev"
echo ""
echo "💡 Consejo: Ejecuta ./backup-project.sh antes de cambios importantes"
echo ""
exit 0
