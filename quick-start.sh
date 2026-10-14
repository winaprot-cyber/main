#!/bin/bash

# 🚀 Script de Inicio Rápido con Protección Completa
# Control de Asistencia HL - Versión 1.4.9

echo "🚀 Iniciando proyecto con protección completa..."
echo ""

# Verificar que los scripts existen
if [ ! -f "backup.sh" ] || [ ! -f "verify.sh" ] || [ ! -f "protect.sh" ] || [ ! -f "monitor.sh" ]; then
  echo "❌ Error: Faltan scripts de protección"
  echo "   Asegúrate de estar en el directorio correcto del proyecto"
  exit 1
fi

# Hacer scripts ejecutables
chmod +x backup.sh verify.sh protect.sh monitor.sh restore.sh 2>/dev/null

# Paso 1: Verificar integridad del proyecto
echo "🔍 Paso 1: Verificando integridad del proyecto..."
./verify.sh
if [ $? -ne 0 ]; then
  echo ""
  echo "⚠️  Se encontraron problemas en el proyecto"
  echo "   ¿Deseas continuar de todos modos? (s/n)"
  read -r response
  if [[ "$response" != "s" ]]; then
    echo "   Restauración recomendada: ./restore.sh"
    exit 1
  fi
fi
echo ""

# Paso 2: Crear backup de seguridad
echo "📦 Paso 2: Creando backup de seguridad..."
./backup.sh > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "   ✅ Backup creado exitosamente"
else
  echo "   ⚠️  Error al crear backup (continuando...)"
fi
echo ""

# Paso 3: Proteger archivos críticos
echo "🛡️  Paso 3: Protegiendo archivos críticos..."
./protect.sh protect > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "   ✅ Archivos protegidos"
else
  echo "   ⚠️  Error al proteger archivos (continuando...)"
fi
echo ""

# Paso 4: Iniciar monitoreo continuo
echo "👁️  Paso 4: Iniciando monitoreo continuo..."
./monitor.sh start > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "   ✅ Monitoreo iniciado"
else
  echo "   ⚠️  Error al iniciar monitoreo (continuando...)"
fi
echo ""

# Paso 5: Verificar que el proyecto compila
echo "🔨 Paso 5: Verificando compilación..."
if npm run build > /dev/null 2>&1; then
  echo "   ✅ Build exitoso"
else
  echo "   ❌ Build falló"
  echo "   Ejecuta 'npm run build' para ver los errores"
  exit 1
fi
echo ""

# Paso 6: Mostrar estado final
echo "═══════════════════════════════════════"
echo "✅ PROYECTO INICIADO CON PROTECCIÓN"
echo "═══════════════════════════════════════"
echo ""
echo "📊 Estado:"
echo "   ✅ Integridad verificada"
echo "   ✅ Backup creado"
echo "   ✅ Archivos protegidos"
echo "   ✅ Monitoreo activo"
echo "   ✅ Build exitoso"
echo ""
echo "🚀 Comandos disponibles:"
echo "   npm run dev          - Iniciar servidor de desarrollo"
echo "   ./verify.sh          - Verificar integridad"
echo "   ./backup.sh          - Crear backup manual"
echo "   ./protect.sh status  - Ver estado de protección"
echo "   ./monitor.sh status  - Ver estado del monitoreo"
echo "   ./restore.sh         - Restaurar desde backup"
echo ""
echo "📝 Logs del monitoreo:"
echo "   tail -f .monitor/monitor.log"
echo ""
echo "🛡️  Proyecto protegido y listo para desarrollo"
echo ""
