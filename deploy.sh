#!/bin/bash
# Deploy Dr Bongo Bong — correr en el Terminal de cPanel tras "Update" de Git Version Control.
# No hace falta subir ZIP ni descomprir: solo trae los cambios y recompila.
set -e

APP=/home/drbongob/NodeJS-TestApp
STATIC_WEB=/home/drbongob/public_html/_next/static

cd "$APP"

echo "==> 1) Traer cambios de GitHub"
git pull origin main || echo "(clon fresco: ya estaban)"

echo "==> 2) Instalar dependencias"
npm install

echo "==> 3) Build de produccion"
npm run build

echo "==> 4) Copiar _next/static donde los sirve Nginx"
rm -rf "$STATIC_WEB"
cp -a "$APP/.next/static/." "$STATIC_WEB/"
cp -a "$APP/.next/static/." "$APP/.next/standalone/.next/static/"

echo "========================================================="
echo "Deploy listo. Ahora en cPanel:"
echo "  Node.js App Manager -> Stop -> esperar 30s -> Start"
echo "Verificar: https://drbongobong.com.ar/posts (Ctrl+F5)"
echo "========================================================="
