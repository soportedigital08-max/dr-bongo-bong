# ECOSISTEMA DE REDES — Dr Bongo Bong

> Complementa `PROYECTO-DR-BONGO-BONG.md` (sección 4b) y `README.md` (kit de redes).
> Creado: 2026-07-26. Regla del proyecto (§10 del doc madre): todo se registra acá.

---

## 1. REGLA DE IDENTIDAD VISUAL (obligatoria en TODAS las piezas)

Aplicada por `assets/brand/generar_reel.py` (kit visual). No se negocia.

| Elemento | Especificación |
|---|---|
| **Fondo** | Starfield animado (negro + puntos blancos densos + halos rosa/azul). Ocupa TODA la dimensión del reel. Sensación de "piloto una nave". |
| **Entrada/salida** | El video recortado entra "desde las estrellas" (zoom-in desde afuera del frame hacia adentro) y sale igual. Límite 1 = bordes del frame. |
| **Logo** | Bonguito (`logo bongo-blanco-transparente.png`), 3 filas compactas, esquina SUPERIOR DERECHA, dentro del Límite 2 (margen ~7%). |
| **Zócalo** | Negro con línea roja abajo (`overlay/zocalo para reel.png`). Límite 2 inferior. |
| **Título** | Gotham (Bold/Black), blanco, al PIE, dentro del Límite 2. Corto y efectivo. |
| **Límite 2** | Margen interior (~7% del frame) donde vive logo + título. El recorte puede invadir hasta el Límite 1. |

**Distinción DR BONGO BONG vs Cadena 103** (solo trabajamos DR BONGO BONG):
- DR BONGO BONG → logo Bonguito a la derecha.
- Cadena 103 → logo de la radio + transición logo→texto a la izquierda (NO se usa en este ecosistema).

---

## 2. FÓRMULA DE TÍTULO (probada en el reel de 700k de Sardelli)

Del reel que más reproducciones tuvo (Pato Sardelli + Colapinto, himno rock, Palermo):
> "600.000 personas en Palermo. Un auto de F1. Y @patriciosardelli tocando el himno con guitarra eléctrica. Argentina siendo Argentina."

Patrón que funciona (usarlo en el asistente):
1. **Escala / número** ("600.000 personas", "Un auto de F1") → magnitud inmediata.
2. **Nombre propio con masa** (@patriciosardelli, @francolapinto, Airbag) → cross-audiencia.
3. **Cierre emocional nacional** ("Argentina siendo Argentina") → dispara share.
4. **Coherencia de marca** → siempre con logos y fondo alineados.

El asistente (`asistente_contenido.py`) genera 3 variantes siguiendo esto.

---

## 3. FORMATOS Y MEDIDAS

| Plataforma | Medida | Comando `--formato` |
|---|---|---|
| Instagram (feed/Reel) | 1080×1350 | `ig` |
| YouTube Shorts | 1080×1920 | `short` |
| TikTok | 1080×1920 | `short` |
| Facebook | 1080×1350 | `ig` |
| Horizontal (FB/Web) | 1920×1080 | `horizontal` |

---

## 4. FLUJO SITIO ↔ REDES (aprobación humana primero)

```
Recorte del stream / nota
  → asistente_contenido.py: sugiere título + hashtags + caption (3 opciones)
  → VOS elegís y editás el título (override humano)
  → generar_reel.py: compone la pieza con identidad DR BONGO BONG
  → publicás en IG / TikTok / YT (manual por ahora)
  → (C) cross-post automático IG+FB vía Meta Graph API desde el sitio (pendiente)
  → el Sitio es la fuente: la nota larga vive en drbongobong.com.ar (POST /api/publish)
```

**Override humano:** el título lo escribís vos antes de correr `generar_reel.py`. Nunca se publica sin tu visto bueno.

---

## 5. ESTADO

| Item | Estado |
|---|---|
| Kit visual (`generar_reel.py` + starfield + logo + zócalo + Gotham) | ✅ hecho, verificado por píxeles |
| `prueba_dbb.mp4` / `prueba_short.mp4` (piezas de prueba) | ✅ generadas, pendiente tu visto bueno visual |
| Asistente de contenido (título/hashtags/caption) | ✅ `assets/brand/asistente_contenido.py`, verificado |
| Cross-post automático IG+FB (Meta Graph API) | ✅ código listo en `app/api/social/crosspost/route.ts` (force-dynamic). **Requiere que el usuario cree la Meta App y ponga META_IG_USER_ID / META_FB_PAGE_ID / META_ACCESS_TOKEN en env vars de cPanel.** Hasta ahí devuelve `configured:false` sin romper. |

---

## 6. PENDIENTE DEL USUARIO
- [ ] Abrir `prueba_dbb.mp4` en el celu y confirmar alineación de logo/título.
- [ ] Meta App + tokens IG/FB para el cross-post (C).
- [ ] Canal de notificación para aprobación (email/Telegram/WA).
