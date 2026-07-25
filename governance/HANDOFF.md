# HANDOFF.md — Entrega a la próxima IA

> Actualizado al cierre del Sprint 1 (2026-07-19).

## Qué se hizo (Sprint 1)
- Se construyó desde cero el sitio nuevo en Next.js 14 (App Router): home, `/posts`, `/posts/[slug]`, `/categories`, `/categories/[slug]`, `/radio`, `/admin` (login, nueva, editar), y APIs (`/api/auth/login`, `/api/posts`, `/api/posts/[id]`, `/api/categories`, `/api/publish`).
- Se migraron **210 posts + 21 categorías** desde el XML de WordPress (`drbongobong-programaderadioystreamingcultural.WordPress.2026-06-08.xml`) a SQLite vía `scripts/migrate-wp.mjs`. Usuario admin sembrado: `admin@drbongobong.com.ar` / `BongoBong2026!`.
- El build compila OK (12 rutas; Next 14.2.33 por parche de seguridad).
- Se calibrró el diseño (ver PROJECT_MEMORY y DECISIONS ID-003): hero editorial, grid con portadas tipográficas por categoría, navbar glass con logo "bonguito" (PNG transparente en `public/bonguito-logo.png`), ticker, scroll-reveal seguro, glow/lift.
- Se subieron las 38 fuentes a `next-premium-site/` en el server vía FTP. Se borró la basura de la subida de junio (`node_modules`, `collections`, `migrate.*`) por petición del usuario.
- Se creó `/governance` con los 6 documentos oficiales.

## Qué quedó aprobado
- Stack Next.js 14 + Prisma + SQLite (NO Payload CMS). Ver DECISIONS ID-001.
- Diseño "mantener la línea actual pero subirla" (Opción 4 del clarify). Ver DECISIONS ID-003.
- Logo bonguito PNG transparente integrado en navbar (sin `mix-blend-mode`).
- Fuentes en server listas para deploy.

## Qué quedó pendiente
- **Deploy en vivo**: el cPanel NO tiene Node.js. Requiere (a) ticket del usuario a soporte pidiendo habilitar Node.js, y (b) creación de la Node.js App por GUI (root `next-premium-site`, dominio `drbongobong.com.ar`, Node 20, startup `server.js`, + 5 ENV vars).
- Desactivar WordPress solo TRAS verificar el nuevo sitio.
- Migrar imágenes de WP (`wp-content/uploads`) a `/public`.
- Rotar credenciales antes de producción.

## Decisiones tomadas
Ver `DECISIONS.md`: ID-001 (stack), ID-002 (XML sobre JSON), ID-003 (dirección estética), ID-004 (3 opciones de deploy ante falta de Node.js).

## Documentos modificados en este Sprint
- `globals.css`, `layout.tsx`, `page.tsx`, `Navbar.tsx`, `PostCard.tsx`, `ScrollReveal.tsx` (diseño).
- `package.json` (Next 14.2.33, `postinstall: prisma generate`).
- `prisma/dev.db` (210 posts).
- `public/bonguito-logo.png` (nuevo).
- `/governance/*` (nuevos).

## Documentos que deberán revisarse primero
1. `PROJECT_STATE.md` (dónde estamos).
2. `DECISIONS.md` (restricciones: no tocar WordPress, no asumir Node.js).
3. `README.md` (comandos y estructura).

## Qué deberá hacerse inmediatamente después
- Si el usuario confirmó que soporte habilitó Node.js: crear la app en cPanel GUI, Run NPM Install, Run NPM Build (`npm run build`), Restart, y verificar con `curl` que `drbongobong.com.ar` sirve Next (`_next/`) y no WordPress (`wp-content`).
- Si soporte NO habilita Node.js: evaluar Opción A (estática, ver ID-004) o cambio de hosting (Opción C).
