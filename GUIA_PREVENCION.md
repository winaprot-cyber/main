# 🛡️ GUÍA COMPLETA DE PREVENCIÓN

## Control de Asistencia HL - v1.4.9

**Creador by Hugo Leon**  
**Fecha:** 2026-01-15

---

## 📋 TABLA DE CONTENIDOS

1. [Introducción](#introducción)
2. [Scripts de Protección](#scripts-de-protección)
3. [Git Hooks](#git-hooks)
4. [Mejores Prácticas](#mejores-prácticas)
5. [Monitoreo Automático](#monitoreo-automático)
6. [Recuperación ante Desastres](#recuperación-ante-desastres)
7. [Checklist de Seguridad](#checklist-de-seguridad)

---

## 🎯 INTRODUCCIÓN

El proyecto sufrió un daño crítico cuando el archivo `src/App.tsx` quedó vacío accidentalmente. Esta guía te ayudará a prevenir que esto vuelva a suceder mediante:

- ✅ Scripts de backup automático
- ✅ Verificación de integridad
- ✅ Git hooks protectores
- ✅ Monitoreo continuo
- ✅ Procedimientos de recuperación

---

## 🛠️ SCRIPTS DE PROTECCIÓN

### 1. backup.sh - Backup Automático

**Propósito:** Crear respaldos completos del proyecto antes de cambios importantes.

**Uso:**
```bash
# Hacer backup manual
./backup.sh

# Los backups se guardan en: backups/backup_YYYYMMDD_HHMMSS/
```

**Qué respalda:**
- ✅ Todos los archivos de src/
- ✅ Componentes, utilidades, hooks
- ✅ Archivos de configuración
- ✅ Documentación

**Cuándo usar:**
- Antes de cambios importantes
- Antes de merges o rebases
- Diariamente (puedes automatizarlo con cron)

**Automatización con cron (Linux/Mac):**
```bash
# Editar crontab
crontab -e

# Agregar backup diario a las 2 AM
0 2 * * * /ruta/al/proyecto/backup.sh
```

---

### 2. verify.sh - Verificación de Integridad

**Propósito:** Verificar que todos los archivos críticos estén presentes y tengan contenido válido.

**Uso:**
```bash
# Verificación completa
./verify.sh

# Verificación rápida
./verify.sh --quick
```

**Qué verifica:**
- ✅ App.tsx tenga al menos 100 líneas
- ✅ Todos los componentes existan
- ✅ Todas las utilidades existan
- ✅ El proyecto compile sin errores
- ✅ Los archivos de configuración estén presentes

**Cuándo usar:**
- Después de hacer cambios
- Antes de hacer commit
- Después de mergear ramas
- Cuando algo no funcione

**Salida esperada:**
```
🔍 Verificando integridad del proyecto...

📄 Verificando App.tsx...
✅ App.tsx OK (456 líneas)

📦 Verificando componentes...
✅ BalancePersonal.tsx OK (2500 líneas)
✅ FinancialManager.tsx OK (987 líneas)
...

🔨 Verificando build...
✅ Build exitoso

═══════════════════════════════════════
📊 RESUMEN DE VERIFICACIÓN
═══════════════════════════════════════
✅ Errores: 0
⚠️  Warnings: 0

🎉 ¡Proyecto íntegro y funcional!
```

---

### 3. restore.sh - Restauración desde Backup

**Propósito:** Restaurar el proyecto desde un backup anterior cuando algo sale mal.

**Uso:**
```bash
# Restaurar interactivo (te pregunta qué backup usar)
./restore.sh

# Restaurar el backup más reciente automáticamente
./restore.sh --latest
```

**Qué hace:**
1. Lista todos los backups disponibles
2. Te permite seleccionar cuál restaurar
3. Crea un backup de seguridad antes de restaurar
4. Restaura todos los archivos
5. Verifica la integridad
6. Reconstruye el proyecto

**Cuándo usar:**
- Cuando App.tsx esté vacío o dañado
- Cuando falten componentes
- Cuando el build falle
- Después de un merge conflictivo

**Ejemplo de uso:**
```bash
# Algo salió mal, restaurar desde backup
./restore.sh

# Salida:
📋 Backups disponibles:
   1. backup_20260115_143022
   2. backup_20260115_120000
   3. backup_20260114_180000

🔢 Selecciona el número del backup a restaurar (1-3): 1

⚠️  ADVERTENCIA: Esta acción sobrescribirá los archivos actuales
📁 Backup a restaurar: backup_20260115_143022

¿Estás seguro? (s/n): s

🔒 Creando backup de seguridad...
✅ Backup de seguridad creado

📦 Restaurando archivos...
✅ Archivos de src/ restaurados
✅ package.json restaurado
...

🔍 Verificando integridad...
✅ Verificación exitosa

🔨 Reconstruyendo proyecto...
✅ Build exitoso

═══════════════════════════════════════
✅ Restauración completada
═══════════════════════════════════════
```

---

### 4. pre-commit-check.sh - Verificación Pre-Commit

**Propósito:** Verificar rápidamente que todo esté bien antes de hacer commit.

**Uso:**
```bash
# Verificación rápida
./pre-commit-check.sh
```

**Qué verifica:**
- ✅ App.tsx tenga contenido sustancial
- ✅ El proyecto compile
- ✅ El bundle tenga tamaño razonable
- ✅ Los componentes críticos existan

**Cuándo usar:**
- Antes de cada commit
- Como parte de tu flujo de trabajo

---

### 5. monitor.sh - Monitoreo Automático

**Propósito:** Monitorear continuamente el proyecto y alertar si algo sale mal.

**Uso:**
```bash
# Iniciar monitoreo (se ejecuta en segundo plano)
./monitor.sh &

# Ver logs en tiempo real
tail -f monitor.log

# Detener monitoreo
pkill -f monitor.sh
```

**Qué hace:**
- ✅ Verifica el proyecto cada 5 minutos
- ✅ Crea backup automático si detecta problemas
- ✅ Intenta restaurar automáticamente
- ✅ Registra todo en monitor.log
- ✅ Envía alertas (si configuras email)

**Configurar email para alertas:**
```bash
# Editar monitor.sh
nano monitor.sh

# Buscar la línea:
ALERT_EMAIL=""

# Cambiar a:
ALERT_EMAIL="tu-email@ejemplo.com"
```

**Cuándo usar:**
- En servidores de producción
- Durante desarrollo intensivo
- Cuando quieras monitoreo continuo

---

## 🔒 GIT HOOKS

### Configuración Automática

**Uso:**
```bash
# Configurar todos los hooks de una vez
./setup-git-hooks.sh
```

**Qué configura:**

#### 1. Pre-Commit Hook
**Ubicación:** `.git/hooks/pre-commit`

**Qué hace:**
- Verifica que App.tsx tenga al menos 100 líneas
- Verifica que el proyecto compile
- Verifica que los componentes críticos existan
- **Bloquea el commit** si hay problemas

**Ejemplo:**
```bash
git add .
git commit -m "Cambios importantes"

# Salida si todo está bien:
🔍 Verificando integridad del proyecto antes del commit...
✅ Verificación exitosa

# Salida si hay problemas:
🔍 Verificando integridad del proyecto antes del commit...
❌ ERROR: App.tsx tiene solo 6 líneas
💡 Esto puede indicar que el archivo está dañado
💡 Ejecuta: ./restore.sh para restaurar desde backup
```

#### 2. Post-Commit Hook
**Ubicación:** `.git/hooks/post-commit`

**Qué hace:**
- Crea backup automático después de cada commit
- Te asegura tener un punto de restauración

#### 3. Pre-Push Hook
**Ubicación:** `.git/hooks/pre-push`

**Qué hace:**
- Verificación final antes de hacer push
- Te pregunta si quieres continuar si hay warnings
- **Bloquea el push** si el build falla

### Desactivar Hooks

Si necesitas desactivar los hooks temporalmente:
```bash
# Desactivar todos los hooks
rm .git/hooks/pre-commit
rm .git/hooks/post-commit
rm .git/hooks/pre-push

# O desactivar solo uno
chmod -x .git/hooks/pre-commit
```

---

## 📝 MEJORES PRÁCTICAS

### 1. Flujo de Trabajo Seguro

**Antes de hacer cambios importantes:**
```bash
# 1. Hacer backup
./backup.sh

# 2. Crear rama nueva
git checkout -b feature/nueva-funcionalidad

# 3. Hacer cambios
# ... editar archivos ...

# 4. Verificar integridad
./verify.sh

# 5. Commit
git add .
git commit -m "feat: nueva funcionalidad"

# 6. Push
git push origin feature/nueva-funcionalidad
```

### 2. Commits Frecuentes y Pequeños

**✅ Correcto:**
```bash
git add src/components/BalancePersonal.tsx
git commit -m "fix: corregir cálculo de balance"

git add src/utils/payCalculations.ts
git commit -m "feat: agregar cálculo de horas extras"
```

**❌ Incorrecto:**
```bash
# No hacer esto: cambiar 20 archivos en un commit
git add .
git commit -m "muchos cambios"
```

### 3. Mensajes de Commit Descriptivos

**Formato recomendado:**
```
<tipo>: <descripción corta>

<cuerpo opcional con más detalles>
```

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de error
- `docs`: Cambios en documentación
- `style`: Cambios de formato (sin cambiar lógica)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**
```bash
git commit -m "feat: agregar cálculo de IESS en finanzas"
git commit -m "fix: corregir error en cálculo de horas extras"
git commit -m "docs: actualizar README con nuevas funcionalidades"
```

### 4. Ramas Protegidas

**Configurar ramas protegidas en GitHub/GitLab:**
- `main` o `master`: Solo merges vía Pull Request
- Requiere aprobación de al menos 1 persona
- Requiere que los checks pasen (build, tests)

### 5. Pull Requests

**Flujo recomendado:**
```bash
# 1. Crear rama para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Push de la rama
git push origin feature/nueva-funcionalidad

# 4. Crear Pull Request en GitHub/GitLab
# 5. Pedir review a otro desarrollador
# 6. Después de aprobación, hacer merge
```

### 6. No Trabajar Directamente en Main

**❌ Evitar:**
```bash
git checkout main
# Hacer cambios directamente
git add .
git commit -m "cambios"
git push
```

**✅ Correcto:**
```bash
git checkout -b feature/nueva-funcionalidad
# Hacer cambios
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad
# Crear Pull Request
```

---

## 📊 MONITOREO AUTOMÁTICO

### Configuración Básica

```bash
# Iniciar monitoreo
./monitor.sh &

# Ver logs
tail -f monitor.log
```

### Configuración Avanzada con systemd (Linux)

**Crear servicio:**
```bash
sudo nano /etc/systemd/system/control-asistencia-monitor.service
```

**Contenido:**
```ini
[Unit]
Description=Monitor de Control de Asistencia HL
After=network.target

[Service]
Type=simple
User=tu-usuario
WorkingDirectory=/ruta/al/proyecto
ExecStart=/ruta/al/proyecto/monitor.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Activar servicio:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable control-asistencia-monitor
sudo systemctl start control-asistencia-monitor

# Ver estado
sudo systemctl status control-asistencia-monitor

# Ver logs
sudo journalctl -u control-asistencia-monitor -f
```

### Monitoreo con Docker

**Crear Dockerfile:**
```dockerfile
FROM ubuntu:20.04

RUN apt-get update && apt-get install -y bash curl

WORKDIR /app
COPY . /app

RUN chmod +x monitor.sh

CMD ["./monitor.sh"]
```

**Ejecutar:**
```bash
docker build -t control-asistencia-monitor .
docker run -d --name monitor -v $(pwd):/app control-asistencia-monitor
```

---

## 🚨 RECUPERACIÓN ANTE DESASTRES

### Escenario 1: App.tsx Vacío

**Síntomas:**
- La aplicación no carga
- Solo se ve pantalla en blanco
- `wc -l src/App.tsx` muestra menos de 100 líneas

**Solución:**
```bash
# 1. Verificar el problema
./verify.sh

# 2. Restaurar desde backup
./restore.sh

# 3. Verificar que funcionó
./verify.sh

# 4. Probar la aplicación
npm run dev
```

### Escenario 2: Build Falla

**Síntomas:**
- `npm run build` muestra errores
- La aplicación no se puede ejecutar

**Solución:**
```bash
# 1. Ver errores detallados
npm run build

# 2. Si es un error de TypeScript, corregir
# 3. Si no se puede corregir, restaurar desde backup
./restore.sh

# 4. Verificar que el build funcione
npm run build
```

### Escenario 3: Faltan Componentes

**Síntomas:**
- Errores de importación
- Componentes no se renderizan

**Solución:**
```bash
# 1. Verificar qué falta
./verify.sh

# 2. Restaurar desde backup
./restore.sh

# 3. Verificar que todo esté presente
./verify.sh
```

### Escenario 4: Datos Perdidos en localStorage

**Síntomas:**
- Los datos del usuario desaparecieron
- Configuración perdida

**Solución:**
```bash
# 1. Exportar datos si es posible
# Abrir la app, ir a menú de 3 puntos, Exportar Base de Datos

# 2. Si no es posible, no hay forma de recuperar
# localStorage es local al navegador

# 3. Para prevenir: hacer backups regulares de la base de datos
```

### Escenario 5: Repositorio Git Corrupto

**Síntomas:**
- Errores de Git
- No se puede hacer commit o push

**Solución:**
```bash
# 1. Hacer backup de todo
cp -r . ../backup-proyecto

# 2. Re-inicializar Git
rm -rf .git
git init
git add .
git commit -m "Restauración después de corrupción"

# 3. Agregar remote
git remote add origin https://github.com/tu-usuario/control-asistencia-hl.git

# 4. Forzar push (con cuidado)
git push -f origin main
```

---

## ✅ CHECKLIST DE SEGURIDAD

### Diario
- [ ] Hacer backup al inicio del día: `./backup.sh`
- [ ] Verificar integridad: `./verify.sh`
- [ ] Revisar logs de monitoreo: `tail monitor.log`

### Antes de Cambios Importantes
- [ ] Hacer backup: `./backup.sh`
- [ ] Crear rama nueva: `git checkout -b feature/nombre`
- [ ] Verificar que todo esté bien: `./verify.sh`

### Después de Cambios
- [ ] Verificar integridad: `./verify.sh`
- [ ] Probar la aplicación: `npm run dev`
- [ ] Hacer commit: `git add . && git commit -m "mensaje"`
- [ ] Verificar que el hook pasó: revisar salida del commit

### Antes de Push
- [ ] Verificar integridad: `./verify.sh`
- [ ] Hacer build: `npm run build`
- [ ] Probar en producción local: `npm run preview`
- [ ] Hacer push: `git push`

### Semanal
- [ ] Revisar backups antiguos y eliminar los muy viejos
- [ ] Verificar que los hooks de Git estén activos
- [ ] Revisar logs de monitoreo
- [ ] Actualizar dependencias si es necesario

### Mensual
- [ ] Revisar y limpiar backups antiguos
- [ ] Verificar que el monitoreo esté funcionando
- [ ] Revisar y actualizar documentación
- [ ] Hacer review de código si hay equipo

---

## 🎯 RESUMEN DE COMANDOS

### Comandos Esenciales

```bash
# Backup
./backup.sh

# Verificación
./verify.sh

# Restauración
./restore.sh

# Monitoreo
./monitor.sh &

# Configurar Git hooks
./setup-git-hooks.sh

# Verificación rápida pre-commit
./pre-commit-check.sh
```

### Comandos de Git

```bash
# Crear rama nueva
git checkout -b feature/nombre

# Hacer commit
git add .
git commit -m "tipo: descripción"

# Push
git push origin nombre-rama

# Ver estado
git status

# Ver log
git log --oneline

# Deshacer cambios (con cuidado)
git checkout -- archivo
```

### Comandos de NPM

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Tests (si existen)
npm test
```

---

## 📞 SOPORTE

Si tienes problemas o necesitas ayuda:

1. **Verificar integridad:** `./verify.sh`
2. **Revisar logs:** `tail monitor.log`
3. **Restaurar desde backup:** `./restore.sh`
4. **Contactar al programador:** Hugo Leon

---

## 🎉 CONCLUSIÓN

Siguiendo esta guía de prevención, puedes:

✅ **Prevenir** la pérdida de código  
✅ **Detectar** problemas rápidamente  
✅ **Recuperar** el proyecto en minutos  
✅ **Monitorear** el estado continuamente  
✅ **Automatizar** tareas de seguridad  

**Recuerda:**
- Hacer backups regularmente
- Usar Git hooks
- Verificar integridad frecuentemente
- No trabajar directamente en main
- Hacer commits pequeños y frecuentes

**¡Tu proyecto está protegido!** 🛡️

---

**Creador by Hugo Leon**  
**Versión:** 1.4.9  
**Fecha:** 2026-01-15  
**Estado:** ✅ GUÍA COMPLETA
