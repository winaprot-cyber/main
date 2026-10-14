#!/bin/bash

# Script de Monitoreo Automático del Proyecto
# Control de Asistencia HL - v1.4.9
# Creador by Hugo Leon

# Configuración
CHECK_INTERVAL=300  # 5 minutos en segundos
LOG_FILE="monitor.log"
ALERT_EMAIL=""  # Opcional: configurar email para alertas

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Función de verificación
check_project() {
    log "🔍 Iniciando verificación..."
    
    # Verificar App.tsx
    if [ -f "src/App.tsx" ]; then
        LINES=$(wc -l < src/App.tsx)
        if [ "$LINES" -lt 100 ]; then
            log "❌ ALERTA: App.tsx tiene solo $LINES líneas"
            return 1
        fi
    else
        log "❌ ALERTA: App.tsx no existe"
        return 1
    fi
    
    # Verificar build
    if ! npm run build > /dev/null 2>&1; then
        log "❌ ALERTA: Build falló"
        return 1
    fi
    
    # Verificar componentes críticos
    CRITICAL_COMPONENTS=(
        "src/components/BalancePersonal.tsx"
        "src/components/FinancialManager.tsx"
        "src/components/ProjectionPay.tsx"
    )
    
    for component in "${CRITICAL_COMPONENTS[@]}"; do
        if [ ! -f "$component" ]; then
            log "❌ ALERTA: $component no existe"
            return 1
        fi
    done
    
    log "✅ Verificación exitosa"
    return 0
}

# Función de alerta
send_alert() {
    local message="$1"
    log "🚨 ALERTA: $message"
    
    # Si hay email configurado, enviar notificación
    if [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "Alerta: Control de Asistencia HL" "$ALERT_EMAIL" 2>/dev/null
    fi
    
    # Hacer backup automático
    log "🔄 Creando backup automático..."
    ./backup.sh > /dev/null 2>&1
}

# Función principal
main() {
    log "🚀 Iniciando monitoreo automático..."
    log "📊 Intervalo de verificación: ${CHECK_INTERVAL}s"
    log "📝 Log file: $LOG_FILE"
    echo ""
    
    while true; do
        if ! check_project; then
            send_alert "Proyecto dañado detectado"
            
            # Intentar restaurar automáticamente
            log "🔄 Intentando restauración automática..."
            if ./restore.sh > /dev/null 2>&1; then
                log "✅ Restauración exitosa"
            else
                log "❌ Restauración falló - intervención manual requerida"
            fi
        fi
        
        # Esperar antes de la próxima verificación
        sleep $CHECK_INTERVAL
    done
}

# Manejo de señales
trap 'log "🛑 Monitoreo detenido"; exit 0' SIGINT SIGTERM

# Ejecutar
main
