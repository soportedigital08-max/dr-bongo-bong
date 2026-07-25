# DECISIONS.md — Registro de Decisiones Estratégicas

> Nunca modificar una decisión aprobada. Solo agregar nuevas o marcar reemplazos.

---

## ID-001 — Stack del sitio nuevo
- **Fecha**: 2026-07-18
- **Título**: Next.js 14 + Prisma + SQLite (rechazar Payload CMS)
- **Contexto**: se evaluó Payload CMS (MySQL, config incompleta de la subida de junio) vs Next.js propio.
- **Decisión**: Next.js 14 App Router + Prisma 5 + SQLite. Dashboard admin propio + endpoint `/api/publish` con API-key.
- **Justificación**: Payload requiere MySQL y su config de junio estaba rota; SQLite + Prisma es autónomo y portable en hosting compartido.
- **Impacto**: definió toda la arquitectura. El usuario aprobó implícitamente al decir "subí los fuentes y creá la app".
- **Estado**: APROBADA
- **Documentos afectados**: `package.json`, `prisma/schema.prisma`, `lib/db.ts`, `app/api/publish/route.ts`

---

## ID-002 — Fuente de migración
- **Fecha**: 2026-07-18
- **Título**: Migrar desde XML oficial de WordPress, no desde JSON
- **Contexto**: había un `wp_content_extracted.json` incompleto y el XML oficial completo.
- **Decisión**: usar el XML (`drbongobong-...Wordpress.2026-06-08.xml`) como fuente.
- **Justificación**: el JSON no traía todas las categorías ni el cuerpo completo.
- **Impacto**: migración correcta de 210 posts + 21 cats.
- **Estado**: APROBADA
- **Documentos afectados**: `scripts/migrate-wp.mjs`

---

## ID-003 — Dirección estética del diseño
- **Fecha**: 2026-07-19
- **Título**: Mantener la línea actual pero subirla (Opción 4)
- **Contexto**: el usuario pidió "modernizar, más dinámico, medio de primera" sin definir rumbo. Se ofrecieron 4 opciones (editorial, neo-brutalist, tech/streaming, mantener+subir).
- **Decisión**: Opción 4 — mantener dark + acento rojo + glass, y subirlo: hero editorial con nota real, portadas tipográficas por categoría, navbar con bonguito, ticker, glow/lift, scroll-reveal seguro.
- **Justificación**: coherencia con la base ya validada; menor riesgo que un giro estético total.
- **Impacto**: diseño calibrado y aprobado visualmente.
- **Estado**: APROBADA
- **Documentos afectados**: `globals.css`, `page.tsx`, `Navbar.tsx`, `PostCard.tsx`, `ScrollReveal.tsx`

---

## ID-004 — Estrategia de deploy ante falta de Node.js en el hosting
- **Fecha**: 2026-07-18
- **Título**: 3 opciones para dejar el sitio funcionando sin Node.js en cPanel
- **Contexto**: el cPanel de wnpservers NO expone Node.js (probeado por API y GUI). El usuario eligió pedir habilitación a soporte.
- **Decisión**:
  - **Opción B (elegida)**: ticket a soporte pidiendo Node.js (CloudLinux Node.js Selector, Node 20, Passenger). La IA redacta, el usuario envía.
  - **Opción A (contingencia)**: generar build estático (`output: 'export'`) y subir a `public_html/` — sitio público anda, PERO se pierden dashboard/IA dinámicos.
  - **Opción C (si B falla)**: cambio de hosting a uno con Node.js.
- **Justificación**: B es lo ideal (mantiene dashboard + IA); A es el plan de respaldo si soporte dice que no.
- **Impacto**: define el Sprint 2. Mientras soporte no responde, el sitio NO se deploya en vivo.
- **Estado**: APROBADA (B en curso; A y C como contingencia)
- **Documentos afectados**: `PROJECT_STATE.md` (riesgo 1), `HANDOFF.md` (pendiente deploy)

---

## ID-005 — Tratamiento de imágenes de WordPress
- **Fecha**: 2026-07-19
- **Título**: portada tipográfica por categoría en lugar de placeholder
- **Contexto**: las 210 notas migradas NO tienen `featuredImage` (el XML no las traía); el placeholder 🥁 se veía "wireframe".
- **Decisión**: tarjetas sin imagen muestran gradiente determinista por slug + inicial de categoría. El hero usa gradiente editorial + aura (sin depender de red externa).
- **Justificación**: se ve diseñado, no roto. Mejora futura: copiar `wp-content/uploads` a `/public`.
- **Impacto**: grid se ve profesional sin imágenes reales.
- **Estado**: APROBADA (mejora de imágenes reales pendiente)
- **Documentos afectados**: `PostCard.tsx`, `page.tsx`
