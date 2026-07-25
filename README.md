# Dr Bongo Bong — Sitio nuevo (Next.js 14 + Prisma + SQLite)

## Stack
- Next.js 14 (App Router) + React 18
- Prisma + SQLite (base en `prisma/dev.db`)
- Tailwind CSS (tema dark "Premium")
- Auth: JWT (bcrypt) para el dashboard `/admin`
- Endpoint de IA: `POST /api/publish` con header `x-api-key: $PUBLISH_KEY`

## Estructura
- `app/` — páginas (home, posts, categorías, radio, admin, api)
- `components/` — Navbar, Footer, PostCard, Editor
- `lib/` — db (Prisma), auth (JWT), utils
- `prisma/schema.prisma` — modelo User / Category / Post
- `scripts/` — `migrate-wp.mjs` (XML de WordPress → SQLite), `seed.mjs` (admin + cats)
- `server.js` — entry point para Passenger (cPanel Node.js App)

## Comandos locales
```
npm install
npx prisma generate
npm run build
npm run start      # producción en :3000
```

## Migrar contenido de WordPress
```
node scripts/migrate-wp.mjs ../drbongobong-programaderadioystreamingcultural.WordPress.2026-06-08.xml
```
Usuario admin por defecto (seed): admin@drbongobong.com.ar / BongoBong2026!

## Despliegue en cPanel (Setup Node.js App)
- Application root: `next-premium-site`
- Application domain: `drbongobong.com.ar`
- Node.js version: 20
- Startup file: `server.js`
- ENV vars:
  - NODE_ENV=production
  - DATABASE_URL=file:/home/drbongob/next-premium-site/prisma/dev.db
  - JWT_SECRET=(ver .env.production)
  - PUBLISH_KEY=(ver .env.production)
  - SITE_URL=https://drbongobong.com.ar
- Pasos: Run NPM Install → Build (npm run build) → Restart

## Notas
- NO tocar `public_html/` (WordPress vivo) hasta verificar el nuevo sitio.
- Las imágenes destacadas de WordPress NO se migraron (quedan en wp-content/uploads);
  las tarjetas sin imagen muestran placeholder 🥁. Mejora pendiente: copiar uploads a /public.
