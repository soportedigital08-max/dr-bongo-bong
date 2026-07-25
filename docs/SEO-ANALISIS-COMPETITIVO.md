# Análisis competitivo SEO + estrategia de contenido — Dr Bongo Bong

*Sitio objetivo: medio de música y cultura en español (Next.js 14, cPanel/Passenger). Meta: rankear alto en Google con 3-5 artículos diarios.*

> Generado por subagente Hermes (2026-07-25) verificando en vivo robots.txt, sitemaps, JSON-LD y OpenGraph de los sitios competidores.

## 1. Sitios analizados

- **Pitchfork (pitchfork.com)** — Referente en *reviews* con puntuación (0-10) y el sello "Best New Music". SEO impecable: múltiples sitemaps segmentados (contenido, tags, contribuidores, **Google News**), JSON-LD verificado, RSS. URLs limpias por sección (`/reviews/albums/`). Autoridad temática altísima.
- **Consequence (consequence.net)** — WordPress + Yoast. Sitemap index + **news-sitemap.xml** dedicado (clave para Google News/Discover), JSON-LD presente, `robots.txt` que bloquea búsqueda interna para no diluir crawl budget. Mezcla noticias rápidas, listas y festivales.
- **Stereogum (stereogum.com)** — Voz editorial fuerte y de nicho (indie/underground), secciones icónicas ("The Number Ones", "We've Got A File On You"). Bloque Yoast en robots. Prueba de que la personalidad editorial fideliza.
- **Rolling Stone / Billboard** — Grandes marcas, dominio con enorme backlink profile. Billboard domina *charts* y datos; Rolling Stone domina *features* largos y EEAT (firmas reconocidas). Difíciles de batir de frente.
- **NME** — Noticias de música/cultura pop de alta frecuencia, fuerte en Discover.

**Lo que hacen mejor todos:** categorías claras, enlazado interno artista→artista, multimedia embebida (YouTube/Spotify), newsletter propia y distribución social agresiva.

## 2. Qué los hace rankear (SEO técnico)

- **URLs semánticas y estables** por sección (`/news/`, `/reviews/albums/`), sin parámetros basura.
- **Sitemaps segmentados** + `news-sitemap.xml` separado (verificado en Pitchfork y Consequence) → entrada rápida a Google News/Discover.
- **JSON-LD `NewsArticle`/`Article`** presente en los grandes (verificado `application/ld+json`), con autor, fecha y editor.
- **Meta titles/descriptions** únicos por nota; OpenGraph completo (`og:title` verificado en todos).
- **Core Web Vitals**: imágenes optimizadas (WebP, lazy-load, `srcset`), CDN.
- **EEAT**: páginas de autor con bio, fechas de publicación/actualización, política editorial. Es su mayor ventaja.

## 3. Formatos de contenido que ganan

| Formato | Valor SEO | Cadencia 3-5/día |
|---|---|---|
| **Noticia rápida** (lanzamiento, gira, polémica) | Google Discover/News, tráfico pico | 2-3/día — núcleo |
| **Listicle** ("Los 10 mejores…") | Long-tail evergreen, muy compartible | 1/día |
| **Reseña** con nota | Autoridad temática, evergreen | 3-4/semana |
| **"Un día como hoy"** | Evergreen recurrente, fácil de programar | 1/día |
| **Explainer** ("¿Quién es X?") | Captura búsquedas informativas | 2-3/semana |
| **Entrevista** | Backlinks, contenido exclusivo | 1-2/semana |

Mix recomendado diario: 2 noticias + 1 listicle o "un día como hoy" + 1 reseña/explainer.

## 4. Huecos que un sitio pequeño puede explotar

- **Idioma español**: los grandes cubren en inglés; hay demanda de reseñas/noticias en español (España + LatAm) mal atendida.
- **Escena local/underground**: artistas latinos, indie hispano, festivales regionales que Pitchfork/Billboard ignoran → cero competencia, autoridad de nicho rápida.
- **Velocidad**: Next.js bien optimizado supera a los WordPress pesados de la competencia en CWV.
- **Long-tail en español**: "significado letra [canción]", "quién es [artista emergente]" con baja dificultad.

## 5. Checklist concreto para Dr Bongo Bong (3-6 meses)

**SEO técnico en Next.js:**
- Usar `generateMetadata()` por artículo: title único (<60c), description (<155c), canonical.
- **JSON-LD `NewsArticle`** en cada nota (headline, image, datePublished, dateModified, author, publisher con logo). Inyectar con `<script type="application/ld+json">`.
- **Sitemap dinámico** con `app/sitemap.ts` + un **`news-sitemap.xml` separado** (solo notas de últimas 48h) para Google News.
- `app/robots.ts`: permitir todo, bloquear `/search`, `/api`; declarar ambos sitemaps.
- **OpenGraph + Twitter Card** completos con imagen 1200×630.
- Imágenes con `next/image` (WebP, lazy, `sizes`). Verificar CWV en PageSpeed.
- Páginas de **autor con bio** y fechas visibles (EEAT).

**Editorial:** calendario de 3-5 notas/día según el mix del punto 3; series recurrentes ("Un día como hoy", reseña semanal fija) para consistencia.

**Enlazado interno:** cada nota enlaza a 3-5 relacionadas (mismo artista/género); páginas *hub* por artista y por género.

**Backlinks/PR:** enviar reseñas a sellos/managers indie hispanos; colaboraciones con blogs locales; presencia en festivales para menciones.

**Social:** cross-post inmediato a Instagram, X, TikTok y Threads por cada nota (2-3 posts/día mínimo); newsletter semanal.

## 6. Tres quick wins para esta semana

1. **JSON-LD `NewsArticle` + OpenGraph** en el layout de artículo vía `generateMetadata()` — impacto SEO alto, medio día de dev.
2. **`app/sitemap.ts` + `app/robots.ts` dinámicos** declarando el sitemap y bloqueando rutas basura — habilita indexación correcta hoy mismo.
3. **`news-sitemap.xml` de últimas 48h** y alta en Google Search Console + Google News Publisher Center — abre la puerta a Discover, la mayor fuente de tráfico para medios de música.

## Estado de implementación en el proyecto (2026-07-25)
- ✅ `app/layout.tsx`: metadata + OG + Twitter + robots.
- ✅ `app/posts/[slug]/page.tsx`: JSON-LD Article (equivalente a NewsArticle para nuestro caso).
- ✅ `app/sitemap.ts`: sitemap dinámico.
- ✅ `app/robots.ts`: robots + ambos sitemaps declarados.
- ✅ `app/news-sitemap/route.ts`: news-sitemap de últimas 48h (Google News).
- ⏳ `generateMetadata()` por artículo con canonical (pendiente de refactor del [slug] a metadata dinámica).
- ⏳ Páginas de autor con bio (EEAT).
- ⏳ Alta en Google Search Console + News Publisher Center (requiere usuario).
- ⏳ `next/image` para CWV (pendiente, hoy usa <img> directo).
