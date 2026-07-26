#!/usr/bin/env python3
"""
DR BONGO BONG - Asistente de contenido (B2).
Entrada: vos pegás el hecho/nota (texto libre).
Salida: 3 opciones de titulo + hashtags + caption, siguiendo la formula probada
(escala + nombre con masa + cierre emocional nacional) y el check de identidad.

Uso:
  python asistente_contenido.py
  (te pide el texto, devuelve las opciones; pegás el titulo elegido en generar_reel.py)

Sin IA externa: usa reglas de la formula del reel de 700k (Sardelli+Colapinto).
Override humano: vos elegis y editas.
"""
import re

def extraer_nombres(texto):
    # 1) prioriza handles @usuario (casi siempre la persona con masa)
    handles = re.findall(r'@[\w.]+', texto)
    # 2) nombres propios de 2+ letras que empiezan mayus
    palabras = re.findall(r'\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,2})', texto)
    stop = {'El','La','Los','Las','Un','Una','Y','En','De','Se','Su','Por','Para','Con','Al',
            'A','O','Mi','Tu','Palermo','Buenos','Argentina','Facebook','Instagram','YouTube','TikTok'}
    propios = [p for p in palabras if p not in stop]
    # pone handles primero, luego nombres; evita duplicados
    unidos = []
    for n in handles + propios:
        if n not in unidos:
            unidos.append(n)
    return unidos[:5] if unidos else ["el protagonista"]

def escala(texto):
    m = re.search(r'(\d[\d\.]+\s*(?:mil|millones?|k|m)?|\d{3,})', texto, re.I)
    return m.group(0).strip() if m else None

def armar_opciones(texto):
    nombres = extraer_nombres(texto)
    principal = nombres[0]
    extra = " ".join(nombres[1:3]) if len(nombres) > 1 else ""
    esc = escala(texto)
    esc_frase = f"{esc} personas. " if esc else ""

    opciones = [
        f"{esc_frase}{principal} y la cultura siendo Argentina.",
        f"{esc_frase}Esto es {principal}. Argentina siendo Argentina.",
        f"{esc_frase}Lo que pasó con {principal}{(' y '+extra) if extra else ''}: Argentina siendo Argentina.",
    ]
    tags = [n if n.startswith('#') else '#'+re.sub(r'[^\w]','',n) for n in nombres[:4]]
    tags += ["#DrBongoBong", "#Argentina", "#Cultura"]
    return opciones, tags

def caption_base(texto, titulo):
    return (f"{titulo}\n\n{texto[:280]}\n\n"
            f"¿Lo viviste? ¿Lo viste por la tele? 👇")

if __name__ == "__main__":
    print("=== ASISTENTE DR BONGO BONG ===")
    print("Pegá el hecho/nota (una linea). Enter para procesar:\n")
    texto = input("> ").strip()
    if not texto:
        texto = "600.000 personas en Palermo. Un auto de F1. Pato Sardelli tocando el himno con guitarra electrica."
    opciones, tags = armar_opciones(texto)
    print("\n--- 3 TITULOS SUGERIDOS ---")
    for i, o in enumerate(opciones, 1):
        print(f"{i}) {o}")
    print("\n--- HASHTAGS ---")
    print(" ".join(tags))
    print("\n--- CAPTION (usando opcion 1) ---")
    print(caption_base(texto, opciones[0]))
    print("\n[Override] Elegi un titulo, editarlo, y pasarlo a generar_reel.py --titulo \"...\"")
