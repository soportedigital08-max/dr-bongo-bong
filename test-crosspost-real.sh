#!/usr/bin/env bash
# Test de cross-post REAL a Meta (DR Bongo Bong) - PUBLICA en IG + FB
# OJO: esto publica de verdad. Usa un slug de prueba y luego borra el post.
# Reemplaza TU_KEY_AQUI por el valor de PUBLISH_KEY de cPanel.
# Imagen real del sitio (NO og.png que da 404).
curl -s "https://drbongobong.com.ar/api/social/crosspost" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: TU_KEY_AQUI" \
  -d '{"slug":"prueba-crosspost","title":"Prueba de cross-post DR Bongo Bong","excerpt":"Test de integracion","featuredImage":"https://drbongobong.com.ar/bonguito-logo.png","category":"cultura"}'
echo
