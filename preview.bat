@echo off
cd /d "%~dp0"
if not exist ".next\standalone\server.js" (
  echo Construyendo build de produccion...
  call npm run build
)
echo Copiando static...
if not exist ".next\standalone\.next\static" mkdir ".next\standalone\.next\static"
xcopy /E /Y /Q ".next\static\*" ".next\standalone\.next\static\" >nul
if not exist "public" mkdir "public"
echo Servidor local en http://localhost:4500  (Ctrl+C para cerrar)
set PORT=4500
node ".next\standalone\server.js"
