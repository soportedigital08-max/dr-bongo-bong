#!/usr/bin/env python3
"""
DR BONGO BONG - Orquestador de pieza (une asistente + generador).
Uso:
  python hacer_pieza.py
Te pide: hecho, titulo (eligis 1-3 o escribis el tuyo), ruta del video, formato.
Genera salida.mp4 con la identidad DR BONGO BONG.
"""
import subprocess, sys, os
from asistente_contenido import armar_opciones, caption_base

BASE = os.path.dirname(os.path.abspath(__file__))

def preg(txt):
    try:
        return input(txt).strip()
    except EOFError:
        return ""

def main():
    print("=== HACER PIEZA DR BONGO BONG ===\n")
    hecho = preg("Pegá el hecho (una linea):\n> ")
    if not hecho:
        hecho = "Pato Sardelli tocando el himno con guitarra electrica en Palermo."
    opciones, tags = armar_opciones(hecho)
    print("\n--- 3 TITULOS ---")
    for i, o in enumerate(opciones, 1):
        print(f"{i}) {o}")
    print(f"\nHashtags: {' '.join(tags)}")
    elec = preg("\nElegis (1/2/3) o escribi tu titulo: ").strip()
    if elec in ("1", "2", "3"):
        titulo = opciones[int(elec) - 1]
    elif elec:
        titulo = elec
    else:
        titulo = opciones[0]
    print(f"\nTitulo: {titulo}")

    video = preg("Ruta de tu video recortado (p.ej. C:\\recortes\\x.mp4): ").strip()
    if not video or not os.path.exists(video):
        print("Video no encontrado. Salgo. (Corre de nuevo con la ruta correcta.)")
        return
    fmt = preg("Formato (ig / short / horizontal) [ig]: ").strip() or "ig"
    out = os.path.join(BASE, "salida.mp4")

    cmd = [sys.executable, os.path.join(BASE, "generar_reel.py"),
           "--input", video, "--titulo", titulo, "--formato", fmt, "--out", out]
    print("\nGenerando pieza...\n")
    subprocess.run(cmd)

    if os.path.exists(out):
        print(f"\nLISTO: {out}")
        print("Subilo a IG / TikTok / YT. (Cross-post automatico queda para cuando pongas tokens Meta.)")
    else:
        print("Algo fallo al generar. Revisa ffmpeg y la ruta del video.")

if __name__ == "__main__":
    main()
