@echo off
REM Script de Actualización del Repositorio para Windows
REM Control de Asistencia HL - Versión 1.4.9
REM Creador by Hugo Leon

echo ==========================================
echo   ACTUALIZACIÓN DEL REPOSITORIO
echo   Control de Asistencia HL v1.4.9
echo ==========================================
echo.

REM Verificar si estamos en un repositorio git
if not exist .git (
    echo ❌ Error: No se encontró un repositorio git
    echo    Inicializa el repositorio con: git init
    pause
    exit /b 1
)

echo 📋 Paso 1: Verificar cambios...
git status
echo.

echo 📝 Paso 2: Agregar todos los cambios...
git add .
echo.

echo 📊 Paso 3: Verificar archivos a commitear...
git status
echo.

set /p continuar="¿Deseas continuar con el commit? (s/n): "
if /i not "%continuar%"=="s" (
    echo ❌ Operación cancelada
    pause
    exit /b 0
)

echo.
echo 💾 Paso 4: Crear commit...
set /p mensaje="Mensaje del commit (por defecto: 'Actualización v1.4.9 - Balance y Finanzas completas'): "
if "%mensaje%"=="" set mensaje="Actualización v1.4.9 - Balance y Finanzas completas"
git commit -m %mensaje%
echo.

echo 🚀 Paso 5: Push al repositorio remoto...
set /p hacer_push="¿Deseas hacer push ahora? (s/n): "
if /i "%hacer_push%"=="s" (
    set /p rama="Nombre de la rama (por defecto: main): "
    if "%rama%"=="" set rama=main
    git push origin %rama%
    echo.
    echo ✅ ¡Push completado exitosamente!
) else (
    echo ⏸️  Push omitido. Puedes hacerlo manualmente con: git push origin main
)

echo.
echo ==========================================
echo   ✅ ACTUALIZACIÓN COMPLETADA
echo ==========================================
echo.
echo 📊 Resumen:
echo    - Cambios agregados al staging
echo    - Commit creado: %mensaje%
if /i "%hacer_push%"=="s" (
    echo    - Push realizado a la rama: %rama%
)
echo.
echo 🔗 Próximos pasos:
echo    1. Verifica tu repositorio en GitHub/GitLab
echo    2. Si es necesario, crea un Pull Request
echo    3. Actualiza la documentación si es necesario
echo.
echo 📞 Soporte:
echo    Programador: Hugo Leon
echo    Versión: 1.4.9
echo.
pause
