# 🕐 Control de Asistencia HL

**Versión:** 1.4.9  
**Creador by:** Hugo Leon  
**Estado:** ✅ Completamente Funcional

---

## 📋 Descripción

Sistema completo de control de asistencia laboral con cálculo automático de horas, gestión de pagos, bonos, descuentos, balance personal y cálculo de décimo cuarto sueldo.

### Características Principales

✅ **Registro de Asistencia**
- Selector de semanas (52 semanas del año)
- Cálculo automático de horas
- Detección de feriados y fines de semana
- Fotos de entrada/salida encriptadas

✅ **Cálculo de Pagos**
- Horas extras al 50% (Lun-Vie después de 45h)
- Horas extras al 100% (feriados Lun-Vie)
- Horas de fin de semana al 100% (si ≥45h)
- Horas de fin de semana al 50% (si <45h)
- Feriados de fin de semana al 100%

✅ **Bonos y Descuentos**
- Bonos fijos y variables
- Fondo de reserva (8.33%)
- IESS Salud Cónyuge (3.41%)
- Aporte Personal IESS (9.45%)
- Préstamos personales y bancarios
- Préstamos quirúrgicos con interés
- Quincena configurable

✅ **Balance Personal**
- Gestión de deudas personales
- Gestión de gastos por categoría
- Pagos parciales con fotos de respaldo
- Fichas visuales elegantes con sello oficial
- Comprobantes de pago automáticos
- Compartir por WhatsApp
- Auto-renovación de gastos
- Historial de balances mensuales

✅ **Décimo Cuarto Sueldo**
- Cálculo automático de bases mensuales
- Cambio de mes automático (día 1)
- Fórmula: Sueldo Base + Horas Extras
- NO incluye bonos ni fondo de reserva

✅ **Fichas Visuales**
- Sello oficial circular
- Marcas de agua sutiles
- Bordes decorativos
- Gradientes profesionales
- Diseño elegante y presentable

✅ **Exportación/Importación**
- Exporta todos los datos (17 claves)
- Importa con validaciones
- Respaldo completo en JSON

✅ **Modo Offline**
- 100% offline después de la primera carga
- Service Worker para caché
- Icono personalizado
- Instalable como PWA

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

# Los archivos se generan en la carpeta dist/
# Puedes subir esta carpeta a cualquier servidor web
```

---

## 📁 Estructura del Proyecto

```
control-asistencia-hl/
│
├── 📄 index.html                 # HTML principal
├── 📄 package.json               # Dependencias y scripts
├── 📄 tsconfig.json              # Configuración TypeScript
├── 📄 vite.config.js             # Configuración Vite
├── 📄 tailwind.config.js         # Configuración Tailwind
├── 📄 postcss.config.js          # Configuración PostCSS
│
├── 📁 src/
│   ├── 📄 main.tsx               # Punto de entrada
│   ├── 📄 App.tsx                # Componente principal
│   ├── 📄 index.css              # Estilos globales
│   ├── 📄 types.ts               # Tipos TypeScript
│   │
│   ├── 📁 components/            # Componentes React (16 archivos)
│   │   ├── BalancePersonal.tsx   # Balance personal completo
│   │   ├── ContactInfo.tsx       # Información de contacto
│   │   ├── DecimoCuarto.tsx      # Cálculo de 14to sueldo
│   │   ├── FinancialManager.tsx  # Gestor financiero (IESS, bonos)
│   │   ├── HolidayManager.tsx    # Gestor de feriados
│   │   ├── MonthlyChart.tsx      # Gráfico mensual
│   │   ├── OptionsMenu.tsx       # Menú de opciones
│   │   ├── ProjectionPanel.tsx   # Panel de proyecciones
│   │   ├── ProjectionPay.tsx     # Proyección de pagos
│   │   ├── RecordForm.tsx        # Formulario de registro
│   │   ├── RecordList.tsx        # Lista de registros
│   │   ├── Summary.tsx           # Resumen semanal
│   │   ├── ThemeSelector.tsx     # Selector de temas
│   │   ├── WeeklyChart.tsx       # Gráfico semanal
│   │   └── WelcomeModal.tsx      # Modal de bienvenida
│   │
│   ├── 📁 hooks/                 # Custom Hooks
│   │   └── useAttendanceStorage.ts  # Hook de almacenamiento
│   │
│   └── 📁 utils/                 # Utilidades (6 archivos)
│       ├── calculations.ts       # Cálculos generales
│       ├── cardGenerator.ts      # Generador de fichas elegantes
│       ├── database.ts           # Exportación/importación
│       ├── monthlyBaseCalculator.ts  # Cálculo de bases mensuales
│       ├── payCalculations.ts    # Cálculos de pagos
│       └── photoEncryption.ts    # Encriptación de fotos
│
├── 📁 public/                    # Archivos públicos
│   ├── manifest.json             # Configuración PWA
│   └── sw.js                     # Service Worker
│
└── 📁 dist/                      # Build de producción (generado)
    ├── index.html
    └── assets/
        ├── index-[hash].css
        └── index-[hash].js
```

---

## 🎯 Uso de la Aplicación

### Pestaña 1: Inicio
- **Selector de Semana:** Navega entre semanas del año
- **Resumen Semanal:** Visualiza horas trabajadas, feriados, progreso
- **Gestor de Feriados:** Registra días feriados del año
- **Gráfico Semanal:** Visualiza horas por día
- **Panel de Proyecciones:** Proyecciones semanal, mensual, trimestral
- **Registro de Asistencia:** Registra entrada/salida diaria

### Pestaña 2: Historial
- **Lista de Registros:** Todos los registros agrupados por semana
- **Edición:** Modifica registros existentes
- **Eliminación:** Elimina registros individuales o todos
- **Detección de Duplicados:** Identifica y elimina duplicados

### Pestaña 3: Reportes
- **Gráficos:** Visualización de datos con Recharts
- **Proyecciones:** Semanal, mensual, trimestral
- **Resumen:** Estadísticas completas

### Pestaña 4: Pago
- **Configuración:** Sueldo base, tarifas, quincena
- **Selector de Semanas:** Rango de semanas para cálculo
- **Cálculo Automático:** Horas extras, bonos, descuentos
- **Neto a Recibir:** Cálculo final automático
- **Desglose Detallado:** Vista completa de todos los conceptos

### Pestaña 5: Finanzas
- **Base de Ingreso:** Sueldo + Horas Extras
- **IESS Salud Cónyuge:** 3.41% de base ingreso
- **Aporte Personal IESS:** 9.45% de base ingreso
- **Fondo de Reserva:** 8.33% de base ingreso
- **Bonos:** Fijos, variables, fondo de reserva
- **Descuentos:** Préstamos, IESS, otros

### Pestaña 6: Balance
- **Sub-pestaña Balance:** Resumen financiero completo
- **Sub-pestaña Ingresos:** Neto a recibir + ingresos manuales
- **Sub-pestaña Gastos:** Gestión de gastos con pagos parciales
- **Sub-pestaña Deudas:** Gestión de deudas con pagos parciales
- **Fichas Elegantes:** Generación de fichas visuales con sello
- **Comprobantes:** Generación automática de comprobantes
- **WhatsApp:** Compartir fichas y comprobantes
- **Historial:** Balances mensuales guardados automáticamente

### Pestaña 7: Décimo
- **Ingreso Manual:** Sueldos de diciembre a noviembre
- **Cálculo Automático:** Bases mensuales el día 1 de cada mes
- **Fórmula:** Sueldo Base + Horas Extras (sin bonos)
- **Resultado:** Décimo cuarto sueldo = Total / 12

---

## 📊 Reglas de Negocio

### Horas Semanales
- **Meta:** 45 horas (Lun-Vie)
- **Extras Lun-Vie:** 50% ($3.29/h por defecto)
- **Sáb-Dom (≥45h):** 100% ($4.39/h por defecto)
- **Sáb-Dom (<45h):** 50% ($3.29/h por defecto)
- **Feriados:** Siempre al 100%

### Base de Ingreso
```
Base de Ingreso = Sueldo Base + Horas Extras del Periodo
```
**NO incluye:**
- ❌ Bonos
- ❌ Fondo de Reserva

### Descuentos IESS
```
IESS Salud Cónyuge = Base de Ingreso × 3.41%
Aporte Personal IESS = Base de Ingreso × 9.45%
Fondo de Reserva = Base de Ingreso × 8.33%
```

### Neto a Recibir
```
Ingreso Bruto = Sueldo + Horas Extras + Bonos
Neto = Ingreso Bruto - Descuentos - Quincena
```

### Décimo Cuarto
```
Base Mensual = Sueldo Base + Horas Extras del Mes
Décimo = Σ(Bases Mensuales) / 12
```

---

## 🔧 Tecnologías Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Recharts** - Gráficos
- **date-fns** - Manejo de fechas
- **localStorage** - Persistencia de datos
- **Canvas API** - Generación de fichas visuales
- **Service Worker** - Modo offline

---

## 💾 Almacenamiento

### localStorage Keys (17 claves)
```
✅ asistencia_hl_records              # Registros de asistencia
✅ asistencia_hl_holidays             # Feriados
✅ asistencia_hl_bonuses              # Bonos
✅ asistencia_hl_discounts            # Descuentos
✅ asistencia_hl_personal_debts       # Deudas personales
✅ asistencia_hl_personal_expenses    # Gastos personales
✅ asistencia_hl_monthly_balances     # Balances mensuales
✅ balance_personal_manual_incomes    # Ingresos manuales
✅ asistencia_hl_decimo_monthly_bases # Bases de décimo
✅ asistencia_hl_last_month_processed # Último mes procesado
✅ asistencia_hl_salary               # Sueldo base
✅ asistencia_hl_rate100              # Tarifa 100%
✅ asistencia_hl_rate50               # Tarifa 50%
✅ asistencia_hl_quincena             # Quincena
✅ asistencia_hl_selected_week_start  # Semana inicial
✅ asistencia_hl_selected_week_end    # Semana final
✅ selectedTheme                      # Tema seleccionado
```

---

## 📱 Instalación como App

### Android
1. Abre la aplicación en Chrome Android
2. Toca el menú (⋮)
3. Selecciona "Añadir a pantalla de inicio"
4. ¡Listo! La app funciona 100% offline

### iOS
1. Abre la aplicación en Safari
2. Toca el botón de compartir
3. Selecciona "Añadir a pantalla de inicio"
4. ¡Listo! La app funciona 100% offline

### Desktop
1. Abre la aplicación en Chrome o Edge
2. Toca el icono de instalación (⊕) en la barra de direcciones
3. ¡Listo! La app funciona como aplicación de escritorio

---

## 🔄 Actualizaciones

### Versión 1.4.9 (Actual)
- ✅ Corrección completa de pestaña Balance
- ✅ Agregadas opciones IESS en Finanzas
- ✅ Base de Ingreso calculada correctamente
- ✅ Fichas visuales elegantes con sello
- ✅ Comprobantes automáticos
- ✅ Compartir por WhatsApp
- ✅ Auto-renovación de gastos
- ✅ Historial de balances mensuales

### Historial de Versiones
- **1.4.8** - Fotos de respaldo en pagos
- **1.4.7** - Auto-renovación de gastos
- **1.4.6** - Pagos parciales en gastos y deudas
- **1.4.5** - Préstamos quirúrgicos con interés
- **1.4.4** - Corrección de cálculos
- **1.4.3** - Descarga offline en ZIP
- **1.4.2** - Fondo de Reserva 8.33%
- **1.4.1** - Base de ingreso corregida
- **1.4.0** - Balance personal completo
- **1.3.0** - Décimo cuarto automático
- **1.2.0** - Fichas visuales
- **1.1.0** - Exportación/importación
- **1.0.0** - Versión inicial

---

## 🐛 Solución de Problemas

### La aplicación no carga
- Limpia el caché del navegador (Ctrl + Shift + Delete)
- Recarga con Ctrl + Shift + R
- Verifica que todas las dependencias estén instaladas

### Los datos no se guardan
- Verifica que localStorage esté habilitado
- No uses modo incógnito
- Verifica permisos del navegador

### Los cálculos son incorrectos
- Verifica que el sueldo base esté configurado
- Verifica que las tarifas sean correctas
- Revisa la consola (F12) para ver errores

### Las fichas no se generan
- Verifica que el navegador soporte Canvas API
- Intenta con otro navegador
- Revisa la consola para ver errores

---

## 📞 Soporte

**Programador:** Hugo Leon  
**Versión:** 1.4.9  
**Fecha:** 2026-01-15

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
