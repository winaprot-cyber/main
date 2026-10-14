#!/bin/bash

# Script de Prueba Rápida
# Control de Asistencia - Hugo Leon

echo "=========================================="
echo "  PRUEBA RÁPIDA DEL PROYECTO"
echo "  Control de Asistencia HL v1.4.9"
echo "=========================================="
echo ""

# 1. Verificar que Node.js está instalado
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js no está instalado"
  echo "   Instalar desde: https://nodejs.org/"
  exit 1
fi
echo "  ✅ Node.js $(node --version)"

# 2. Verificar dependencias
echo ""
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
  echo "  ⚠️  node_modules no existe"
  echo "  📦 Instalando dependencias..."
  npm install
fi
echo "  ✅ Dependencias instaladas"

# 3. Verificar archivos críticos
echo ""
echo "🔍 Verificando archivos críticos..."
./verify_integrity.sh
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Verificación de integridad falló"
  echo "   Restaurar desde backup: ./restore_backup.sh <TIMESTAMP>"
  exit 1
fi

# 4. Build
echo ""
echo "📦 Ejecutando build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✅ Build exitoso"
  
  # Verificar tamaño del bundle
  js_size=$(du -k dist/assets/*.js 2>/dev/null | cut -f1)
  if [ -n "$js_size" ] && [ $js_size -gt 500 ]; then
    echo "  ✅ Bundle JS: ${js_size}KB"
  else
    echo "  ⚠️  Bundle JS muy pequeño: ${js_size}KB"
    echo "     Esto puede indicar problemas"
  fi
else
  echo "  ❌ Build falló"
  echo "     Ejecutar: npm run build"
  exit 1
fi

# 5. Verificar que el servidor puede iniciarse
echo ""
echo "🚀 Verificando servidor de desarrollo..."
timeout 5 npm run dev > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3

if kill -0 $SERVER_PID 2>/dev/null; then
  echo "  ✅ Servidor iniciado correctamente"
  kill $SERVER_PID 2>/dev/null
else
  echo "  ❌ Servidor no pudo iniciarse"
  exit 1
fi

# 6. Resumen
echo ""
echo "=========================================="
echo "  ✅ TODAS LAS PRUEBAS PASARON"
echo "=========================================="
echo ""
echo "📊 Resumen:"
echo "   - Node.js: ✅"
echo "   - Dependencias: ✅"
echo "   - Archivos críticos: ✅"
echo "   - Build: ✅"
echo "   - Servidor: ✅"
echo ""
echo "🚀 Para ejecutar el proyecto:"
echo "   npm run dev"
echo ""
echo "📱 Abrir en navegador:"
echo "   http://localhost:5173"
echo ""
echo "🧪 Pruebas manuales recomendadas:"
echo "   1. Verificar que las 7 pestañas funcionen"
echo "   2. Registrar asistencia de prueba"
echo "   3. Verificar cálculo de pago"
echo "   4. Agregar gasto/deuda de prueba"
echo "   5. Generar ficha elegante"
echo "   6. Probar exportación/importación"
echo ""
echo "=========================================="
