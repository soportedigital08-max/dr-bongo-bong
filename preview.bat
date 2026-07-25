@echo off
REM =========================================================
REM PREVISUALIZAR DR BONGO BONG (local, SIN tocar el servidor)
REM Usa el build de producción (estable, sin hot-reload corrupto).
REM El sitio de cPanel queda APAGADO hasta que subamos.
REM Para cerrar: Ctrl+C en esta ventana.
REM =========================================================
cd /d "%~dp0"
if not exist ".next\standalone\server.js" (
  echo [1/3] Construyendo build de producción (puede tardar 1-3 min)...
  call npm run build
) else (
  echo [1/3] Build ya existe. Para reconstruir: borra .next y volve a correr.
)
echo [2/3] Copiando static...
if not exist ".next\standalone\.next\static" mkdir ".next\standalone\.next\static"
xcopy /E /Y /Q ".next\static\*" ".next\standalone\.next\static\" >nul
if not exist "public" mkdir "public"
echo [3/3] Servidor local en http://localhost:4400  (Ctrl+C para cerrar)
set PORT=4400
node ".next\standalone\server.js"
