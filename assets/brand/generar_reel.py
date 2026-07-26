#!/usr/bin/env python3
"""
DR BONGO BONG - Generador de piezas (Opcion 1, ffmpeg).
Regla de 2 limites:
  LIMITE 1 (exterior): el recorte llena el frame (entra desde afuera hacia adentro).
  LIMITE 2 (interior): logo (3 filas, derecha) + titulo (Gotham, al pie) viven ahi.

Uso:
  python generar_reel.py --input recorte.mp4 --titulo "TU TITULO" --formato ig --out salida.mp4
"""
import argparse, subprocess, os

BASE = os.path.dirname(os.path.abspath(__file__))
STAR   = os.path.join(BASE, "starfield", "starfield.mp4")
LOGO   = os.path.join(BASE, "logo", "logo bongo-blanco-transparente.png")
ZOCALO = os.path.join(BASE, "overlay", "zocalo para reel.png")
FONT   = os.path.join(BASE, "GothamBold.ttf")
FFMPEG = "ffmpeg"

FORMATS = {
    "ig":    (1080, 1350),
    "short": (1080, 1920),
    "fb":    (1080, 1350),
    "horizontal": (1920, 1080),
}

def run(cmd):
    print(">> ejecutando ffmpeg...")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FFMPEG ERROR:\n", r.stderr[-1800:])
        raise SystemExit(1)

def generar(input_path, titulo, formato="ig", out="salida.mp4"):
    W, H = FORMATS[formato]
    margin = int(min(W, H) * 0.07)        # LIMITE 2
    logo_w = int(W * 0.20)
    # titulo en archivo aparte (evita problemas con espacios/comillas)
    title_file = os.path.join(BASE, "_titulo.txt")
    with open(title_file, "w", encoding="utf-8") as f:
        f.write(titulo)

    def ffp(p):  # ffmpeg-safe path: slashes + escape ONLY the drive colon (D:/ -> D\:/)
        p = p.replace('\\', '/')
        return p.replace(':', '\\:', 1)
    vf = (
        f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1[bg];"
        f"[1:v]scale={int(W*1.06)}:{int(H*1.06)}:force_original_aspect_ratio=increase,"
        f"crop={W}:{H}:x='(iw-{W})/2*(1-t/12)':y='(ih-{H})/2*(1-t/12)'[s];"
        f"[bg][s]overlay=format=auto:shortest=1[base];"
        f"[2:v]scale={logo_w}:-1[lg];"
        f"[base][lg]overlay=W-w-{margin}:{margin}[conlogo];"
        f"[3:v]scale={W}:-1[zc];"
        f"[conlogo][zc]overlay=0:H-h[conzoc];"
        f"[conzoc]drawtext=fontfile='{ffp(FONT)}':textfile='{ffp(title_file)}':"
        f"fontcolor=white:fontsize={int(H*0.045)}:x={margin}:y={H-int(H*0.16)}:"
        f"shadowcolor=black:shadowx=2:shadowy=2[txt]"
    )
    cmd = [
        FFMPEG, "-y",
        "-i", STAR,
        "-i", input_path,
        "-i", LOGO,
        "-i", ZOCALO,
        "-filter_complex", vf,
        "-map", "[txt]",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", "-crf", "20",
        "-t", "12", out,
    ]
    run(cmd)
    print("Listo:", out)

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--titulo", default="DR BONGO BONG")
    ap.add_argument("--formato", default="ig", choices=list(FORMATS))
    ap.add_argument("--out", default="salida.mp4")
    a = ap.parse_args()
    generar(a.input, a.titulo, a.formato, a.out)
