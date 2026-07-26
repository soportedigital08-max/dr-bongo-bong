#!/usr/bin/env python3
"""Starfield animado DR BONGO BONG - version liviana (sin blur por frame).
Puntos blancos densos + halos de color por capas concentricas + deriva sutil.
"""
import os, math, random
from PIL import Image, ImageDraw

W, H = 1080, 1350
FPS, SECS = 24, 8
FRAMES = FPS * SECS
OUT = os.path.join(os.path.dirname(__file__), "frames")
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    os.remove(os.path.join(OUT, f))

random.seed(7)
N = 1100
stars = [[random.uniform(0, W), random.uniform(0, H), random.uniform(0.6, 1.9), random.uniform(170, 255)] for _ in range(N)]
bright = []
for _ in range(12):
    bright.append([random.uniform(0, W), random.uniform(0, H), random.choice([(255,150,200),(170,200,255)])])

def draw(i):
    t = i / FRAMES
    dx = math.sin(t * math.pi) * 5
    dy = -t * 5
    img = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(img)
    for (x, y, r, b) in stars:
        nx, ny = x + dx, y + dy
        if 0 <= nx < W and 0 <= ny < H:
            d.ellipse([nx - r, ny - r, nx + r, ny + r], fill=(int(b), int(b), int(b)))
    for (x, y, hue) in bright:
        nx, ny = x + dx, y + dy
        # halo por capas concentricas (barato, sin blur)
        for rad, al in [(14, 40), (9, 90), (4, 200)]:
            col = tuple(min(255, c + al) for c in hue)
            d.ellipse([nx - rad, ny - rad, nx + rad, ny + rad], fill=col)
        d.ellipse([nx - 1.5, ny - 1.5, nx + 1.5, ny + 1.5], fill=(255, 255, 255))
    return img

for i in range(FRAMES):
    draw(i).save(os.path.join(OUT, f"f{i:05d}.png"))
print("frames listos:", FRAMES)
