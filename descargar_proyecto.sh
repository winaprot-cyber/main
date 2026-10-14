#!/bin/bash

# Script para descargar todos los archivos del proyecto en un ZIP
# Control de Asistencia - Hugo Leon
# Versión 1.4.9

echo "=========================================="
echo "  DESCARGA COMPLETA DEL PROYECTO"
echo "  Control de Asistencia HL v1.4.9"
echo "=========================================="
echo ""

# Obtener fecha actual
FECHA=$(date +%Y-%m-%d_%H-%M-%S)
NOMBRE_ZIP="control-asistencia-hl-completo-${FECHA}.zip"

echo "📦 Empaquetando todos los archivos del proyecto..."
echo ""

# Crear lista de archivos a incluir
ARCHIVOS=(
    # Archivos de configuración
    "index.html"
    "package.json"
    "package-lock.json"
    "tsconfig.json"
    "vite.config.js"
    ".gitignore"
    
    # Archivos de código fuente
    "src/main.tsx"
    "src/App.tsx"
    "src/index.css"
    "src/types.ts"
    
    # Componentes
    "src/components/BalancePersonal.tsx"
    "src/components/ContactInfo.tsx"
    "src/components/DecimoCuarto.tsx"
    "src/components/FinancialManager.tsx"
    "src/components/HolidayManager.tsx"
    "src/components/MonthlyChart.tsx"
    "src/components/OptionsMenu.tsx"
    "src/components/ProjectionPanel.tsx"
    "src/components/ProjectionPay.tsx"
    "src/components/RecordForm.tsx"
    "src/components/RecordList.tsx"
    "src/components/Summary.tsx"
    "src/components/ThemeSelector.tsx"
    "src/components/WeeklyChart.tsx"
    "src/components/WelcomeModal.tsx"
    
    # Hooks
    "src/hooks/useAttendanceStorage.ts"
    
    # Utilidades
    "src/utils/calculations.ts"
    "src/utils/cardGenerator.ts"
    "src/utils/database.ts"
    "src/utils/monthlyBaseCalculator.ts"
    "src/utils/payCalculations.ts"
    "src/utils/photoEncryption.ts"
    
    # Documentación
    "README.md"
    "PROYECTO_COMPLETADO.md"
    "ESTADO_FINAL_PROYECTO.md"
    "GUIA_PREVENCION.md"
    "GUIA_RAPIDA_SUBIR.md"
    "INSTRUCCIONES_SUBIR_REPOSITORIO.md"
    "LISTA_COMPLETA_ARCHIVOS.md"
    "CHECKPOINT_FINAL.md"
    "DIAGNOSTICO_PROYECTO.md"
    
    # Scripts
    "backup.sh"
    "restore_backup.sh"
    "verify_integrity.sh"
    "quick_test.sh"
    "emergency_recovery.sh"
)

# Contador de archivos
TOTAL_ARCHIVOS=${#ARCHIVOS[@]}
ARCHIVOS_ENCONTRADOS=0

# Crear archivo temporal con la lista
LISTA_TEMP=$(mktemp)

for archivo in "${ARCHIVOS[@]}"; do
    if [ -f "$archivo" ]; then
        echo "$archivo" >> "$LISTA_TEMP"
        ARCHIVOS_ENCONTRADOS=$((ARCHIVOS_ENCONTRADOS + 1))
        echo "  ✅ $archivo"
    else
        echo "  ⚠️  $archivo (no encontrado)"
    fi
done

echo ""
echo "📊 Resumen:"
echo "   Archivos encontrados: $ARCHIVOS_ENCONTRADOS / $TOTAL_ARCHIVOS"
echo ""

if [ $ARCHIVOS_ENCONTRADOS -eq 0 ]; then
    echo "❌ Error: No se encontraron archivos"
    rm "$LISTA_TEMP"
    exit 1
fi

# Crear el ZIP
echo "📦 Creando archivo ZIP: $NOMBRE_ZIP"
zip -r "$NOMBRE_ZIP" -@ < "$LISTA_TEMP"

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✅ DESCARGA COMPLETADA"
    echo "=========================================="
    echo ""
    echo "📦 Archivo ZIP creado: $NOMBRE_ZIP"
    echo "📏 Tamaño: $(du -h "$NOMBRE_ZIP" | cut -f1)"
    echo "📄 Archivos incluidos: $ARCHIVOS_ENCONTRADOS"
    echo ""
    echo "📋 Para usar el proyecto:"
    echo "   1. Descomprimir: unzip $NOMBRE_ZIP"
    echo "   2. Instalar dependencias: npm install"
    echo "   3. Ejecutar: npm run dev"
    echo "   4. Abrir: http://localhost:5173"
    echo ""
    echo "=========================================="
else
    echo ""
    echo "❌ Error al crear el archivo ZIP"
fi

# Limpiar archivo temporal
rm "$LISTA_TEMP"
