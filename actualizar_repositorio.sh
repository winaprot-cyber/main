#!/bin/bash

# Script de Actualización del Repositorio
# Control de Asistencia HL - Versión 1.4.9
# Creador by Hugo Leon

echo "=========================================="
echo "  ACTUALIZACIÓN DEL REPOSITORIO"
echo "  Control de Asistencia HL v1.4.9"
echo "=========================================="
echo ""

# Verificar si estamos en un repositorio git
if [ ! -d .git ]; then
    echo "❌ Error: No se encontró un repositorio git"
    echo "   Inicializa el repositorio con: git init"
    exit 1
fi

echo "📋 Paso 1: Verificar cambios..."
git status
echo ""

echo "📝 Paso 2: Agregar todos los cambios..."
git add .
echo ""

echo "📊 Paso 3: Verificar archivos a commitear..."
git status
echo ""

read -p "¿Deseas continuar con el commit? (s/n): " continuar
if [ "$continuar" != "s" ]; then
    echo "❌ Operación cancelada"
    exit 0
fi

echo ""
echo "💾 Paso 4: Crear commit..."
read -p "Mensaje del commit (por defecto: 'Actualización v1.4.9 - Balance y Finanzas completas'): " mensaje
if [ -z "$mensaje" ]; then
    mensaje="Actualización v1.4.9 - Balance y Finanzas completas"
fi
git commit -m "$mensaje"
echo ""

echo "🚀 Paso 5: Push al repositorio remoto..."
read -p "¿Deseas hacer push ahora? (s/n): " hacer_push
if [ "$hacer_push" = "s" ]; then
    read -p "Nombre de la rama (por defecto: main): " rama
    if [ -z "$rama" ]; then
        rama="main"
    fi
    git push origin "$rama"
    echo ""
    echo "✅ ¡Push completado exitosamente!"
else
    echo "⏸️  Push omitido. Puedes hacerlo manualmente con: git push origin main"
fi

echo ""
echo "=========================================="
echo "  ✅ ACTUALIZACIÓN COMPLETADA"
echo "=========================================="
echo ""
echo "📊 Resumen:"
echo "   - Cambios agregados al staging"
echo "   - Commit creado: $mensaje"
if [ "$hacer_push" = "s" ]; then
    echo "   - Push realizado a la rama: $rama"
fi
echo ""
echo "🔗 Próximos pasos:"
echo "   1. Verifica tu repositorio en GitHub/GitLab"
echo "   2. Si es necesario, crea un Pull Request"
echo "   3. Actualiza la documentación si es necesario"
echo ""
echo "📞 Soporte:"
echo "   Programador: Hugo Leon"
echo "   Versión: 1.4.9"
echo ""
