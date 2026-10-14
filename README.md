# 🕐 Control de Asistencia HL

**Versión:** 1.4.9  
**Creador by:** Hugo Leon  
**Estado:** ✅ Completamente Funcional

---

## 📋 Descripción

Sistema completo de control de asistencia laboral con cálculo automático de pagos, gestión de bonos, descuentos, balance personal y cálculo de décimo cuarto sueldo.

---

## ✨ Características Principales

### 📅 Registro de Asistencia
- Selector de semanas del año (52 semanas)
- Cálculo automático de horas trabajadas
- Detección de feriados y fines de semana
- Horas extras al 50% y 100% según reglas
- Historial completo con edición y eliminación

### 💰 Cálculo de Pagos
- Sueldo base configurable
- Tarifas personalizables (50% y 100%)
- Selector de rango de semanas para cálculo
- Cálculo automático de horas extras
- Regla específica para feriados (100%)
- Bonos y descuentos automáticos
- IESS Salud Cónyuge (3.41%)
- Aporte Personal IESS (9.45%)
- Quincena configurable
- Neto a recibir automático

### 🏦 Balance Personal
- Gestión completa de deudas personales
- Gestión de gastos por categoría
- Pagos parciales con fotos de respaldo
- Fichas visuales elegantes con sello oficial
- Comprobantes de pago automáticos
- Compartir por WhatsApp
- Auto-renovación de gastos
- Historial de balances mensuales
- Gráficos comparativos

### 🎁 Décimo Cuarto Sueldo
- Cálculo automático de bases mensuales
- Cambio de mes automático (día 1)
- Fórmula: Sueldo Base + Horas Extras
- NO incluye bonos ni fondo de reserva
- Edición manual permitida

### 📊 Reportes y Gráficos
- Gráficos semanales y mensuales
- Proyecciones de horas
- Resumen financiero completo
- Historial de balances

### 💾 Gestión de Datos
- Exportación completa (17 claves)
- Importación con validaciones
- Persistencia en localStorage
- 100% offline

---

## 🚀 Instalación

### Requisitos
- Node.js 18+ 
- npm o yarn

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/control-asistencia-hl.git
cd control-asistencia-hl

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev

# 4. Abrir en el navegador
# http://localhost:5173
```

### Build para Producción

```bash
# Construir la aplicación
npm run build

# Los archivos se generan en dist/
# Puedes subir esta carpeta a cualquier servidor web
```

---

## 📱 Uso de la Aplicación

### Pestaña 1: Inicio
- Selecciona la semana actual
- Registra tu asistencia diaria
- Agrega feriados del año
- Ve el resumen semanal

### Pestaña 2: Historial
- Ve todos tus registros
- Edita o elimina registros
- Filtra por semana

### Pestaña 3: Reportes
- Visualiza gráficos de horas
- Ve proyecciones mensuales
- Analiza tu progreso

### Pestaña 4: Pago
- Configura tu sueldo base
- Ajusta tarifas (50% y 100%)
- Selecciona rango de semanas
- Ve el desglose completo de pagos
- Configura quincena

### Pestaña 5: Finanzas
- Gestiona bonos (fijos, variables, fondo de reserva)
- Gestiona descuentos (préstamos, IESS)
- Activa/desactiva IESS Salud Cónyuge (3.41%)
- Activa/desactiva Aporte Personal IESS (9.45%)
- Activa/desactiva Fondo de Reserva (8.33%)

### Pestaña 6: Balance
- Gestiona deudas personales
- Gestiona gastos por categoría
- Realiza pagos parciales
- Genera fichas elegantes
- Comparte por WhatsApp
- Ve historial de balances

### Pestaña 7: Décimo
- Ingresa sueldos mensuales
- Ve el cálculo automático
- Edita valores si es necesario

---

## 📊 Reglas de Negocio

### Horas Semanales
- Meta: 45 horas (Lun-Vie)
- Extras Lun-Vie: 50% ($3.29/h por defecto)
- Extras de feriados: 100% ($4.39/h)
- Sáb-Dom (si ≥45h): 100% ($4.39/h)
- Sáb-Dom (si <45h): 50% ($3.29/h)

### Base de Ingreso
```
Base = Sueldo Base + Horas Extras
NO incluye: Bonos ni Fondo de Reserva
```

### Descuentos IESS
```
IESS Salud Cónyuge = Base × 3.41%
Aporte Personal IESS = Base × 9.45%
Fondo de Reserva = Base × 8.33%
```

### Neto a Recibir
```
Neto = (Sueldo + Extras + Bonos) - (Descuentos + Quincena)
```

### Décimo Cuarto
```
Décimo = Σ(Bases Mensuales) / 12
Base Mensual = Sueldo + Horas Extras del Mes
```

---

## 🎨 Personalización

### Cambiar Colores
1. Clic en el icono de 3 puntos (⋮)
2. Selecciona "Cambiar Colores"
3. Elige entre 6 temas disponibles
4. Los cambios se guardan automáticamente

### Temas Disponibles
- Azul Cyan (Original)
- Púrpura Rosa
- Verde Esmeralda
- Naranja Ámbar
- Rojo Rosa
- Índigo Violeta

---

## 💾 Respaldo de Datos

### Exportar Base de Datos
1. Clic en el icono de 3 puntos (⋮)
2. Selecciona "Exportar Base de Datos"
3. Se descarga un archivo JSON con todos tus datos
4. Guárdalo en un lugar seguro

### Importar Base de Datos
1. Clic en el icono de 3 puntos (⋮)
2. Selecciona "Importar Base de Datos"
3. Selecciona el archivo JSON de respaldo
4. Confirma la importación
5. La página se recarga automáticamente

---

## 📱 Instalación como App

### Android
1. Abre la aplicación en Chrome Android
2. Toca el menú (⋮)
3. Selecciona "Añadir a pantalla de inicio"
4. ¡Listo! Tendrás un icono directo

### iOS
1. Abre la aplicación en Safari
2. Toca el botón de compartir
3. Selecciona "Añadir a pantalla de inicio"
4. ¡Listo! Tendrás un icono directo

### Desktop
1. Abre la aplicación en Chrome o Edge
2. Clic en el icono de instalación (⊕)
3. ¡Listo! Tendrás un acceso directo

---

## 🐛 Solución de Problemas

### La aplicación no carga
- Limpia el caché del navegador (Ctrl+Shift+Delete)
- Recarga con Ctrl+Shift+R
- Verifica que todas las dependencias estén instaladas

### Los datos no se guardan
- Verifica que localStorage esté habilitado
- No uses modo incógnito
- Verifica permisos del navegador

### Los cálculos son incorrectos
- Verifica que el sueldo base esté configurado
- Verifica las tarifas (50% y 100%)
- Revisa la consola (F12) para ver errores

---

## 📞 Soporte

**Programador:** Hugo Leon  
**Versión:** 1.4.9  
**Fecha:** 2026

Para reportar problemas o solicitar mejoras, contacta al programador.

---

## 📄 Licencia

Este proyecto es de uso privado. Todos los derechos reservados.

---

## 🎉 Estado del Proyecto

✅ **Completamente Funcional**  
✅ **Build Exitoso**  
✅ **Todas las Pestañas Operativas**  
✅ **Cálculos Verificados**  
✅ **Documentación Completa**  
✅ **Listo para Producción**

---

**¡Disfruta tu aplicación de Control de Asistencia!** 🚀
