#!/bin/bash

# Script para listar y acceder al código completo del proyecto
# Control de Asistencia - Creador by Hugo Leon
# Versión 1.4.9

echo "=========================================="
echo "  CONTROL DE ASISTENCIA - CÓDIGO COMPLETO"
echo "  Creador by Hugo Leon"
echo "  Versión 1.4.9"
echo "=========================================="
echo ""

echo "📁 ESTRUCTURA DEL PROYECTO:"
echo ""

# Listar archivos principales
echo "📄 Archivos de Configuración:"
ls -1 *.json *.ts *.js *.html 2>/dev/null | sed 's/^/  ├── /'
echo ""

# Listar src
echo "📁 src/"
if [ -d "src" ]; then
  ls -1 src/*.tsx src/*.ts src/*.css 2>/dev/null | sed 's/^/  ├── /'
  echo ""
  
  echo "  📁 components/"
  if [ -d "src/components" ]; then
    ls -1 src/components/*.tsx 2>/dev/null | sed 's/^/    ├── /'
  fi
  echo ""
  
  echo "  📁 hooks/"
  if [ -d "src/hooks" ]; then
    ls -1 src/hooks/*.ts 2>/dev/null | sed 's/^/    ├── /'
  fi
  echo ""
  
  echo "  📁 utils/"
  if [ -d "src/utils" ]; then
    ls -1 src/utils/*.ts 2>/dev/null | sed 's/^/    ├── /'
  fi
  echo ""
fi

# Listar public
echo "📁 public/"
if [ -d "public" ]; then
  ls -1 public/* 2>/dev/null | sed 's/^/  ├── /'
fi
echo ""

# Listar documentación
echo "📄 Documentación:"
ls -1 *.md 2>/dev/null | sed 's/^/  ├── /'
echo ""

echo "=========================================="
echo "  ESTADÍSTICAS DEL PROYECTO"
echo "=========================================="
echo ""

# Contar archivos
TOTAL_FILES=$(find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.html" -o -name "*.json" | wc -l)
COMPONENTS=$(find src/components -type f -name "*.tsx" 2>/dev/null | wc -l)
UTILS=$(find src/utils -type f -name "*.ts" 2>/dev/null | wc -l)
DOCS=$(ls -1 *.md 2>/dev/null | wc -l)

echo "📊 Total de archivos de código: $TOTAL_FILES"
echo "📦 Componentes React: $COMPONENTS"
echo "🔧 Utilidades: $UTILS"
echo "📚 Documentos: $DOCS"
echo ""

# Contar líneas de código
if command -v wc &> /dev/null; then
  TOTAL_LINES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} + 2>/dev/null | tail -n 1 | awk '{print $1}')
  echo "📝 Total de líneas de código: $TOTAL_LINES"
fi
echo ""

echo "=========================================="
echo "  CÓMO ACCEDER AL CÓDIGO"
echo "=========================================="
echo ""
echo "1️⃣  Ver archivos individuales:"
echo "   cat src/App.tsx"
echo "   cat src/components/BalancePersonal.tsx"
echo ""
echo "2️⃣  Ver todos los componentes:"
echo "   ls -la src/components/"
echo ""
echo "3️⃣  Ver todas las utilidades:"
echo "   ls -la src/utils/"
echo ""
echo "4️⃣  Crear archivo ZIP del proyecto:"
echo "   zip -r control-asistencia-hl.zip . -x 'node_modules/*' 'dist/*'"
echo ""
echo "5️⃣  Ejecutar el proyecto:"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "6️⃣  Build de producción:"
echo "   npm run build"
echo ""

echo "=========================================="
echo "  ARCHIVOS PRINCIPALES"
echo "=========================================="
echo ""
echo "📄 Configuración:"
echo "  ├── index.html"
echo "  ├── package.json"
echo "  ├── tsconfig.json"
echo "  ├── vite.config.ts"
echo "  └── tailwind.config.js"
echo ""
echo "📁 Código Fuente:"
echo "  ├── src/main.tsx"
echo "  ├── src/App.tsx"
echo "  ├── src/index.css"
echo "  └── src/types.ts"
echo ""
echo "📦 Componentes ($COMPONENTS archivos):"
find src/components -type f -name "*.tsx" 2>/dev/null | sort | sed 's/^/  ├── /'
echo ""
echo "🔧 Utilidades ($UTILS archivos):"
find src/utils -type f -name "*.ts" 2>/dev/null | sort | sed 's/^/  ├── /'
echo ""
echo "🪝 Hooks:"
find src/hooks -type f -name "*.ts" 2>/dev/null | sort | sed 's/^/  ├── /'
echo ""

echo "=========================================="
echo "  DOCUMENTACIÓN COMPLETA"
echo "=========================================="
echo ""
echo "📚 Documentos disponibles ($DOCS archivos):"
ls -1 *.md 2>/dev/null | sed 's/^/  ├── /'
echo ""

echo "=========================================="
echo "  FUNCIONALIDADES IMPLEMENTADAS"
echo "=========================================="
echo ""
echo "✅ Registro de asistencia con fotos"
echo "✅ Cálculo automático de horas"
echo "✅ Gestión de días feriados"
echo "✅ Cálculo de pagos con horas extras"
echo "✅ Bonos (fijos, variables, fondo de reserva)"
echo "✅ Descuentos (préstamos, IESS, etc.)"
echo "✅ Préstamos quirúrgicos con interés"
echo "✅ Cálculo de 14to sueldo"
echo "✅ Balance personal completo"
echo "✅ Gestión de deudas y gastos"
echo "✅ Pagos parciales con fotos de respaldo"
echo "✅ Fichas visuales elegantes con sello"
echo "✅ Comprobantes de pago automáticos"
echo "✅ Compartir por WhatsApp"
echo "✅ Exportación/importación completa"
echo "✅ Modo offline completo"
echo "✅ Temas personalizables"
echo "✅ Alertas de actualización mensual"
echo "✅ Historial de balances mensuales"
echo "✅ Auto-renovación de gastos"
echo ""

echo "=========================================="
echo "  Creador by Hugo Leon"
echo "  Versión 1.4.9"
echo "  Estado: ✅ PROYECTO COMPLETO"
echo "=========================================="
