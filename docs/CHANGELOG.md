# Registro de cambios — Dr Bongo Bong

> **REGLA DEL PROYECTO**: todo cambio (código, servidor, DB, config) DEBE registrarse en este archivo en el momento en que se hace, con fecha, motivo y evidencia de verificación. Sin excepciones.

Formato: fecha — cambio — motivo — evidencia de verificación.

---

## 2026-07-24

### Migración estabilizada (resumen de la jornada)
- **DB**: reasignadas portadas de los 210 posts (165 reales + 45 genéricas) con `scripts/asignar-portadas-db.mjs` apuntando a `/home/drbongob/public_html/portadas`. Verificado: `SELECT COUNT(featuredImage) FROM Post` → 210.
- **Build**: nuevo build con `export const revalidate = 0` en `app/page.tsx`. Subido como ZIP (32 MB), verificado con `unzip -t` (No errors detected).
- **Assets**: recopiado `_next/static/` a `public_html/` y a `standalone/.next/static/`. Verificado: hash `page-1bab8567faa18583.js` coincide HTML ↔ disco.
- **`.htaccess`**: eliminado bloque manual de proxy a `127.0.0.1:3000` (rompía la raíz); agregado `DirectoryIndex disabled` + HTTPS redirect. Backup: `.htaccess.bak-*`.
- **`public_html/`**: eliminado `index.html` viejo; `index.php` renombrado a `index.php.bak`.
- **Resultado**: `/` sirve el build actual con portadas reales. Todas las rutas 200.
- **Admin**: contraseña de `admin@drbongobong.com.ar` reseteada vía bcrypt + SQL por archivo (`/tmp/fix.sql`). Login verificado por el usuario.

### Decisiones
- Toda modificación de aquí en más se documenta en `docs/` (este archivo + ESTADO-DEL-PROYECTO.md).
- Los symlinks quedan prohibidos para contenido servido por Nginx (regla del hosting).

### Deuda de seguridad (pendiente)
- [ ] Rotar `JWT_SECRET` y `PUBLISH_KEY` (expuestos en chat)
- [ ] Cambiar contraseña admin nuevamente (expuesta en chat)

### Mejoras dashboard + artículos (build local, pendiente de deploy)
- `admin/page.tsx`: manejo de errores visible en Borrar (alert con HTTP), `cache:'no-store'` en fetchPosts. Verificado antes: DELETE llega a la app (401 sin token); el fallo del botón era JS viejo por chunks desfasados.
- `api/posts` GET: header `Cache-Control: no-store` (los cambios no se veían en tiempo real en el panel).
- **Embeds** (`lib/embeds.ts` + `posts/[slug]`): URLs sueltas de YouTube / Spotify / Instagram / X / Facebook pegadas en un párrafo se convierten en incrustados server-side al renderizar.
- **CSS artículos** (`globals.css .prose-content`): tipografía más legible, imágenes con sombra y centradas, blockquotes, listas con markers en acento, tablas, y estilos responsive para todos los embeds (16:9 para video).
- **Subida de imágenes** (`/api/upload` + `Editor.tsx`): botones "📁 Subir imagen" (portada, con vista previa) e "📁 Insertar imagen" (contenido). Guarda en `/home/drbongob/public_html/portadas/uploads/` (servido por Nginx como `/portadas/uploads/...`). JWT requerido, máx 8 MB, JPG/PNG/WebP/GIF/AVIF, nombres saneados.
- Corregidos 3 headers Authorization corruptos (`*** ${token}`) en Editor.tsx y admin/page.tsx.
- Build verificado: exit 0, 13 rutas (nueva: /api/upload).

### Flujo de edición completo (build local, pendiente de deploy)
- **Limpieza WordPress**: `cleanWordPressArtifacts()` en `lib/embeds.ts` remueve shortcodes Divi (`[et_pb_*]`), `[caption]`, comentarios Gutenberg y `<p>` vacíos. Se aplica: (a) server-side al renderizar todo artículo (los 210 viejos se ven limpios sin tocar la DB), (b) al cargar contenido en el editor (editás HTML limpio).
- **Editor**: botón "👁 Vista previa" (modal con estilos reales `.prose-content`), tras guardar aparecen "Ver nota ↗" y "Volver al panel"; botón principal dice Publicar/Guardar borrador según estado; ya no redirige solo al guardar.
- **Dashboard**: enlace "Ver" en cada fila (abre el artículo en pestaña nueva).
- **Botón flotante "✏️ Editar"** (`AdminEditButton.tsx`) en todo artículo público, visible solo con sesión admin (localStorage dbb_token) → edición directa sin pasar por el dashboard.
- Build verificado: exit 0.

### Editor v2: limpieza profunda WP + imágenes pro (build local, pendiente de deploy)
- **Limpieza WP ampliada** (`cleanWordPressArtifacts`): ahora también convierte `<figure class="wp-block-embed...">URL</figure>` en `<p>URL</p>` (que processEmbeds vuelve iframe), dedup de URLs repetidas (URL suelta + figura con la misma URL), remueve wrappers Gutenberg vacíos y colapsa saltos de línea múltiples. Los artículos viejos se ven limpios al renderizar Y al editar.
- **Insertar imagen en el cursor** (no al final): `insertAtCursor()` respeta la posición de edición.
- **Drag & drop de imágenes** sobre el textarea del contenido (se sube y se inserta donde soltás) + **pegar imagen con Ctrl+V**.
- **Normalización automática de imágenes** (`resizeImage()` client-side): toda imagen subida se redimensiona a máx 1600px y se recomprime a JPEG calidad 0.85 antes de subir (GIFs animados exentos; si ya es <1600px y <500KB va tal cual). Peso y dimensiones uniformes sin importar el original.
- Verificación: `npm run build` exit 0, 17 rutas.
- Pendiente de investigar tras deploy: usuario reporta que el botón ✏️ Editar no aparecía en artículos (probable cache HTML con chunks viejos; retest con Ctrl+F5 tras este deploy).

### Sesión visible + fix botón Editar en viejos + CSS unificado (build local, pendiente de deploy)
- **Navbar (`components/Navbar.tsx`)**: ahora lee `localStorage.dbb_token` y muestra "● Sesión activa" + enlaces "Nueva nota" / "Panel" / "Salir" cuando hay sesión; oculta "Admin" si no. El indicador usa `.session-pill` (punto pulsante verde). Escucha evento `storage` para reaccionar al logout en otra pestaña.
- **Fix botón Editar en artículos viejos**: el problema era que `/posts/[slug]` se generaba estático (prerender) y los HTML viejos no incluían el cliente component. Agregado `export const revalidate = 0` (junto al `force-dynamic` ya existente) → el artículo siempre se hidrata en el cliente y el botón ✏️ aparece en TODOS (nuevos y viejos). Confirmado por build: `/posts/[slug]` bajó de 552 B → 447 B (force-dynamic, sin prerender).
- **Insertar imagen en el cursor / drag & drop / Ctrl+V**: ya en build previo (`insertAtCursor`, `handleContentDrop`, `handleContentPaste`). La imagen se ubica donde está el cursor o donde se suelta.
- **Normalización de imágenes** (`resizeImage`): máx 1600px + JPEG 0.85 antes de subir; uniforme en peso/dimensiones.
- **Sistema CSS unificado** (`globals.css`): ancho de columna común 720px para hero/portada/contenido (`.article-hero`, `.article-cover`, `.prose-content`), título con tipografía display + separador en acento (`.article-hero::after`), `.session-pill` y `.admin-edit-fab` con estilos de marca. Todos los artículos comparten el mismo lineamiento.
- Verificación: `npm run build` exit 0, 17 rutas. `/posts/[slug]` 447 B (dinámico).
- **NOTA deploy crítica**: como antes había artículos prerenderizados en `public_html/_next/static/chunks/app/posts/...`, tras este deploy hay que limpiar esa caché (borrar `public_html/_next` y volver a copiar `chunks/app/posts` del build) para que los viejos dejen de servir HTML estático sin botón.

### Editor TipTap (WYSIWYG tipo WordPress) — build local, pendiente de deploy
- **Dependencias**: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link` (npm install, 67 paquetes, React 18 OK).
- **Nuevo `components/RichEditor.tsx`**: editor enriquecido visual. Toolbar con Negrita/Cursiva/H2/H3/Listas/Cita/Link/Imagen/Video. La imagen se ve **en línea mientras escribís** (no como código). Sube con botón 🖼, **drag & drop** o **Ctrl+V** directo en el cuerpo; se redimensiona a 1600px/JPEG 0.85 antes de subir (`resizeImage`). Inserta donde está el cursor. Los videos se agregan como URL en un párrafo y `processEmbeds` los incrusta al publicar.
- **`components/Editor.tsx`**: reemplazó el `<textarea>` por `<RichEditor value onChange>`. Guarda HTML estándar (compatible con las 210 notas viejas, no requiere migración). El botón "📁 Insertar imagen" viejo se convirtió en "📁 Imagen de portada" arriba.
- **CSS**: bloque `.tiptap-content` en `globals.css` (tipografía, imágenes visuales con sombra, placeholder "Escribí tu nota aquí…").
- **Verificación**: `npm run build` exit 0. `/admin/new` y `/admin/edit/[id]` subieron a 145 B + 197 kB First Load JS (TipTap incluido).
- **Bug conocido a confirmar tras deploy**: botón ✏️ Editar y pill "Sesión activa" NO aparecen en artículos viejos (sí en nuevos). Causa probable: caché de `public_html/_next` de un build anterior. Fix: tras extraer, borrar `public_html/_next` y recopiar `chunks/app/posts` del build nuevo (incluido en rutina de deploy).

### Deploy 2026-07-25 (build limpio con standalone completo)
- **Root cause del 500 anterior**: el `.next` local estaba desactualizado y NO tenía `standalone/` (el build previo no completó el standalone). Se reconstruyó limpio (`rm -rf .next && npm run build`); confirmado `server.js` + `node_modules` en `.next/standalone/`.
- **Rutina de deploy corregida**: (1) ZIP de `.next` en PC (~30-40 MB por incluir node_modules); (2) subir por Admin cPanel; (3) `unzip -t` PRIMERO, luego `rm -rf .next`, luego `unzip -o`, luego borrar ZIP; (4) recopiar static a `public_html/_next/static` y a `standalone/.next/static`; (5) limpiar cache `chunks/app/posts`; (6) `mkdir -p portadas/uploads`; (7) Stop/Start en Node.js App Manager; (8) probar con Ctrl+F5.
- **Verificación build local**: `npm run build` exit 0, 17 rutas, `/admin/new`+`/admin/edit` 197 kB (TipTap), `/posts/[slug]` 447 B (dinámico + botón Editar).
- Ver `docs/ESTRATEGIA-CONTENIDO.md` y `docs/AUTOMATIZACION.md`.

### SEO on-site + monetización (parte que NO requiere cuentas del usuario) — 2026-07-25
- **`app/layout.tsx`**: metadata ampliado con `metadataBase`, `title.template` ("%s — Dr Bongo Bong"), `keywords`, `authors`, `openGraph` (es_AR), `twitter` card, `robots`. Base para Rich Results y compartir en redes.
- **`app/posts/[slug]/page.tsx`**: JSON-LD `Article` schema (headline, image, dates, author, publisher, mainEntityOfPage) → habilita rich snippets en Google.
- **`app/sitemap.ts`**: sitemap dinámico (home, /posts, /categories, /radio + todos los posts publicados + categorías), `force-dynamic`.
- **`app/robots.ts`**: permite `/`, bloquea `/admin` y `/api`, apunta al sitemap.
- **`components/SupportButton.tsx`** (Cafecito.me): botón de mecenazgo estética limpia (footer grande + compacto en copyright). URL placeholder `cafecito.app/drbongobong` → usuario debe cambiarla por su usuario real.
- **`components/Footer.tsx`**: integra `SupportButton` (footer + barra inferior).
- **Verificación**: `npm run build` exit 0; nuevas rutas `/robots.txt` y `/sitemap.xml` generadas.
- **Pendiente (requiere usuario)**: (1) crear Meta App + tokens IG/FB para cross-post; (2) definir canal de notificación (email/Telegram/WA) para aprobación de notas IA; (3) cambiar URL de Cafecito.me; (4) analisis competitivo en curso (subagente).

### SEO técnico avanzado + análisis competitivo — 2026-07-25 (mismo día)
- **Subagente Hermes**: analizó en vivo Pitchfork, Consequence, Stereogum, Rolling Stone, Billboard, NME (robots/sitemaps/JSON-LD/OG). Reporte en `docs/SEO-ANALISIS-COMPETITIVO.md`. Hallazgo clave: todos usan `news-sitemap.xml` para Google News/Discover; gaps explotables = nicho español + underground local + velocidad Next.js.
- **`app/news-sitemap/route.ts`**: news-sitemap de notas de últimas 48h (formato Google News) → habilita Discover/News. Declarado en `robots.ts` (ambos sitemaps).
- **`app/robots.ts`**: ahora declara `sitemap.xml` + `news-sitemap`.
- [ ] `next/image` para CWV (hoy usa `<img>` directo).
- [ ] Imagen OG estándar 1200×630 por nota (usar `featuredImage`).

### Unificación de documentación (2026-07-25)
- Creado **`docs/PROYECTO-DR-BONGO-BONG.md`** como documento madre (identidad, voz, audiencia, formato, estrategia de contenido, SEO, monetización, automatización, misión). Integra el perfil de Ariel Centellas + lo construido + la misión premium.
- Borrados `ESTRATEGIA-CONTENIDO.md` y `AUTOMATIZACION.md` (fusionados en el madre). `SEO-ANALISIS-COMPETITIVO.md` se mantiene como anexo técnico.
- `ESTADO-DEL-PROYECTO.md` sigue siendo el mapa técnico de despliegue.

### Editor: alineación de imagen + 5 plantillas (2026-07-25)
- **`components/RichEditor.tsx`**: agregados controles de **alineación/tamaño** de imagen (botones M/L/S → clases `img-center/med/full/left/small`) vía `updateAttributes('image')`. Agregado botón **📐 Plantillas** con dropdown de 5 plantillas prediseñadas (responsive, estilo premium): `imageCaption` (imagen+epígrafe), `imageWide` (ancha a sangre), `twoImages` (2 columnas, se apila en móvil), `quote` (cita destacada), `card` (ficha del artista). El autor solo rellena; el diseño lo controla el CSS.
- **`app/globals.css`**: estilos de las 5 plantillas + clases de alineación, en `.tiptap-content` (editor) y `.prose-content` (render público) para que se vean igual en ambos. Media query a 640px para apilar `twoImages` en móvil.
- **Decisión de diseño**: se eligieron plantillas FIJAS (no editor de bloques libre) para preservar la coherencia estética premium con 3-5 notas/día + IA. Escalable: el diseño se ajusta en UN lugar (`globals.css`) sin tocar el contenido HTML.
- **Verificación**: `npm run build` exit 0.

### Editor: corrección de plantillas + embeds en vivo (2026-07-25, post-feedback)
- **Bug reportado por usuario**: plantillas de imagen insertaban `<img>` vacía (no funcionaban); botones M/L/S no aplicaban; videos/redes solo mostraban el link crudo; sin undo/redo.
- **`components/RichEditor.tsx` (rewrite)**:
  - **Plantillas de imagen** (5, sin Cita ni Ficha según pedido): `imageCaption`, `imageWide`, `twoImages`, + nuevas `imageSide` (img+texto) y `imageBanner` (CTA). Al elegir plantilla, **dispara el file picker y sube la imagen YA con la clase de tamaño aplicada** (no inserta vacío).
  - **M/L/S**: aplican a la imagen **seleccionada**; si no hay selección, a la última imagen del doc. Feedback visible en el editor.
  - **Und/Redo**: botones ↶ ↺.
  - **Embeds en VIVO**: nueva extensión `LiveEmbed` (React NodeView) muestra YouTube/IG/X/FB/Spotify **mientras escribís** (no espera a publicar). Pegar URL de video → aparece el iframe al instante.
  - **Preview en vivo**: el `EditorContent` YA es WYSIWYG (lo que ves = artículo). Videos/redes visibles en edición.
- **`app/globals.css`**: sacadas clases `tpl-quote`/`tpl-fact-card` (no usadas); agregadas `tpl-image-side`, `tpl-image-banner`, `.live-embed .embed`.
- **`lib/embeds.ts`**: Caso 3 — procesa bloques `liveEmbed` (div data-live-embed) al renderizar el artículo público, para que se vean igual que en el editor (edición / vista previa / publicado).
- **Verificación**: `npm run build` exit0, type-check OK. Pendiente validación visual en prod (deploy Pasos 1-8).
- **Nota de UX**: el editor es WYSIWYG; la "vista previa" antes de subir ya está cubierta por el preview en vivo. Si querés un modal de preview aparte, se agrega (no era necesario).

### Flujo de previsualización local (2026-07-25, pedido del usuario)
- **Problema reportado**: el dev server (`next dev`) en la PC de Ariel se **corrompía el `.next` con hot-reload** (MODULE_NOT_FOUND en `app/admin/page.js`), dando pantalla blanca. Los procesos `node.exe` colgados no se mataban con `kill`/`taskkill` (permisos Windows).
- **Solución adoptada**: NO usar `next dev` para previsualizar. En su lugar:
  1. **Repo GitHub** iniciado (`git init`, `.gitignore` excluye `node_modules/`, `.next/`, `.env*`, `public_html_export/`, `prisma/dev.db`, `*.sql`, `*.zip`).
  2. **Commit inicial** (318 archivos de código; SIN `.env` sensibles: `.env.old`/`.env.production.dist`/`.env.server` fueron removidos del stage).
  3. **`preview.bat`**: al ejecutarlo, construye el build (si no existe) y sirve el **standalone en localhost:4400** con `node .next/standalone/server.js`. Es el build de producción → **no se corrompe con hot-reload** porque no lo usa. El sitio de cPanel queda **APAGADO** hasta el deploy. Para cerrar: Ctrl+C.
- **Ventaja**: Ariel ve los cambios ANTES de subir, sin dejar online el sitio, sin el bug del dev. El deploy a cPanel sigue siendo los Pasos 1-8 (separado).
- **Pendiente**: crear el repo remoto en GitHub (Ariel debe autorizar con su cuenta; NO se puso ninguna credencial en el chat). Subir con `git push -u origin main` cuando Ariel lo indique.

### MISIÓN PREMIUM (resumen ejecutivo)
- Monetización recomendada arranque: Cafecito.me + afiliados; AdSense diferido hasta ~10k sesiones/mes.
- Cross-post: Meta Graph API (gratis, automatizable en Hermes).
- Contenido: borrador IA → notificación → aprobación humana → publicación + cross-post. Aprendizaje iterativo.
- Convertir Dr Bongo Bong en sitio **premium** que mejore mes a mes (diseño + contenido).
- Estrategia de contenido: 3-5 artículos diarios + noticias virales de música (todos los géneros), underground consagrado, cultura, cine.
- Monetización: definir modelo (ads, afiliados, mecenazgo, eventos) y dejarlo funcional/automático.
- Publicación simultánea a Instagram y Facebook al publicar en el sitio.
- Automatización vía Hermes Agent (cron jobs + /api/publish + APIs sociales).
- Ver `docs/ESTRATEGIA-CONTENIDO.md` y `docs/AUTOMATIZACION.md`.
