# GUÍA DE REDES — Dr Bongo Bong (kit visual + asistente)

> Todo en `assets/brand/`. Corre en tu PC (Windows, con Python + ffmpeg).
> Objetivo: armar piezas alineadas a la identidad SIN perder el estilo.

---

## Qué tenés ahí
- `generar_reel.py` → compone la pieza (starfield + logo + zócalo + título Gotham).
- `asistente_contenido.py` → te sugiere título + hashtags + caption.
- `hacer_pieza.py` → une los dos: vos das el hecho y el video, él hace el resto.
- `starfield/starfield.mp4` → fondo de estrellas.
- `logo/`, `overlay/`, `GothamBold.ttf` → la marca.
- `prueba_dbb.mp4` / `prueba_short.mp4` → ejemplos para que mires en el celu.

---

## Forma A — todo de una (recomendada): `hacer_pieza.py`
Desde una terminal en la carpeta `assets/brand`:
```bash
cd assets/brand
python hacer_pieza.py
```
Te pide:
1. El hecho (una línea, p.ej. "Pato Sardelli tocando el himno en Palermo").
2. Eligís uno de los 3 títulos (o escribís el tuyo).
3. La ruta de tu video recortado (p.ej. `C:\Users\Ariel\recortes\himno.mp4`).
4. El formato (ig / short / horizontal).

Y te genera `salida.mp4` listo para subir a IG / TikTok / YT.

---

## Forma B — paso a paso manual
```bash
cd assets/brand

# 1) titulo + hashtags
python asistente_contenido.py
# copias el titulo que te gustó

# 2) componer la pieza
python generar_reel.py --input "C:\ruta\a\tu\recorte.mp4" --titulo "AQUI EL TITULO" --formato ig --out salida.mp4
```

Formatos:
- `ig` → 1080x1350 (Instagram / Facebook)
- `short` → 1080x1920 (YouTube Shorts / TikTok)
- `horizontal` → 1920x1080

---

## Regla de identidad (no se toca)
- Fondo: starfield (entra "desde las estrellas").
- Logo Bonguito: 3 filas, arriba-derecha.
- Zócalo: negro + línea roja abajo.
- Título: Gotham, blanco, al pie.

## Subir a redes
Por ahora subís `salida.mp4` a mano en cada red (IG / TikTok / YT).
El cross-post automático a IG+FB desde el sitio ya está programado
(`app/api/social/crosspost/route.ts`) y se activa cuando pongas los tokens de
Meta en cPanel. Hasta ahí lo hacés manual.

## Duda frecuente
- **El video entra chico / no llena:** el recorte se ajusta para llenar el frame (Límite 1).
  Si querés otro encuadre, avisame y ajusto el `crop` en `generar_reel.py`.
- **El título se corta:** es `fontsize` proporcional. Si es muy largo, lo bajo en el script.
