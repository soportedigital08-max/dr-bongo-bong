# PROYECTO DR BONGO BONG — Documento madre

> Fuente de verdad del proyecto. Toda decisión de contenido, diseño, SEO y automatización se alinea a este documento.
> Última actualización: 2026-07-25.

---

## 1. QUÉ ES DR BONGO BONG

Proyecto cultural y musical argentino creado y conducido por **Ariel Centellas**, con +10 años en radio y streaming.

- Nació en el **reggae**, hoy abarca **música en todos los géneros** + cultura, actualidad y fenómenos virales.
- Plataforma que combina: **radio tradicional + streaming en vivo + redes** (IG, YouTube, TikTok).

**No es un medio periodístico clásico.** Es un **espacio de curaduría cultural** donde la música es el eje pero también se analizan tendencias, industria, virales y emergentes.

### Lo que NO es
- ❌ Noticiero tradicional
- ❌ Medio académico
- ❌ Espacio político partidario
- ❌ Contenido frío o neutral

### Lo que SÍ es
- ✅ Un filtro cultural
- ✅ Una voz con identidad
- ✅ Un espacio donde la música conecta con la actualidad
- ✅ Una experiencia pensada para acompañar

---

## 2. IDENTIDAD Y VOZ

**Tono**: cercano, natural, conversacional, con criterio propio. Sin dar cátedra: comparte, interpreta, genera conexión.

Puede tener:
- momentos reflexivos
- observaciones irónicas
- preguntas al oyente ("¿vos qué pensás?")
- bajadas simples de temas complejos

**Enfoque editorial** — cada tema debe responder a al menos uno:
1. **Informar**
2. **Generar reflexión**
3. **Entretener**
4. **Descubrir música**

Valor = claridad + conexión. No profundización técnica extrema.

---

## 3. AUDIENCIA

- 18 a 45 años
- Interesados en música y cultura
- Oyentes de radio nocturna (remiseros, comercios, trabajadores)
- Usuarios activos en redes
- Consumen en vivo + formato corto (reels, clips)

---

## 4. FORMATO DE CONTENIDO

Dr Bongo Bong trabaja con:
- programas en vivo (radio + streaming)
- recortes para redes
- noticias culturales
- recomendaciones musicales
- entrevistas

El contenido debe ser: **claro, dinámico, con gancho, pensado para ser recortado en clips.**

## 4b. PRESENCIA EN REDES (verificada 2026-07-25)
- **YouTube**: `@dr.bongobong` — 1.2K suscriptores, 456 videos. Mezcla: notas largas (1-2h), shorts (hasta 37k vistas: "Dua Lipa eligió Oye Mi Amor"), streams en vivo (Cadena 103). Funciona muy bien.
- **Instagram**: `@drbongobong` — videos, resúmenes; daba resultado antes de pausar.
- **TikTok**: `@drbongobong` — videos cortos + algunos más largos.
- **Facebook**: presencia activa (cross-post objetivo).
- **Web**: drbongobong.com.ar (el sitio).

Estrategia: el sitio es la fuente; IG/FB/TikTok/YouTube se alimentan de ahí. El cross-post automático (Meta Graph API) cubre IG+FB; YouTube/TikTok quedan para el editor por ahora (subida manual) hasta integrar.

---

## 5. ESTRATEGIA DE CONTENIDO (web)

Frecuencia objetivo: **3-5 artículos diarios** + cobertura de viralidad en tiempo real.

### Mix diario sugerido
| Tipo | Por qué | Cantidad/día |
|---|---|---|
| Noticia rápida / viral | Discover/News, tráfico pico | 2 |
| "Un día como hoy" | Evergreen, fácil de programar | 1 |
| Listicle / recomendación | Long-tail, compartible | 1 |
| Reseña / explainer / entrevista | Autoridad, evergreen | 1 (rotativo) |

### Pilares
1. **Música (todos los géneros)** — del reggae raíz al urbano, rock, metal, folk, electrónica, pop, indie.
2. **Underground consagrado** — artistas que construyeron obra fuera del mainstream (perfil "Un día como hoy").
3. **Cultura** — libros, artes visuales, escena local (Olavarría / Argentina).
4. **Cine** — estrenos, bandas sonoras, documentales musicales.
5. **Virales en tiempo real** — lo que explota HOY en YouTube/X/TikTok/Reddit.

### Tonos permitidos (alineado a la voz)
- Cierra con pregunta al lector para generar comentarios.
- Permite ironía sobre la industria, sin ser ácido.
- Destaca "descubrimiento" de artistas chicos (filtro cultural).

### Formatos que ya soporta el sitio
- Embeds automáticos (YouTube/IG/X/FB/Spotify) pegando la URL sola en un párrafo.
- Imagen destacada + imágenes en cuerpo (drag&drop / Ctrl+V, normalizadas a 1600px).
- Editor TipTap visual.
- Publicación por API (`/api/publish`) con marca `isAIContent`.

---

## 6. SEO Y POSICIONAMIENTO (técnico ya implementado)

Basado en análisis competitivo (Pitchfork, Consequence, Stereogum, Rolling Stone, Billboard, NME):

### Ya hecho (2026-07-25)
- `app/layout.tsx`: metadata + `metadataBase` + OG (es_AR) + Twitter card + robots.
- `app/posts/[slug]/page.tsx`: **JSON-LD `Article`** (rich snippets).
- `app/sitemap.ts`: sitemap dinámico (posts + categorías).
- `app/news-sitemap/route.ts`: **news-sitemap de últimas 48h** (Google News/Discover).
- `app/robots.ts`: indexa todo, bloquea `/admin` y `/api`, declara ambos sitemaps.

### Huecos a explotar (ventaja competitiva)
- **Nicho español + underground hispano**: ignorado por los grandes en inglés.
- **Velocidad**: Next.js supera a WordPress pesados (Core Web Vitals).
- **Long-tail en español**: "qué significa [letra]", "quién es [artista emergente]".

### Pendiente (requiere usuario o refactor)
- [ ] Alta en **Google Search Console** + **News Publisher Center**.
- [ ] `generateMetadata()` con `canonical` por artículo.
- [ ] Páginas de **autor con bio** (EEAT) — mostrar "Ariel Centellas / Dr Bongo Bong".
- [ ] `next/image` para CWV (hoy usa `<img>` directo).
- [ ] Imagen OG estándar 1200×630 por nota (usar `featuredImage`).

---

## 7. MONETIZACIÓN (funcional + estética)

Decisión: arrancar liviano y escalar.

| Modelo | Estado | Nota |
|---|---|---|
| **Cafecito.me** (mecenazgo) | ✅ Botón en footer (URL placeholder `cafecito.app/drbongobong` → cambiar) | No rompe estética |
| **Afiliados** (entradas/discos) | ⏳ Agendar bloque "Dónde verlo" en notas de shows | Insertar en cuerpo |
| **AdSense** | ⏳ Diferir hasta ~10k sesiones/mes | Espacios reservados, sin pop-ups |

---

## 8. AUTOMATIZACIÓN (Hermes Agent)

### Flujo adoptado (aprobación humana primero)
```
Hermes genera borrador (isAIContent=true)
  → notificación al editor (email/Telegram/WA)
  → editor revisa y aprueba
  → publica en el sitio (POST /api/publish)
  → cross-post a IG + FB (Meta Graph API)
```
El "aprendizaje" se afina: el editor marca qué rechaza y se ajusta el generador.

### Componentes ya listos
- `/api/publish` (x-api-key) crea nota publicada.
- `/api/upload` (JWT) sube imágenes.
- Embeds y editor visual funcionando.
- `app/api/social/crosspost/route.ts` (x-api-key) hace cross-post a IG+FB vía Meta Graph API. Listo para usar; devuelve `configured:false` hasta que el usuario setee `META_IG_USER_ID` / `META_FB_PAGE_ID` / `META_ACCESS_TOKEN` en env vars de cPanel.
- Kit visual + asistente de contenido en `assets/brand/` (ver `docs/ECOSISTEMA-REDES.md`).

### Pendiente (requiere usuario)
- [ ] **Meta App** + tokens IG/FB (cross-post vía Graph API — recomendado, gratis).
- [ ] **Canal de notificación** para aprobación (elegir email/Telegram/WA).
- [ ] Cron jobs de Hermes: calendario semanal + generación diaria en borrador.

---

## 9. MISIÓN A LARGO PLAZO

Convertir Dr Bongo Bong en **sitio premium que mejora mes a mes** (diseño + contenido), con:
- 3-5 artículos diarios de calidad editorial propia.
- Viralidad capturada en tiempo real.
- Monetización funcional y automática.
- Presencia simultánea web + IG + FB (y luego TikTok/Threads).
- Crecimiento de comunidad (el objetivo final: "una voz con identidad que acompaña").

### Mejora continua mensual
- 1 feature nueva por mes (newsletter, sección, widget).
- A/B de titulares en virales.
- Limpieza de notas viejas confusas (limpiador WP ya en el render).

---

## 10. REGLA DEL PROYECTO
Todo cambio (código, servidor, DB, config, contenido) se registra en `docs/CHANGELOG.md` con fecha, motivo y evidencia de verificación. Sin excepciones.
