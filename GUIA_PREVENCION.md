# 🛡️ GUÍA DE PREVENCIÓN - Cómo Evitar que el Proyecto se Dañe

**Fecha:** 2026-01-15  
**Versión:** 1.4.9  
**Estado:** ✅ IMPLEMENTADO

---

## 🎯 OBJETIVO

Esta guía proporciona herramientas y mejores prácticas para prevenir que el proyecto se dañe nuevamente, evitando la pérdida de funcionalidad y tiempo de desarrollo.

---

## 📋 CONTENIDO

1. [Sistema de Backups Automáticos](#sistema-de-backups-automáticos)
2. [Verificación de Integridad](#verificación-de-integridad)
3. [Control de Versiones con Git](#control-de-versiones-con-git)
4. [Mejores Prácticas de Desarrollo](#mejores-prácticas-de-desarrollo)
5. [Tests Manuales](#tests-manuales)
6. [Monitoreo del Build](#monitoreo-del-build)
7. [Recuperación ante Desastres](#recuperación-ante-desastres)

---

## 🔄 SISTEMA DE BACKUPS AUTOMÁTICOS

### Scripts Disponibles

#### 1. backup.sh - Backup Manual
```bash
# Hacer backup antes de cambios importantes
./backup.sh
```

**Qué hace:**
- ✅ Crea carpeta con timestamp
- ✅ Respaldar archivos críticos (App.tsx, componentes, utilidades)
- ✅ Genera metadata del backup
- ✅ Muestra resumen de archivos respaldados

**Cuándo usar:**
- Antes de editar archivos críticos
- Antes de hacer commits importantes
- Antes de actualizar dependencias
- Antes de cambios masivos

#### 2. restore_backup.sh - Restaurar Backup
```bash
# Ver backups disponibles
ls -la backups/

# Restaurar backup específico
./restore_backup.sh 20260115_143022
```

**Qué hace:**
- ✅ Crea backup de seguridad antes de restaurar
- ✅ Restaura todos los archivos
- ✅ Verifica el build
- ✅ Muestra instrucciones para ejecutar

**Cuándo usar:**
- Cuando el proyecto se daña
- Cuando se pierde funcionalidad
- Cuando hay errores críticos

#### 3. verify_integrity.sh - Verificar Integridad
```bash
# Verificar que todos los archivos están correctos
./verify_integrity.sh
```

**Qué hace:**
- ✅ Verifica que todos los archivos existen
- ✅ Verifica que tienen el tamaño mínimo esperado
- ✅ Muestra errores y advertencias
- ✅ Da recomendaciones de acción

**Cuándo usar:**
- Después de hacer cambios
- Antes de hacer commit
- Cuando la aplicación no funciona
- Periódicamente (semanalmente)

### Automatización con Git Hooks

Crear hook pre-commit para hacer backup automático:

```bash
# Crear directorio de hooks
mkdir -p .git/hooks

# Crear archivo de hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "📦 Haciendo backup automático antes del commit..."
./backup.sh
echo "✅ Backup completado"
EOF

# Dar permisos de ejecución
chmod +x .git/hooks/pre-commit
```

---

## 🔍 VERIFICACIÓN DE INTEGRIDAD

### Archivos Críticos a Monitorear

#### 1. Archivo Principal (App.tsx)
- **Mínimo esperado:** 400 líneas
- **Función:** Componente principal con todas las pestañas
- **Verificación:**
  ```bash
  wc -l src/App.tsx
  # Debe mostrar > 400
  ```

#### 2. Componentes Críticos
- **BalancePersonal.tsx:** ~2,500 líneas
- **FinancialManager.tsx:** ~987 líneas
- **ProjectionPay.tsx:** ~700 líneas
- **DecimoCuarto.tsx:** ~200 líneas

#### 3. Utilidades
- **calculations.ts:** ~150 líneas
- **payCalculations.ts:** ~100 líneas
- **database.ts:** ~200 líneas
- **cardGenerator.ts:** ~400 líneas

### Script de Verificación Personalizado

```bash
#!/bin/bash
# check_critical.sh

echo "🔍 Verificando archivos críticos..."

# Verificar App.tsx
lines=$(wc -l < src/App.tsx)
if [ $lines -lt 400 ]; then
  echo "❌ CRÍTICO: App.tsx tiene solo $lines líneas"
  echo "   Ejecutar: ./restore_backup.sh <TIMESTAMP>"
  exit 1
else
  echo "✅ App.tsx: $lines líneas"
fi

# Verificar BalancePersonal.tsx
lines=$(wc -l < src/components/BalancePersonal.tsx)
if [ $lines -lt 2000 ]; then
  echo "❌ CRÍTICO: BalancePersonal.tsx tiene solo $lines líneas"
  exit 1
else
  echo "✅ BalancePersonal.tsx: $lines líneas"
fi

echo "✅ Todos los archivos críticos están correctos"
```

---

## 📝 CONTROL DE VERSIONES CON GIT

### Configuración Inicial

```bash
# Inicializar Git (si no está inicializado)
git init

# Agregar .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
*.log
.DS_Store
backups/
EOF

# Primer commit
git add .
git commit -m "✅ Versión 1.4.9 - Proyecto completo"
```

### Flujo de Trabajo Recomendado

#### 1. Antes de Cambios Importantes
```bash
# Hacer backup
./backup.sh

# Crear rama para cambios
git checkout -b feature/nueva-funcionalidad

# Hacer cambios
# ... editar archivos ...

# Verificar que funciona
npm run dev
# Probar manualmente

# Verificar integridad
./verify_integrity.sh

# Commit
git add .
git commit -m "✨ Nueva funcionalidad: descripción"

# Volver a main
git checkout main
git merge feature/nueva-funcionalidad
```

#### 2. Commits Frecuentes
```bash
# Commit después de cada cambio significativo
git add .
git commit -m "📝 Descripción del cambio"

# Ejemplos de mensajes:
# ✅ "✅ Corrección de cálculos en ProjectionPay"
# 🐛 "🐛 Fix: Error en BalancePersonal"
# 🎨 "🎨 Mejora: UI de FinancialManager"
# 📦 "📦 Refactor: useAttendanceStorage"
```

#### 3. Tags para Versiones
```bash
# Crear tag para versión
git tag -a v1.4.9 -m "Versión 1.4.9 - Proyecto completo"

# Ver tags
git tag

# Volver a tag específico
git checkout v1.4.9
```

### Comandos Útiles

```bash
# Ver historial de cambios
git log --oneline

# Ver cambios en archivo específico
git log --oneline src/App.tsx

# Ver diferencias
git diff src/App.tsx

# Deshacer cambios en archivo
git checkout -- src/App.tsx

# Ver estado
git status

# Ver ramas
git branch -a
```

---

## 💡 MEJORES PRÁCTICAS DE DESARROLLO

### 1. Editar Archivos Críticos con Cuidado

**Antes de editar App.tsx:**
```bash
# 1. Hacer backup
./backup.sh

# 2. Crear rama
git checkout -b fix/app-tsx

# 3. Editar
# ... hacer cambios ...

# 4. Verificar
npm run build
./verify_integrity.sh

# 5. Commit si todo está bien
git add .
git commit -m "🔧 Fix: App.tsx corregido"
```

### 2. No Editar Múltiples Archivos a la Vez

**❌ MAL:**
```bash
# Editar 10 archivos a la vez
# No saber cuál causó el problema
```

**✅ BIEN:**
```bash
# Editar un archivo
# Verificar que funciona
# Commit
# Siguiente archivo
```

### 3. Probar Después de Cada Cambio

```bash
# Después de cada cambio importante
npm run dev
# Abrir navegador
# Probar funcionalidad
# Verificar consola (F12)
```

### 4. Usar Editor con Control de Versiones

**VS Code:**
- ✅ GitLens (ver historial de cada línea)
- ✅ Auto Save (guardar automáticamente)
- ✅ File History (ver versiones anteriores)

**WebStorm/IntelliJ:**
- ✅ Local History (historial local)
- ✅ Git Integration
- ✅ Refactoring Tools

### 5. No Usar "Find and Replace" Masivo

**❌ PELIGROSO:**
```bash
# Reemplazar texto en todos los archivos
# Puede dañar archivos críticos
```

**✅ SEGURO:**
```bash
# Reemplazar texto en archivo específico
# Verificar cambios
# Commit
```

---

## 🧪 TESTS MANUALES

### Checklist de Pruebas Rápidas

Después de cada cambio, verificar:

```bash
# 1. Build exitoso
npm run build
# ✅ Debe completar sin errores

# 2. Servidor de desarrollo
npm run dev
# ✅ Debe iniciar sin errores

# 3. Abrir navegador
# http://localhost:5173
# ✅ Debe cargar la aplicación

# 4. Verificar pestañas
# ✅ Inicio: Muestra resumen semanal
# ✅ Historial: Muestra lista de registros
# ✅ Reportes: Muestra gráficos
# ✅ Pago: Muestra configuración
# ✅ Finanzas: Muestra base de ingreso
# ✅ Balance: Muestra deudas y gastos
# ✅ Décimo: Muestra cálculo

# 5. Verificar funcionalidad crítica
# ✅ Registrar asistencia
# ✅ Ver cálculo de pago
# ✅ Agregar gasto/deuda
# ✅ Generar ficha elegante
```

### Script de Prueba Rápida

```bash
#!/bin/bash
# quick_test.sh

echo "🧪 Iniciando pruebas rápidas..."

# 1. Build
echo "📦 Build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✅ Build exitoso"
else
  echo "  ❌ Build falló"
  exit 1
fi

# 2. Verificar archivos críticos
echo "🔍 Verificando archivos..."
./verify_integrity.sh > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✅ Archivos correctos"
else
  echo "  ❌ Archivos con problemas"
  exit 1
fi

# 3. Verificar tamaño del bundle
echo "📊 Verificando bundle..."
js_size=$(du -k dist/assets/*.js | cut -f1)
if [ $js_size -gt 500 ]; then
  echo "  ✅ Bundle JS: ${js_size}KB"
else
  echo "  ⚠️  Bundle JS muy pequeño: ${js_size}KB"
fi

echo ""
echo "✅ Todas las pruebas rápidas pasaron"
echo ""
echo "🚀 Para prueba completa:"
echo "   npm run dev"
echo "   # Abrir http://localhost:5173"
```

---

## 📊 MONITOREO DEL BUILD

### Verificar Tamaño del Bundle

```bash
# Después de build
npm run build

# Ver tamaño de archivos
ls -lh dist/assets/

# Debe ser aproximadamente:
# index.html: ~3KB
# index.css: ~57KB
# index.js: ~687KB
```

### Alertas de Build

Si el build es muy pequeño, puede indicar problemas:

```bash
# Script de alerta
#!/bin/bash
# check_build_size.sh

js_size=$(du -k dist/assets/*.js 2>/dev/null | cut -f1)

if [ -z "$js_size" ]; then
  echo "❌ CRÍTICO: No se generó bundle JS"
  exit 1
elif [ $js_size -lt 500 ]; then
  echo "⚠️  ADVERTENCIA: Bundle JS muy pequeño (${js_size}KB)"
  echo "   Esto puede indicar que falta código"
  echo "   Verificar: ./verify_integrity.sh"
  exit 1
else
  echo "✅ Bundle JS: ${js_size}KB"
fi
```

### Monitoreo Continuo

Crear script que monitorea cambios:

```bash
#!/bin/bash
# monitor.sh

echo "👀 Monitoreando cambios en archivos críticos..."

while true; do
  # Verificar App.tsx
  lines=$(wc -l < src/App.tsx 2>/dev/null)
  
  if [ -z "$lines" ]; then
    echo "❌ $(date): App.tsx no existe"
    ./backup.sh
    exit 1
  elif [ $lines -lt 400 ]; then
    echo "⚠️  $(date): App.tsx tiene solo $lines líneas"
    echo "   Restaurando desde backup..."
    ./restore_backup.sh $(ls -t backups/ | head -1 | sed 's/backup_//')
  fi
  
  sleep 60  # Verificar cada minuto
done
```

---

## 🚨 RECUPERACIÓN ANTE DESASTRES

### Escenario 1: Archivo App.tsx Vacío

**Síntomas:**
- Aplicación no carga
- Solo se ve pantalla en blanco
- Build exitoso pero no funciona

**Solución:**
```bash
# 1. Verificar problema
wc -l src/App.tsx
# Si muestra < 100, está dañado

# 2. Restaurar desde backup
./restore_backup.sh $(ls -t backups/ | head -1 | sed 's/backup_//')

# 3. Verificar
npm run dev
# Abrir navegador y verificar
```

### Escenario 2: Múltiples Archivos Dañados

**Síntomas:**
- Varios errores en consola
- Aplicación no funciona
- Build falla

**Solución:**
```bash
# 1. Verificar integridad
./verify_integrity.sh

# 2. Ver último backup bueno
git log --oneline | head -5

# 3. Volver a commit anterior
git checkout <commit-hash>

# 4. Verificar que funciona
npm run dev

# 5. Si funciona, hacer nuevo commit
git checkout -b recovery/fix
git add .
git commit -m "🔄 Recovery: Restaurado desde commit anterior"
```

### Escenario 3: Pérdida Total de Datos

**Síntomas:**
- No hay backups
- No hay Git
- Archivos corruptos

**Solución:**
```bash
# 1. Recrear estructura básica
mkdir -p src/components src/hooks src/utils

# 2. Recrear App.tsx desde documentación
# Usar CHECKPOINT_FINAL.md como referencia

# 3. Recrear componentes uno por uno
# Seguir la documentación de cada componente

# 4. Verificar
npm run build
./verify_integrity.sh
```

### Plan de Recuperación de Emergencia

```bash
#!/bin/bash
# emergency_recovery.sh

echo "🚨 RECUPERACIÓN DE EMERGENCIA"
echo ""

# 1. Detener servidor
pkill -f "npm run dev"

# 2. Verificar backups
if [ -d "backups" ]; then
  latest=$(ls -t backups/ | head -1)
  echo "✅ Backup encontrado: ${latest}"
  echo ""
  read -p "¿Restaurar este backup? (s/n): " confirm
  
  if [ "$confirm" = "s" ]; then
    ./restore_backup.sh ${latest}
    exit 0
  fi
else
  echo "❌ No hay backups disponibles"
fi

# 3. Verificar Git
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "✅ Git disponible"
  echo ""
  echo "Commits recientes:"
  git log --oneline | head -5
  echo ""
  read -p "¿Volver a commit anterior? (s/n): " confirm
  
  if [ "$confirm" = "s" ]; then
    read -p "Ingresa el hash del commit: " commit_hash
    git checkout $commit_hash
    npm install
    npm run build
    exit 0
  fi
else
  echo "❌ Git no disponible"
fi

# 4. Recuperación manual
echo ""
echo "📋 RECUPERACIÓN MANUAL"
echo ""
echo "Sigue estos pasos:"
echo "1. Revisar DIAGNOSTICO_PROYECTO.md"
echo "2. Revisar CHECKPOINT_FINAL.md"
echo "3. Recrear archivos críticos manualmente"
echo "4. Verificar con ./verify_integrity.sh"
echo ""
```

---

## 📅 RUTINA DE MANTENIMIENTO

### Diario
```bash
# Antes de empezar a trabajar
./verify_integrity.sh

# Después de cambios importantes
./backup.sh
git add .
git commit -m "📝 Descripción del cambio"
```

### Semanal
```bash
# Verificar backups
ls -la backups/

# Limpiar backups antiguos (mantener últimos 10)
ls -t backups/ | tail -n +11 | xargs rm -rf

# Verificar Git
git status
git log --oneline | head -10
```

### Mensual
```bash
# Backup completo del proyecto
tar -czf backup_completo_$(date +%Y%m).tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  .

# Guardar en ubicación segura
mv backup_completo_*.tar.gz /ruta/segura/

# Verificar que todo funciona
npm run build
./verify_integrity.sh
npm run dev
# Probar manualmente todas las funcionalidades
```

---

## 🎯 CHECKLIST DE PREVENCIÓN

### Antes de Cada Cambio Importante

- [ ] Hacer backup: `./backup.sh`
- [ ] Crear rama Git: `git checkout -b feature/nombre`
- [ ] Verificar estado actual: `./verify_integrity.sh`
- [ ] Probar que funciona: `npm run dev`

### Después de Cada Cambio

- [ ] Verificar build: `npm run build`
- [ ] Verificar integridad: `./verify_integrity.sh`
- [ ] Probar funcionalidad: `npm run dev` + navegador
- [ ] Commit si todo está bien: `git add . && git commit -m "mensaje"`

### Antes de Hacer Commit

- [ ] Verificar diff: `git diff`
- [ ] Verificar que no se eliminó código crítico
- [ ] Verificar tamaño del bundle: `ls -lh dist/assets/`
- [ ] Probar todas las pestañas manualmente

### Semanalmente

- [ ] Verificar backups: `ls -la backups/`
- [ ] Limpiar backups antiguos
- [ ] Verificar Git: `git status`
- [ ] Probar funcionalidad completa

---

## 📞 SOPORTE Y RECURSOS

### Documentación Disponible

- **README.md** - Documentación principal
- **DIAGNOSTICO_PROYECTO.md** - Análisis del daño anterior
- **CHECKPOINT_FINAL.md** - Estado actual del proyecto
- **GUIA_PREVENCION.md** - Este documento

### Scripts Disponibles

- **backup.sh** - Crear backup manual
- **restore_backup.sh** - Restaurar desde backup
- **verify_integrity.sh** - Verificar integridad
- **quick_test.sh** - Pruebas rápidas
- **emergency_recovery.sh** - Recuperación de emergencia

### Comandos Rápidos

```bash
# Backup rápido
./backup.sh

# Verificar integridad
./verify_integrity.sh

# Restaurar último backup
./restore_backup.sh $(ls -t backups/ | head -1 | sed 's/backup_//')

# Prueba rápida
npm run build && ./verify_integrity.sh && npm run dev
```

---

## 🎉 CONCLUSIÓN

### Resumen de Prevención

1. ✅ **Backups automáticos** antes de cambios importantes
2. ✅ **Verificación de integridad** después de cada cambio
3. ✅ **Control de versiones** con Git
4. ✅ **Tests manuales** después de cada cambio
5. ✅ **Monitoreo del build** para detectar problemas
6. ✅ **Plan de recuperación** ante desastres

### Reglas de Oro

1. **NUNCA editar App.tsx sin hacer backup primero**
2. **SIEMPRE verificar con ./verify_integrity.sh después de cambios**
3. **USAR Git para control de versiones**
4. **PROBAR manualmente después de cada cambio importante**
5. **MANTENER backups actualizados**

### Contacto

**Programador:** Hugo Leon  
**Versión:** 1.4.9  
**Fecha:** 2026-01-15

---

**¡Con estas herramientas, el proyecto está protegido contra daños futuros!** 🛡️
