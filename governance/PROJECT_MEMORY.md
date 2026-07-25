# PROJECT_MEMORY.md — Memoria Conceptual

> Ideas, filosofías, hipótesis, aprendizajes. NO es documentación técnica.

## Filosofía del medio
- **"El latido del mundo"**: el sitio debe sentirse vivo, no un blog estático. Por eso el botón "EN VIVO" y la radio son centrales, no un apéndice.
- **Medio de primera, no template**: el usuario quiere que se perciba autoridad editorial (tipografía display grande, jerarquía clara, acento rojo como "sangre" de marca).
- **Identidad con personaje**: el "bonguito" (fedora, anteojos, barba) es la marca personal del director. Su presencia en el navbar refuerza "un medio con voz propia".

## Conceptos de diseño acordados
- **Hero editorial**: la nota principal debe ser GRANDE y real (no placeholder), con metadata (categoría, autor, tiempo de lectura).
- **Portada por categoría**: en lugar de imagen rota (🥁) o placeholder de stock, usar gradiente determinista por slug + inicial de categoría. Se ve "diseñado", no "wireframe".
- **Dinamismo seguro**: scroll-reveal, glow, lift en hover, aura animada. PERO: el reveal debe ser seguro (si el JS falla, todo se ve igual). Aprendizaje: la primera versión rompió porque `.reveal` arrancaba en `opacity:0` y el observer no disparaba → grid invisible. Solución: `html.js .reveal` oculta solo con JS, con fallback `setTimeout` que fuerza visibilidad.
- **Grano sutil** (`grain`) da textura de "papel/medio" sin saturar.

## Hipótesis
- Un sitio que "respira" (aura, ticker, reveal) transmite más autoridad que uno estático, sin sacrificar rendimiento (todo es CSS, sin JS pesado).
- La migración de 210 posts SÍ es viable desde el XML oficial de WordPress (no del JSON incompleto).

## Aprendizajes (errores evitados)
- Next 14 carga `.env.production` SIEMPRE en `next start`, no solo con NODE_ENV=production. Eso rompía el local (apuntaba a ruta de server). Fix: renombrar a `.env.production.dist`; en producción las vars van por la GUI del cPanel, no por archivo.
- `onError` en `<img>` no se puede pasar en Server Component → debe ir en Client Component o quitarse.
- El FTP de este hosting no permite `DELE`/`RMD` por `-Q` ni listar con `LIST`; `STOR` (subir) sí funciona. Para borrar basura vieja, el usuario lo hace por el Administrador de Archivos del cPanel.
- La API de cPanel de este hosting NO expone Node.js (probeado: NodeJS, nodejsselector, CloudLinux, Passenger → todos "Failed to load module"). La app se crea SOLO por GUI.

## Frases / voz del medio
- "El latido del mundo. Radio en vivo, streaming cultural y artículos sobre música, cultura y exploración de la mente humana."
- "conectando corazones a través del arte".

## Restricciones conceptuales
- NO tocar WordPress hasta verificar el nuevo sitio (preservar 210 posts vivos).
- El usuario opera en Argentina (UTC-3), responder en español.
- El usuario NO quiere "pesadas/expensive features" diferidas si el costo de tokens/tiempo es alto (preferencia declarada).

## Visiones futuras
- Dashboard multi-autor (varias personas registradas desde sus celulares en la red local) — diferido por ahora.
- Endpoint de IA como "redactor asistente" que genera borradores desde titulares.
- Migración de imágenes reales de WP para que las tarjetas no sean solo tipográficas.
