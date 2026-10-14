# 🛡️ GUÍA COMPLETA DE PREVENCIÓN
## Control de Asistencia HL - Versión 1.4.9

**Fecha:** 2026-01-15  
**Creador by Hugo Leon**

---

## 📋 ÍNDICE

1. [¿Por Qué se Dañó el Proyecto?](#por-qué-se-dañó-el-proyecto)
2. [Sistema de Protección Implementado](#sistema-de-protección-implementado)
3. [Cómo Usar los Scripts de Prevención](#cómo-usar-los-scripts-de-prevención)
4. [Mejores Prácticas](#mejores-prácticas)
5. [Recuperación ante Daños](#recuperación-ante-daños)
6. [Monitoreo Continuo](#monitoreo-continuo)

---

## 🔍 ¿POR QUÉ SE DAÑÓ EL PROYECTO?

### Causa Principal
El archivo `src/App.tsx` quedó completamente vacío (solo 6 líneas con `<div/>`), eliminando toda la funcionalidad de la aplicación.

### Posibles Razones
1. **Edición accidental** durante cambios masivos
2. **Error en script** de automatización
3. **Conflicto de merge** en Git mal resuelto
4. **Error humano** al copiar/pegar código
5. **Herramienta de edición** que sobrescribió contenido

### ¿Por Qué No se Detectó?
- ✅ El build pasaba exitosamente (sintaxis válida)
- ❌ No había tests automatizados
- ❌ No había verificación de integridad
- ❌ No había monitoreo continuo
- ❌ Solo se detectó al intentar usar la app

---

## 🛡️ SISTEMA DE PROTECCIÓN IMPLEMENTADO

He creado un sistema completo de 4 scripts que trabajan juntos:

### 1. `backup.sh` - Sistema de Backups Automáticos
**Función:** Crea copias de seguridad completas del proyecto  
**Características:**
- ✅ Backups con timestamp
- ✅ Mantiene últimos 10 backups
- ✅ Incluye todos los archivos críticos
- ✅ Metadata completa

**Uso:**
```bash
./backup.sh
```

### 2. `restore.sh` - Sistema de Restauración
**Función:** Restaura el proyecto desde un backup  
**Características:**
- ✅ Lista backups disponibles
- ✅ Crea backup de seguridad antes de restaurar
- ✅ Restaura todos los archivos
- ✅ Verificación post-restauración

**Uso:**
```bash
./restore.sh 20260115_143022
```

### 3. `verify.sh` - Sistema de Verificación
**Función:** Verifica la integridad del proyecto  
**Características:**
- ✅ Verifica archivos críticos
- ✅ Verifica número mínimo de líneas
- ✅ Verifica que el build funcione
- ✅ Reporte detallado de errores

**Uso:**
```bash
./verify.sh
```

### 4. `protect.sh` - Sistema de Protección
**Función:** Protege archivos críticos contra cambios  
**Características:**
- ✅ Crea copias protegidas de solo lectura
- ✅ Verifica integridad
- ✅ Restaura desde protección
- ✅ Estado de protección

**Uso:**
```bash
./protect.sh protect   # Proteger archivos
./protect.sh verify    # Verificar integridad
./protect.sh restore   # Restaurar desde protección
./protect.sh status    # Ver estado
```

### 5. `monitor.sh` - Sistema de Monitoreo Continuo
**Función:** Monitorea el proyecto continuamente  
**Características:**
- ✅ Verificación cada 5 minutos
- ✅ Backups automáticos ante cambios
- ✅ Detección de archivos faltantes
- ✅ Logs detallados
- ✅ Modo background

**Uso:**
```bash
./monitor.sh start     # Iniciar monitoreo
./monitor.sh stop      # Detener monitoreo
./monitor.sh status    # Ver estado
./monitor.sh check     # Verificación manual
```

---

## 📖 CÓMO USAR LOS SCRIPTS DE PREVENCIÓN

### Flujo de Trabajo Recomendado

#### 1. Antes de Hacer Cambios Importantes
```bash
# Crear backup manual
./backup.sh

# Proteger archivos críticos
./protect.sh protect

# Verificar estado actual
./verify.sh
```

#### 2. Durante el Desarrollo
```bash
# Iniciar monitoreo continuo
./monitor.sh start

# Verificar estado periódicamente
./monitor.sh status

# Ver logs
tail -f .monitor/monitor.log
```

#### 3. Después de Hacer Cambios
```bash
# Verificar integridad
./verify.sh

# Si todo está bien, crear backup
./backup.sh
```

#### 4. Si Algo Sale Mal
```bash
# Verificar qué pasó
./verify.sh

# Ver estado de protección
./protect.sh status

# Restaurar desde protección
./protect.sh restore

# O restaurar desde backup
./restore.sh [TIMESTAMP]
```

### Comandos Rápidos

**Backup rápido:**
```bash
./backup.sh && echo "✅ Backup creado"
```

**Verificación rápida:**
```bash
./verify.sh && echo "✅ Todo OK" || echo "❌ Problemas detectados"
```

**Protección completa:**
```bash
./protect.sh protect && ./verify.sh && echo "✅ Protegido y verificado"
```

**Monitoreo en background:**
```bash
./monitor.sh start && echo "✅ Monitoreo iniciado"
```

---

## 🎯 MEJORES PRÁCTICAS

### 1. Control de Versiones con Git

**Configuración inicial:**
```bash
git init
git add .
git commit -m "✅ Versión inicial completa"
```

**Flujo de trabajo:**
```bash
# Antes de cambios importantes
git add .
git commit -m "🛡️ Backup antes de cambios"

# Hacer cambios
# ... editar archivos ...

# Verificar que todo funciona
npm run build
npm run dev

# Si todo está bien
git add .
git commit -m "✅ Cambios completados"

# Si algo salió mal
git checkout .
```

**Branches para funcionalidades:**
```bash
# Crear branch para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commits
git add .
git commit -m "✨ Nueva funcionalidad"

# Volver a main
git checkout main

# Merge si todo está bien
git merge feature/nueva-funcionalidad
```

### 2. Backups Regulares

**Automáticos (con monitor.sh):**
```bash
./monitor.sh start
# Crea backups cada 5 minutos si hay cambios
```

**Manuales (antes de cambios importantes):**
```bash
./backup.sh
```

**Programados (con cron):**
```bash
# Editar crontab
crontab -e

# Agregar backup cada hora
0 * * * * /ruta/al/proyecto/backup.sh

# Agregar backup diario a las 2 AM
0 2 * * * /ruta/al/proyecto/backup.sh
```

### 3. Verificación de Integridad

**Antes de cada commit:**
```bash
./verify.sh
```

**Después de cada cambio importante:**
```bash
./verify.sh
```

**Automatizado con Git hooks:**
```bash
# Crear hook de pre-commit
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
./verify.sh
if [ $? -ne 0 ]; then
  echo "❌ Verificación falló. Commit cancelado."
  exit 1
fi
EOF

chmod +x .git/hooks/pre-commit
```

### 4. Protección de Archivos Críticos

**Archivos que SIEMPRE deben protegerse:**
- `src/App.tsx` - Componente principal
- `src/main.tsx` - Punto de entrada
- `src/types.ts` - Definiciones de tipos
- `src/hooks/useAttendanceStorage.ts` - Hook principal
- `src/components/BalancePersonal.tsx` - Componente crítico
- `src/components/FinancialManager.tsx` - Componente crítico
- `src/components/ProjectionPay.tsx` - Componente crítico

**Protección automática:**
```bash
# Proteger todos los archivos críticos
./protect.sh protect

# Verificar antes de cada cambio
./protect.sh verify
```

### 5. Testing Manual

**Después de cada cambio:**
```bash
# 1. Build exitoso
npm run build

# 2. Servidor de desarrollo
npm run dev

# 3. Verificar en navegador
# Abrir http://localhost:5173

# 4. Probar funcionalidades críticas
# - Registro de asistencia
# - Cálculo de pagos
# - Balance personal
# - Exportación/importación
```

**Checklist de verificación:**
- [ ] Build exitoso sin errores
- [ ] Servidor inicia sin problemas
- [ ] Página carga correctamente
- [ ] Todas las pestañas funcionan
- [ ] Datos se guardan en localStorage
- [ ] Exportación funciona
- [ ] Importación funciona

### 6. Documentación de Cambios

**Mantener un CHANGELOG:**
```markdown
# CHANGELOG.md

## [1.4.9] - 2026-01-15

### Fixed
- Corregido archivo App.tsx vacío
- Restauradas todas las funcionalidades

### Added
- Sistema de backups automáticos
- Sistema de verificación de integridad
- Sistema de protección de archivos
- Sistema de monitoreo continuo

### Security
- Protección de archivos críticos
- Backups automáticos cada 5 minutos
```

**Comentarios en el código:**
```typescript
// ⚠️ ARCHIVO CRÍTICO - NO MODIFICAR SIN BACKUP
// Última modificación: 2026-01-15
// Backup en: .protected/App.tsx.protected
export default function App() {
  // ...
}
```

---

## 🚨 RECUPERACIÓN ANTE DAÑOS

### Escenario 1: Archivo Vacío o Dañado

**Síntomas:**
- Aplicación no carga
- Pantalla en blanco
- Build exitoso pero sin funcionalidad

**Diagnóstico:**
```bash
# Verificar integridad
./verify.sh

# Ver estado de protección
./protect.sh status
```

**Recuperación:**
```bash
# Opción 1: Restaurar desde protección
./protect.sh restore

# Opción 2: Restaurar desde backup
./restore.sh [TIMESTAMP]

# Opción 3: Restaurar desde Git
git checkout src/App.tsx
```

### Escenario 2: Múltiples Archivos Faltantes

**Síntomas:**
- Errores de compilación
- Imports fallidos
- Componentes no encontrados

**Diagnóstico:**
```bash
# Verificar todos los archivos
./verify.sh

# Ver qué archivos faltan
find src -name "*.tsx" -o -name "*.ts" | wc -l
```

**Recuperación:**
```bash
# Restaurar todo desde backup
./restore.sh [TIMESTAMP]

# O restaurar desde Git
git checkout .
```

### Escenario 3: Build Falla

**Síntomas:**
- Errores de TypeScript
- Imports incorrectos
- Tipos faltantes

**Diagnóstico:**
```bash
# Ver errores detallados
npm run build

# Verificar tipos
npx tsc --noEmit
```

**Recuperación:**
```bash
# Restaurar archivos de tipos
./restore.sh [TIMESTAMP]

# O corregir manualmente
# Editar los archivos con errores
```

### Escenario 4: Datos Perdidos en localStorage

**Síntomas:**
- Aplicación funciona pero sin datos
- Registros desaparecidos
- Configuración perdida

**Recuperación:**
```bash
# Importar desde backup JSON
# Usar la función de importación en la app
# Menú de 3 puntos → Importar Base de Datos
```

**Prevención:**
```bash
# Exportar datos regularmente
# Menú de 3 puntos → Exportar Base de Datos
```

---

## 👁️ MONITOREO CONTINUO

### Configuración del Monitoreo

**Iniciar monitoreo:**
```bash
./monitor.sh start
```

**Ver estado:**
```bash
./monitor.sh status
```

**Ver logs en tiempo real:**
```bash
tail -f .monitor/monitor.log
```

**Detener monitoreo:**
```bash
./monitor.sh stop
```

### Qué Monitorea

1. **Integridad de archivos críticos**
   - Verifica que existan
   - Verifica que tengan contenido mínimo
   - Verifica que no estén vacíos

2. **Cambios en archivos**
   - Detecta modificaciones
   - Crea backups automáticos
   - Registra en logs

3. **Estado del build**
   - Verifica que compile
   - Verifica tamaño del bundle
   - Detecta builds sospechosos

4. **Backups automáticos**
   - Crea backups cada 5 minutos si hay cambios
   - Mantiene últimos 20 backups
   - Limpia backups antiguos

### Alertas y Notificaciones

**En el log:**
```
[2026-01-15 14:30:22] ✅ Backup automático creado: 20260115_143022
[2026-01-15 14:35:22] 🔄 Cambios detectados en archivos críticos
[2026-01-15 14:40:22] ⚠️  ADVERTENCIA: src/App.tsx parece incompleto (6 líneas)
[2026-01-15 14:45:22] ❌ CRÍTICO: Build falló
```

**Ver alertas recientes:**
```bash
grep "❌\|⚠️" .monitor/monitor.log | tail -n 10
```

### Configuración Avanzada

**Editar intervalo de verificación:**
```bash
# Editar monitor.sh
CHECK_INTERVAL=300  # Cambiar a 60 para 1 minuto
```

**Editar máximo de backups:**
```bash
# Editar monitor.sh
MAX_BACKUPS=20  # Cambiar a 50 para más backups
```

**Agregar más archivos críticos:**
```bash
# Editar protect.sh
CRITICAL_FILES=(
  "src/App.tsx"
  "src/main.tsx"
  # Agregar más archivos aquí
)
```

---

## 📊 RESUMEN DE HERRAMIENTAS

| Herramienta | Propósito | Cuándo Usar |
|-------------|-----------|-------------|
| `backup.sh` | Crear backups | Antes de cambios importantes |
| `restore.sh` | Restaurar backups | Cuando algo sale mal |
| `verify.sh` | Verificar integridad | Después de cambios |
| `protect.sh` | Proteger archivos | Antes de editar archivos críticos |
| `monitor.sh` | Monitoreo continuo | Durante desarrollo activo |

---

## 🎯 FLUJO DE TRABAJO IDEAL

### Desarrollo Normal
```bash
# 1. Iniciar monitoreo
./monitor.sh start

# 2. Proteger archivos críticos
./protect.sh protect

# 3. Hacer cambios
# ... editar código ...

# 4. Verificar
./verify.sh

# 5. Si todo está bien, crear backup
./backup.sh

# 6. Commit a Git
git add .
git commit -m "✅ Cambios completados"
```

### Antes de Cambios Importantes
```bash
# 1. Crear backup manual
./backup.sh

# 2. Proteger archivos
./protect.sh protect

# 3. Verificar estado
./verify.sh

# 4. Crear branch en Git
git checkout -b feature/importante

# 5. Hacer cambios
# ... editar código ...

# 6. Verificar
./verify.sh

# 7. Si todo está bien, merge
git checkout main
git merge feature/importante
```

### Recuperación de Emergencia
```bash
# 1. Verificar qué pasó
./verify.sh

# 2. Ver backups disponibles
ls -la .backups/

# 3. Restaurar desde backup
./restore.sh [TIMESTAMP]

# 4. Verificar restauración
./verify.sh

# 5. Si todo está bien, continuar
npm run dev
```

---

## 💡 CONSEJOS ADICIONALES

### 1. Automatización con Aliases
```bash
# Agregar a ~/.bashrc o ~/.zshrc
alias backup='./backup.sh'
alias restore='./restore.sh'
alias verify='./verify.sh'
alias protect='./protect.sh'
alias monitor='./monitor.sh'

# Alias combinados
alias safe-commit='./verify.sh && ./backup.sh && git add . && git commit'
alias emergency='./restore.sh $(ls -t .backups/ | head -1)'
```

### 2. Script de Inicio Rápido
```bash
#!/bin/bash
# quick-start.sh

echo "🚀 Iniciando proyecto con protección completa..."

# Iniciar monitoreo
./monitor.sh start

# Proteger archivos
./protect.sh protect

# Verificar integridad
./verify.sh

# Iniciar servidor
npm run dev

echo "✅ Proyecto iniciado con protección activa"
```

### 3. Checklist Pre-Commit
```markdown
Antes de cada commit, verificar:
- [ ] ./verify.sh pasa sin errores
- [ ] npm run build es exitoso
- [ ] npm run dev funciona
- [ ] Todas las funcionalidades operan
- [ ] ./backup.sh creado
- [ ] ./protect.sh protect ejecutado
```

### 4. Documentación de Emergencias
```bash
# Crear archivo EMERGENCY.md con instrucciones
cat > EMERGENCY.md << 'EOF'
# 🚨 INSTRUCCIONES DE EMERGENCIA

## Si el proyecto no carga:
1. Ejecutar: ./verify.sh
2. Si hay errores: ./restore.sh [TIMESTAMP]
3. Ver backups: ls -la .backups/

## Si archivos están vacíos:
1. Ejecutar: ./protect.sh restore
2. Verificar: ./verify.sh

## Si todo falla:
1. Restaurar desde Git: git checkout .
2. O restaurar desde backup más reciente
EOF
```

---

## 🎉 CONCLUSIÓN

Con este sistema de prevención completo, puedes:

✅ **Detectar problemas** antes de que causen daños  
✅ **Recuperar rápidamente** desde backups automáticos  
✅ **Proteger archivos críticos** contra cambios accidentales  
✅ **Monitorear continuamente** el estado del proyecto  
✅ **Trabajar con confianza** sabiendo que hay respaldo  

**El proyecto nunca más se dañará sin poder recuperarse.**

---

## 📞 SOPORTE

**Programador:** Hugo Leon  
**Versión:** 1.4.9  
**Fecha:** 2026-01-15

**Para problemas:**
1. Ejecutar `./verify.sh`
2. Revisar logs en `.monitor/monitor.log`
3. Restaurar desde backup si es necesario
4. Contactar al programador si persiste

---

**¡Proyecto protegido y listo para desarrollo seguro!** 🛡️
