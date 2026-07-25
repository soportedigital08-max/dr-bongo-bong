# CHANGELOG.md — Historial de Cambios

> Nunca borrar entradas anteriores. Más reciente al final.

## 2026-06-08 — Pre-migración
- **Documento**: (externo) XML de WordPress exportado (`drbongobong-programaderadioystreamingcultural.WordPress.2026-06-08.xml`, 1301 ítems, 215 posts reales, 30 categorías).
- **Impacto**: fuente de verdad para la migración.

## 2026-07-18 — Sprint 1: Construcción del sitio nuevo
- **Sprint**: 1
- **Documento**: `app/*`, `components/*`, `lib/*`, `prisma/schema.prisma`, `scripts/migrate-wp.mjs`, `server.js`, `package.json`
- **Descripción**: sitio Next.js 14 desde cero; modelo Prisma (User/Post/Category); migración de 210 posts + 21 categorías; dashboard admin + endpoint `/api/publish` (IA) con API-key.
- **Impacto**: sitio funcional en local, build OK.

## 2026-07-18 — Migración de datos
- **Sprint**: 1
- **Documento**: `prisma/dev.db`, `scripts/migrate-wp.mjs`
- **Descripción**: parseo del XML (no del JSON incompleto); primer intento perdió categorías → reset + re-migración → 210 posts, 21 cats.
- **Impacto**: base con todo el contenido histórico.

## 2026-07-18 — Subida de fuentes al server
- **Sprint**: 1
- **Documento**: `next-premium-site/*` en cPanel (FTP)
- **Descripción**: 38 archivos subidos vía FTP (incl. `prisma/dev.db`, `.env` de producción). Se borró basura de subida de junio (`node_modules`, `collections`, `migrate.*`) por petición del usuario.
- **Impacto**: código listo en el server para deploy.

## 2026-07-18 — Descubrimiento: hosting sin Node.js
- **Sprint**: 1
- **Documento**: `governance/PROJECT_STATE.md` (riesgo)
- **Descripción**: la API y GUI de cPanel de wnpservers NO exponen Node.js. No se puede crear la app por API; requiere GUI + (posiblemente) habilitación por soporte.
- **Impacto**: deploy en vivo bloqueado hasta decisión (ver DECISIONS ID-004).

## 2026-07-19 — Calibración de diseño
- **Sprint**: 1
- **Documento**: `globals.css`, `layout.tsx`, `page.tsx`, `Navbar.tsx`, `PostCard.tsx`, `ScrollReveal.tsx`
- **Descripción**: hero editorial (nota principal real + aura + metadata), grid con portadas tipográficas por categoría (reemplaza 🥁), navbar glass + EN VIVO pulsante, ticker, scroll-reveal seguro, glow/lift, grano. Build OK + captura visual confirmada.
- **Impacto**: sitio se siente "medio de primera".

## 2026-07-19 — Logo bonguito integrado
- **Sprint**: 1
- **Documento**: `public/bonguito-logo.png`, `Navbar.tsx`, `globals.css`
- **Descripción**: primero JPG blanco/negro con `mix-blend-mode: screen`; luego reemplazado por PNG transparente real (`logo bongo-blanco-trasparente.png`, 834×834 RGBA). Se quitó el blend.
- **Impacto**: marca personal "bonguito" visible en navbar con glow rojizo.

## 2026-07-19 — Upgrade de seguridad + fix de ENV
- **Sprint**: 1
- **Documento**: `package.json` (Next 14.2.33), `.env.production` → renombrado a `.env.production.dist`
- **Descripción**: Next 14.2.5 tenía vulnerabilidad; subido a 14.2.33. El `.env.production` se renombró porque Next lo carga en `next start` rompiendo el local. En producción las vars van por GUI del cPanel.
- **Impacto**: build limpio y portable.

## 2026-07-19 — Gobierno del proyecto
- **Sprint**: 1 (cierre)
- **Documento**: `governance/*` (AGENTS, PROJECT_STATE, HANDOFF, PROJECT_MEMORY, CHANGELOG, DECISIONS)
- **Descripción**: creación de la memoria persistente del proyecto, independiente del chat.
- **Impacto**: cualquier IA puede continuar leyendo solo la documentación.
