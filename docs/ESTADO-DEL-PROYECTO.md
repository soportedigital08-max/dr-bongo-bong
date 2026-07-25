# Dr Bongo Bong — Estado del Proyecto

> Última actualización: 24 de julio de 2026
> Sitio: https://drbongobong.com.ar
> Stack: Next.js 14 (App Router) + Prisma + SQLite + cPanel (Passenger/Node 24)

---

## 1. Arquitectura en producción

| Componente | Ubicación / Valor |
|---|---|
| App root | `/home/drbongob/NodeJS-TestApp` |
| Entrypoint Passenger | `test_app.js` (chdir + require absoluto a `.next/standalone/server.js`) |
| Build standalone | `/home/drbongob/NodeJS-TestApp/.next/standalone/` |
| Base de datos | SQLite `prisma/dev.db` (210 posts, 6 usuarios) |
| Assets estáticos | copia física en `/home/drbongob/public_html/_next/static/` |
| Imágenes de portadas | `/home/drbongob/public_html/portadas/2024|2025|2026/` (directorios reales) |
| Compat WordPress | symlinks internos `wp-content/uploads/202X -> ../../portadas/202X` |
| Log de la app | `/home/drbongob/log_julio_dr.log` |
| Node | v24 vía `nodevenv/NodeJS-TestApp/24/` |

### Variables de entorno (en .htaccess, bloque CloudLinux)
- `DATABASE_URL=file:/home/drbongob/NodeJS-TestApp/prisma/dev.db`
- `JWT_SECRET` (⚠️ rotar: quedó expuesto en chats)
- `PUBLISH_KEY` (⚠️ rotar: quedó expuesto en chats)
- `NODE_ENV=production`
- `SITE_URL=https://drbongobong.com.ar`

---

## 2. Reglas del hosting (WNPower cPanel) — APRENDIDAS A FUERZA DE ERRORES

1. **Nginx no sigue symlinks fuera de `public_html`** → todo lo que Nginx sirve directo debe ser **copia física** dentro de `public_html/`.
2. **`_next/static/` debe recopiarse tras CADA build** (los hashes cambian):
   ```bash
   rm -rf /home/drbongob/public_html/_next/static
   cp -a /home/drbongob/NodeJS-TestApp/.next/static/. /home/drbongob/public_html/_next/static/
   cp -a /home/drbongob/NodeJS-TestApp/.next/static/. /home/drbongob/NodeJS-TestApp/.next/standalone/.next/static/
   ```
3. **Mismatch de hashes** entre HTML y chunks = `ChunkLoadError` + "Application error" en el navegador.
4. **`.htaccess`**: contiene bloques Passenger/env que NO se tocan. Se eliminó un bloque manual de proxy a `127.0.0.1:3000` que rompía la raíz; se agregó `DirectoryIndex disabled` para que `/` llegue a Passenger.
5. **No debe existir `index.html`/`index.php` en `public_html/`** (interceptaban la raíz).
6. **Deploy eficiente**: comprimir `.next` en ZIP (7-Zip), subir por Administrador de Archivos de cPanel, verificar con `unzip -t`, extraer con `unzip -o`.
7. Al pasar hashes bcrypt por bash: **nunca entre comillas dobles** (expande `$`). Escribir SQL a archivo y usar `sqlite3 db < archivo.sql`.

---

## 3. Estado funcional (24-jul-2026)

| Item | Estado |
|---|---|
| `/` con portadas reales | ✅ |
| `/posts` (210 artículos con portadas) | ✅ |
| `/categories` | ✅ |
| `/posts/[slug]`, `/categories/[slug]` | ✅ |
| Logo y favicon | ✅ |
| Login dashboard (`/admin/login`) | ✅ admin operativo |
| `/radio` | ⏳ carga pero falta configurar streaming |
| Publicación vía IA (`POST /api/publish`) | ✅ endpoint existe, falta prueba end-to-end |

### featuredImage en DB
- 165 posts con imagen real extraída del content (script `scripts/asignar-portadas-db.mjs`, indexa `/home/drbongob/public_html/portadas`)
- 45 posts con genérica `/portadas/bonguito-logo.png`

### Usuarios (tabla User)
- `admin@drbongobong.com.ar` (admin) — contraseña reseteada 24-jul (⚠️ cambiarla: quedó en chat)
- 5 autores: drbongobong, Frikinosis, aledanke, Esteban Baldomar, Lautaro

---

## 4. API para IA (AI Publishing Bridge)

`POST https://drbongobong.com.ar/api/publish`
- Header: `x-api-key: <PUBLISH_KEY>`
- Body JSON: `{ title, content, excerpt?, slug?, categoryId?, authorId?, featuredImage?, isAIContent? }`
- Crea post con `status: published` y `publishedAt: now`.

Endpoints adicionales: `/api/posts` (CRUD), `/api/categories`, `/api/auth/login`.

---

## 5. Pendientes (orden acordado)

1. ~~Portadas del inicio~~ ✅ RESUELTO (era `index.html` viejo + reglas manuales en `.htaccess`)
2. **Radio**: configurar streaming en `/radio` (no prioritario)
3. **Dashboard**: ✅ acceso OK. Pendiente de seguridad:
   - Rotar `JWT_SECRET` y `PUBLISH_KEY`
   - Cambiar contraseña del admin (quedó en chat)
   - (Opcional) rate-limit en login
4. **IA**: prueba end-to-end de `POST /api/publish` + definir flujo automático (cron/Hermes)

---

## 6. Rutina de deploy (referencia rápida)

1. Local: `npm run build` en `D:\contenido para dr bongo bong\next-premium-site`
2. Comprimir `.next` → ZIP (7-Zip)
3. Subir ZIP por Administrador de Archivos a `/home/drbongob/NodeJS-TestApp/`
4. Servidor: `unzip -t` (verificar) → `rm -rf .next && unzip -o <zip>`
5. Recopiar static (comandos del punto 2 de "Reglas del hosting")
6. Node.js App Manager: Stop → 30 s → Start
7. Verificar: hash del HTML == archivo en disco:
   ```bash
   curl -s https://drbongobong.com.ar/posts | grep -o 'src="/_next/static/chunks/app/posts/[^"]*"'
   ls /home/drbongob/public_html/_next/static/chunks/app/posts/
   ```
