# 🕐 Control de Asistencia HL

**Sistema Completo de Control de Asistencia y Gestión Financiera Personal**

![Version](https://img.shields.io/badge/version-1.4.9-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Descripción

Sistema integral de control de asistencia laboral con gestión financiera personal completa. Incluye cálculo automático de horas, pagos, bonos, descuentos, IESS, fondo de reserva, balance personal con deudas y gastos, y cálculo de décimo cuarto sueldo.

## ✨ Características Principales

### 📊 Gestión de Asistencia
- ✅ Registro diario de horas trabajadas
- ✅ Detección automática de fines de semana y feriados
- ✅ Cálculo de horas extras con reglas específicas
- ✅ Selector de semanas con numeración ISO del año
- ✅ Fotos de entrada/salida encriptadas
- ✅ Historial completo con filtros

### 💰 Cálculo de Pagos
- ✅ Horas extras al 50% (Lun-Vie después de 45h)
- ✅ Horas extras al 100% (feriados Lun-Vie)
- ✅ Feriados de fin de semana al 100%
- ✅ Base de ingreso = Sueldo + Horas Extras
- ✅ Bonos (fijos, variables, fondo de reserva)
- ✅ Descuentos (préstamos, IESS, etc.)
- ✅ Quincena configurable
- ✅ Neto a recibir automático

### 🏥 IESS y Fondos
- ✅ **EXTENSION IESS SALUD CONYUGE**: 3.41% de base ingreso
- ✅ **APORTE PERSONAL IESS**: 9.45% de base ingreso
- ✅ **FONDO DE RESERVA MENSUAL**: 8.33% de base ingreso
- ✅ Cálculos automáticos basados en base de ingreso
- ✅ Activación/desactivación independiente

### ⚖️ Balance Personal
- ✅ Gestión completa de deudas personales
- ✅ Gestión completa de gastos personales
- ✅ Pagos parciales con fotos de respaldo
- ✅ Fichas visuales elegantes con sello oficial
- ✅ Comprobantes de pago automáticos
- ✅ Compartir por WhatsApp
- ✅ Auto-renovación de gastos
- ✅ Historial de balances mensuales
- ✅ Gráficos comparativos de ingresos vs gastos

### 🎁 Décimo Cuarto Sueldo
- ✅ Cálculo automático de bases mensuales
- ✅ Cambio de mes automático (día 1 de cada mes)
- ✅ Fórmula: Sueldo Base + Horas Extras
- ✅ NO incluye bonos ni fondo de reserva
- ✅ Edición manual permitida

### 🎨 Fichas Visuales Elegantes
- ✅ Sello oficial circular con "✓ OFICIAL"
- ✅ Marcas de agua sutiles
- ✅ Bordes decorativos dobles
- ✅ Gradientes profesionales
- ✅ Tipografía con jerarquía visual
- ✅ Iconos emoji nativos
- ✅ Footer con branding

### 📸 Fotos de Respaldo
- ✅ Subir fotos de facturas en pagos
- ✅ Almacenamiento encriptado
- ✅ Inclusión en comprobantes
- ✅ Compartir por WhatsApp

### 💾 Exportación/Importación
- ✅ Exporta 17 claves de localStorage
- ✅ Incluye TODOS los datos del sistema
- ✅ Importación con validaciones
- ✅ Resumen detallado antes de importar

### 🎯 Menú de Opciones
- ✅ Exportar/Importar base de datos
- ✅ Descargar app offline (ZIP completo)
- ✅ Cambiar colores (6 temas)
- ✅ Información de contacto

## 🚀 Instalación

### Requisitos Previos
- Node.js 18+ y npm
- Navegador moderno (Chrome, Firefox, Edge, Safari)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/control-asistencia-hl.git
cd control-asistencia-hl
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:5173
```

## 📦 Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

## 📱 Uso como App Offline

### Opción 1: PWA (Progressive Web App)
1. Abre la aplicación en Chrome
2. Clic en el menú (⋮)
3. Selecciona "Instalar aplicación"
4. La app se instalará como aplicación nativa

### Opción 2: Descargar ZIP Completo
1. Clic en el menú de 3 puntos (⋮)
2. Selecciona "Descargar App Offline"
3. Descomprime el ZIP
4. Abre `index.html` en tu navegador

## 📊 Estructura del Proyecto

```
control-asistencia-hl/
├── 📄 index.html                    # HTML principal
├── 📄 package.json                  # Dependencias
├── 📄 tsconfig.json                 # Configuración TypeScript
├── 📄 vite.config.js                # Configuración Vite
├── 📄 tailwind.config.js            # Configuración Tailwind
│
├── 📁 src/
│   ├── 📄 main.tsx                  # Punto de entrada
│   ├── 📄 App.tsx                   # Componente principal
│   ├── 📄 index.css                 # Estilos globales
│   ├── 📄 types.ts                  # Tipos TypeScript
│   │
│   ├── 📁 components/               # Componentes React (16)
│   │   ├── BalancePersonal.tsx      # Balance personal completo
│   │   ├── FinancialManager.tsx     # Gestor financiero con IESS
│   │   ├── ProjectionPay.tsx        # Proyección de pagos
│   │   ├── DecimoCuarto.tsx         # Cálculo de décimo
│   │   ├── RecordForm.tsx           # Formulario de registro
│   │   ├── RecordList.tsx           # Lista de registros
│   │   ├── Summary.tsx              # Resumen semanal
│   │   ├── HolidayManager.tsx       # Gestor de feriados
│   │   ├── ProjectionPanel.tsx      # Panel de proyecciones
│   │   ├── WeeklyChart.tsx          # Gráfico semanal
│   │   ├── MonthlyChart.tsx         # Gráfico mensual
│   │   ├── OptionsMenu.tsx          # Menú de opciones
│   │   ├── ThemeSelector.tsx        # Selector de temas
│   │   ├── ContactInfo.tsx          # Información de contacto
│   │   └── WelcomeModal.tsx         # Modal de bienvenida
│   │
│   ├── 📁 hooks/                    # Custom hooks
│   │   └── useAttendanceStorage.ts  # Hook de almacenamiento
│   │
│   └── 📁 utils/                    # Utilidades (6)
│       ├── calculations.ts          # Cálculos generales
│       ├── payCalculations.ts       # Cálculos de pagos
│       ├── monthlyBaseCalculator.ts # Cálculo de bases mensuales
│       ├── cardGenerator.ts         # Generador de fichas elegantes
│       ├── database.ts              # Exportación/importación
│       └── photoEncryption.ts       # Encriptación de fotos
│
└── 📁 public/                       # Archivos públicos
    ├── manifest.json                # Configuración PWA
    └── sw.js                        # Service Worker
```

## 🎯 Funcionalidades Detalladas

### Pestaña 1: Inicio (Registro)
- Selector de semana con navegación
- Numeración ISO de semanas del año
- Cálculo automático de horas
- Detección de fin de semana
- Detección de feriados
- Validación de duplicados
- Fotos de ingreso y salida

### Pestaña 2: Historial
- Lista completa de registros
- Agrupación por semanas
- Filtros por tipo y semana
- Edición y eliminación
- Detección de duplicados

### Pestaña 3: Reportes
- Gráfico semanal de barras
- Gráfico mensual de área
- Proyecciones (semanal, mensual, trimestral)
- Indicadores de progreso

### Pestaña 4: Pago
- Configuración de sueldo base
- Tarifas personalizables (50% y 100%)
- Selector de rango de semanas (52 semanas del año)
- Cálculo automático de extras
- Detalle expandible por semana
- Descuentos automáticos
- Neto a recibir

### Pestaña 5: Finanzas
- **Base de Ingreso Mensual** (Sueldo + Horas Extras)
- **EXTENSION IESS SALUD CONYUGE** (3.41%)
- **APORTE PERSONAL IESS** (9.45%)
- **FONDO DE RESERVA MENSUAL** (8.33%)
- Bonos (fijos, variables, fondo de reserva)
- Descuentos (préstamos, IESS, otros)
- Pagos parciales con historial

### Pestaña 6: Balance
- **Sub-pestaña Balance**: Resumen financiero completo
- **Sub-pestaña Ingresos**: Neto a recibir + ingresos manuales
- **Sub-pestaña Gastos**: Gestión completa de gastos
- **Sub-pestaña Deudas**: Gestión completa de deudas
- Pagos parciales con fotos de respaldo
- Fichas visuales elegantes con sello
- Comprobantes automáticos
- Compartir por WhatsApp
- Auto-renovación de gastos
- Historial de balances mensuales

### Pestaña 7: Décimo
- Ingreso manual de 12 meses
- Cálculo automático del aguinaldo
- Bases mensuales automáticas
- Cambio de mes automático (día 1)
- Gráfico de progreso

## 🔧 Tecnologías Utilizadas

- **React 18.2.0** - Framework de UI
- **TypeScript 5.2.2** - Tipado estático
- **Vite 5.0.8** - Build tool
- **Tailwind CSS 3.4.0** - Framework CSS
- **date-fns 3.0.0** - Manejo de fechas
- **Recharts 2.10.0** - Gráficos interactivos
- **JSZip 3.10.1** - Generación de ZIP
- **FileSaver 2.0.5** - Descarga de archivos

## 📱 Compatibilidad

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Android (Chrome)
- ✅ iOS (Safari)
- ✅ Desktop
- ✅ Tablets
- ✅ Móviles

## 🔒 Seguridad y Privacidad

- ✅ 100% offline después de la primera carga
- ✅ Todos los datos se guardan en localStorage
- ✅ Sin servidores externos
- ✅ Sin APIs externas
- ✅ Fotos encriptadas con cifrado XOR
- ✅ Sin cookies ni tracking

## 📚 Documentación

El proyecto incluye documentación completa:

- `README.md` - Este archivo
- `CHECKPOINT.md` - Estado completo del proyecto
- `CORRECCIONES_BALANCE_FINANZAS.md` - Correcciones recientes
- `INDICE_COMPLETO_PROYECTO.md` - Índice de archivos
- `INSTRUCCIONES_RESTAURACION.md` - Guía de restauración
- `VERIFICACION_COMPLETA.md` - Verificación de funcionalidades

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Creador by Hugo Leon**

- Versión: 1.4.9
- Fecha: 2026-01-15
- Estado: ✅ Completamente Funcional

## 🙏 Agradecimientos

- React Team por el excelente framework
- Vite Team por la herramienta de build
- Tailwind CSS por el framework de estilos
- date-fns por el manejo de fechas
- Recharts por los gráficos interactivos

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:

1. Revisa la documentación en la carpeta del proyecto
2. Abre un issue en GitHub
3. Contacta al programador: Hugo Leon

---

**¡Gracias por usar Control de Asistencia HL!** 🚀

**Creador by Hugo Leon** - Versión 1.4.9 - 2026
