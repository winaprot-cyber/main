# 🔄 INSTRUCCIONES DE RESTAURACIÓN
## Control de Asistencia - Versión 1.4.9

**Fecha:** 2026-01-15  
**Creador by Hugo Leon**

---

## 📋 RESUMEN

Este documento contiene las instrucciones completas para restaurar el proyecto desde el punto de guardado (checkpoint) creado el 2026-01-15.

---

## 🎯 MÉTODOS DE RESTAURACIÓN

### Método 1: Restauración Completa (Recomendado)

Este método restaura todo el proyecto desde cero usando el archivo ZIP de respaldo.

#### Paso 1: Descomprimir el Respaldo
```bash
# Linux/Mac
unzip control-asistencia-hl-backup-2026-01-15.zip

# Windows (PowerShell)
Expand-Archive -Path control-asistencia-hl-backup-2026-01-15.zip -DestinationPath .

# Windows (con 7-Zip o WinRAR)
# Clic derecho → Extraer aquí
```

#### Paso 2: Navegar al Directorio del Proyecto
```bash
cd control-asistencia-hl
```

#### Paso 3: Instalar Dependencias
```bash
npm install
```

Esto instalará todas las dependencias listadas en `package.json`:
- react
- react-dom
- date-fns
- recharts
- jszip
- file-saver
- typescript
- vite
- tailwindcss
- postcss
- autoprefixer

#### Paso 4: Ejecutar el Proyecto

**Opción A: Modo Desarrollo**
```bash
npm run dev
```
Abre: http://localhost:5173

**Opción B: Modo Producción**
```bash
npm run build
npm run preview
```
Abre: http://localhost:4173

---

### Método 2: Restauración de Datos

Este método restaura solo los datos del usuario (localStorage) sin reinstalar el proyecto.

#### Paso 1: Abrir la Aplicación
Abre la aplicación en tu navegador (ya sea en desarrollo o producción).

#### Paso 2: Exportar Datos Actuales (Opcional)
Antes de importar, puedes exportar tus datos actuales como respaldo:
1. Ir al menú de 3 puntos (⋮) en la esquina superior derecha
2. Seleccionar "Exportar Base de Datos"
3. Guardar el archivo JSON

#### Paso 3: Importar Datos del Respaldo
1. Ir al menú de 3 puntos (⋮)
2. Seleccionar "Importar Base de Datos"
3. Seleccionar el archivo JSON de respaldo anterior
4. Confirmar la importación
5. La página se recargará automáticamente

#### Paso 4: Verificar Datos
Verifica que todos tus datos hayan sido restaurados:
- ✅ Registros de asistencia
- ✅ Feriados
- ✅ Bonos
- ✅ Descuentos
- ✅ Deudas personales
- ✅ Gastos personales
- ✅ Balances mensuales
- ✅ Configuración (sueldo, tarifas, etc.)

---

### Método 3: Restauración Selectiva

Este método permite restaurar solo ciertos aspectos del proyecto.

#### Restaurar Solo el Código
```bash
# 1. Descomprimir el respaldo
unzip control-asistencia-hl-backup-2026-01-15.zip

# 2. Copiar solo la carpeta src/
cp -r src/ /ruta/a/tu/proyecto/

# 3. Copiar archivos de configuración
cp package.json tsconfig.json vite.config.js index.html /ruta/a/tu/proyecto/

# 4. Instalar dependencias
cd /ruta/a/tu/proyecto/
npm install
```

#### Restaurar Solo la Documentación
```bash
# Copiar archivos .md
cp *.md /ruta/a/tu/documentacion/
```

#### Restaurar Solo los Scripts
```bash
# Copiar archivos .sh
cp *.sh /ruta/a/tu/scripts/
chmod +x *.sh
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema 1: Error al Descomprimir
**Síntoma:** El archivo ZIP no se puede descomprimir  
**Solución:**
```bash
# Verificar integridad del archivo
unzip -t control-asistencia-hl-backup-2026-01-15.zip

# Si está corrupto, descargar nuevamente
```

### Problema 2: Error en npm install
**Síntoma:** Errores al instalar dependencias  
**Solución:**
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Instalar nuevamente
npm install
```

### Problema 3: Error en npm run dev
**Síntoma:** El servidor no inicia  
**Solución:**
```bash
# Verificar que el puerto 5173 esté libre
lsof -i :5173

# Si está ocupado, matar el proceso
kill -9 <PID>

# O usar otro puerto
npm run dev -- --port 3000
```

### Problema 4: Error en npm run build
**Síntoma:** El build falla  
**Solución:**
```bash
# Verificar errores de TypeScript
npx tsc --noEmit

# Corregir errores y volver a intentar
npm run build
```

### Problema 5: Datos No Se Restauran
**Síntoma:** Los datos no aparecen después de importar  
**Solución:**
1. Verificar que el archivo JSON sea válido
2. Abrir la consola del navegador (F12)
3. Buscar errores en la pestaña "Console"
4. Verificar que localStorage esté habilitado
5. Intentar con otro navegador

### Problema 6: localStorage Lleno
**Síntoma:** Error al guardar datos  
**Solución:**
```javascript
// En la consola del navegador (F12)
// Verificar espacio usado
let total = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    total += localStorage[key].length + key.length;
  }
}
console.log(`Espacio usado: ${(total / 1024 / 1024).toFixed(2)} MB`);

// Limpiar datos antiguos si es necesario
localStorage.clear();
```

---

## 📊 VERIFICACIÓN POST-RESTAURACIÓN

### Checklist de Verificación

Después de restaurar, verifica lo siguiente:

#### ✅ Código Fuente
- [ ] Todos los archivos en `src/` están presentes
- [ ] No hay errores de sintaxis
- [ ] TypeScript compila sin errores

#### ✅ Dependencias
- [ ] `node_modules/` existe
- [ ] Todas las dependencias están instaladas
- [ ] No hay warnings críticos

#### ✅ Build
- [ ] `npm run build` se ejecuta sin errores
- [ ] Carpeta `dist/` se genera correctamente
- [ ] Tamaño del build es ~735 kB

#### ✅ Funcionalidad
- [ ] Las 7 pestañas funcionan
- [ ] Registro de asistencia funciona
- [ ] Cálculos de pago son correctos
- [ ] Balance personal funciona
- [ ] Décimo se calcula correctamente
- [ ] Exportación/importación funciona

#### ✅ Datos
- [ ] Registros de asistencia restaurados
- [ ] Feriados restaurados
- [ ] Bonos restaurados
- [ ] Descuentos restaurados
- [ ] Deudas restauradas
- [ ] Gastos restaurados
- [ ] Configuración restaurada

---

## 🎯 COMANDOS ÚTILES

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar en otro puerto
npm run dev -- --port 3000

# Iniciar con host expuesto (para acceso desde otros dispositivos)
npm run dev -- --host 0.0.0.0
```

### Producción
```bash
# Construir para producción
npm run build

# Vista previa de producción
npm run preview

# Analizar bundle
npm run build -- --mode analysis
```

### Utilidades
```bash
# Verificar tipos TypeScript
npx tsc --noEmit

# Formatear código
npx prettier --write .

# Linter
npx eslint src/

# Limpiar build
rm -rf dist/

# Limpiar dependencias
rm -rf node_modules/
```

### Respaldo
```bash
# Crear respaldo completo
./backup.sh

# Crear respaldo manual
zip -r backup-$(date +%Y-%m-%d).zip . -x "node_modules/*" "dist/*" ".git/*"

# Ver contenido del respaldo
unzip -l backup-2026-01-15.zip
```

---

## 📞 SOPORTE

### Documentación
- **CHECKPOINT.md** - Estado del proyecto en el punto de guardado
- **ESTADO_ACTUAL_PROYECTO.md** - Resumen del estado actual
- **INDICE_COMPLETO_PROYECTO.md** - Índice de todos los archivos
- **CODIGO_COMPLETO_PROYECTO.md** - Lista completa de código

### Contacto
**Creador by Hugo Leon**  
**Versión:** 1.4.9  
**Fecha:** 2026-01-15

### Recursos
- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/
- **Vite:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **date-fns:** https://date-fns.org/
- **Recharts:** https://recharts.org/

---

## 🎉 RESTAURACIÓN EXITOSA

Si has seguido todos los pasos y verificado todo el checklist, tu proyecto debería estar completamente restaurado y funcional.

### Próximos Pasos
1. ✅ Probar todas las funcionalidades
2. ✅ Verificar cálculos con datos reales
3. ✅ Personalizar configuración si es necesario
4. ✅ Agregar feriados del año actual
5. ✅ Configurar sueldo base y tarifas
6. ✅ Comenzar a registrar asistencia diaria

---

**¡Restauración completada exitosamente!** 🚀
