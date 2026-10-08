#!/bin/bash

# 👁️ Sistema de Monitoreo Continuo
# Control de Asistencia HL - Versión 1.4.9

# Configuración
CHECK_INTERVAL=300  # 5 minutos en segundos
MAX_BACKUPS=20      # Máximo de backups a mantener
LOG_FILE=".monitor/monitor.log"

# Crear directorio de monitoreo
mkdir -p .monitor

# Función de logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Función para verificar integridad básica
check_integrity() {
  local errors=0
  
  # Verificar archivos críticos
  if [ ! -f "src/App.tsx" ]; then
    log "❌ CRÍTICO: src/App.tsx faltante"
    ((errors++))
  elif [ $(wc -l < "src/App.tsx") -lt 100 ]; then
    log "⚠️  ADVERTENCIA: src/App.tsx parece incompleto ($(wc -l < src/App.tsx) líneas)"
    ((errors++))
  fi
  
  if [ ! -f "src/types.ts" ]; then
    log "❌ CRÍTICO: src/types.ts faltante"
    ((errors++))
  fi
  
  if [ ! -f "src/hooks/useAttendanceStorage.ts" ]; then
    log "❌ CRÍTICO: src/hooks/useAttendanceStorage.ts faltante"
    ((errors++))
  fi
  
  # Verificar que el proyecto compila
  if ! npm run build > /dev/null 2>&1; then
    log "❌ CRÍTICO: Build falló"
    ((errors++))
  fi
  
  return $errors
}

# Función para crear backup automático
auto_backup() {
  local timestamp=$(date +%Y%m%d_%H%M%S)
  local backup_dir=".monitor/backups/backup_$timestamp"
  
  mkdir -p "$backup_dir/src/components"
  mkdir -p "$backup_dir/src/hooks"
  mkdir -p "$backup_dir/src/utils"
  
  # Backup de archivos principales
  cp src/App.tsx "$backup_dir/src/" 2>/dev/null
  cp src/main.tsx "$backup_dir/src/" 2>/dev/null
  cp src/types.ts "$backup_dir/src/" 2>/dev/null
  cp src/index.css "$backup_dir/src/" 2>/dev/null
  
  # Backup de componentes
  for file in src/components/*.tsx; do
    [ -f "$file" ] && cp "$file" "$backup_dir/src/components/"
  done
  
  # Backup de hooks
  for file in src/hooks/*.ts; do
    [ -f "$file" ] && cp "$file" "$backup_dir/src/hooks/"
  done
  
  # Backup de utils
  for file in src/utils/*.ts; do
    [ -f "$file" ] && cp "$file" "$backup_dir/src/utils/"
  done
  
  # Metadata
  cat > "$backup_dir/BACKUP_INFO.txt" << EOF
Backup automático creado: $(date)
Timestamp: $timestamp
Razón: Monitoreo continuo
EOF
  
  log "✅ Backup automático creado: $timestamp"
  
  # Limpiar backups antiguos
  cd .monitor/backups
  local backup_count=$(ls -1 | grep "backup_" | wc -l)
  if [ $backup_count -gt $MAX_BACKUPS ]; then
    ls -1t | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -rf
    log "🗑️  Backups antiguos eliminados (manteniendo últimos $MAX_BACKUPS)"
  fi
  cd ../..
}

# Función para verificar cambios
check_changes() {
  local last_check=".monitor/last_check"
  local current_hash=""
  
  # Calcular hash de archivos críticos
  if [ -f "src/App.tsx" ]; then
    current_hash=$(md5sum src/App.tsx 2>/dev/null || md5 -q src/App.tsx 2>/dev/null)
  fi
  
  # Verificar si hay cambios
  if [ -f "$last_check" ]; then
    local last_hash=$(cat "$last_check")
    if [ "$current_hash" != "$last_hash" ]; then
      log "🔄 Cambios detectados en archivos críticos"
      auto_backup
    fi
  else
    log "📝 Primera ejecución del monitoreo"
    auto_backup
  fi
  
  # Guardar hash actual
  echo "$current_hash" > "$last_check"
}

# Función principal de monitoreo
monitor() {
  log "👁️  Iniciando monitoreo continuo (intervalo: ${CHECK_INTERVAL}s)"
  log "📁 Directorio de monitoreo: .monitor/"
  log "📝 Log file: $LOG_FILE"
  echo ""
  
  while true; do
    # Verificar integridad
    if ! check_integrity; then
      log "⚠️  Problemas de integridad detectados"
      auto_backup
    fi
    
    # Verificar cambios
    check_changes
    
    # Verificar tamaño del build
    if [ -f "dist/assets/index.js" ]; then
      local build_size=$(wc -c < "dist/assets/index.js")
      if [ $build_size -lt 100000 ]; then
        log "⚠️  ADVERTENCIA: Build muy pequeño ($build_size bytes)"
      fi
    fi
    
    # Esperar antes de la siguiente verificación
    sleep $CHECK_INTERVAL
  done
}

# Menú de opciones
case "$1" in
  "start")
    echo "👁️  Iniciando monitoreo en background..."
    nohup ./monitor.sh monitor > .monitor/monitor.out 2>&1 &
    echo $! > .monitor/monitor.pid
    echo "✅ Monitoreo iniciado (PID: $(cat .monitor/monitor.pid))"
    echo ""
    echo "Para ver el log: tail -f .monitor/monitor.log"
    echo "Para detener: ./monitor.sh stop"
    ;;
    
  "stop")
    if [ -f ".monitor/monitor.pid" ]; then
      kill $(cat .monitor/monitor.pid) 2>/dev/null
      rm .monitor/monitor.pid
      echo "✅ Monitoreo detenido"
    else
      echo "⚠️  No hay monitoreo activo"
    fi
    ;;
    
  "status")
    if [ -f ".monitor/monitor.pid" ]; then
      local pid=$(cat .monitor/monitor.pid)
      if ps -p $pid > /dev/null 2>&1; then
        echo "✅ Monitoreo activo (PID: $pid)"
        echo ""
        echo "Últimas 10 líneas del log:"
        tail -n 10 .monitor/monitor.log 2>/dev/null || echo "No hay log disponible"
      else
        echo "❌ Monitoreo inactivo (PID inválido)"
      fi
    else
      echo "❌ Monitoreo no iniciado"
      echo ""
      echo "Para iniciar: ./monitor.sh start"
    fi
    ;;
    
  "check")
    echo "🔍 Verificación manual..."
    echo ""
    check_integrity
    check_changes
    echo ""
    echo "✅ Verificación completada"
    ;;
    
  "monitor")
    monitor
    ;;
    
  *)
    echo "👁️  Sistema de Monitoreo Continuo"
    echo ""
    echo "Uso: ./monitor.sh [COMANDO]"
    echo ""
    echo "Comandos:"
    echo "  start   - Iniciar monitoreo en background"
    echo "  stop    - Detener monitoreo"
    echo "  status  - Ver estado del monitoreo"
    echo "  check   - Verificación manual"
    echo "  monitor - Ejecutar monitoreo en foreground"
    echo ""
    echo "Configuración:"
    echo "  Intervalo de verificación: ${CHECK_INTERVAL}s"
    echo "  Máximo de backups: $MAX_BACKUPS"
    echo "  Directorio de monitoreo: .monitor/"
    ;;
esac
