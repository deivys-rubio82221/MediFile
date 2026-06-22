#!/usr/bin/env python3
"""
generate_icons.py — Genera los iconos PNG para el PWA de MediFile
Requiere: pip install Pillow
Uso: python3 generate_icons.py
"""

import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Instalando Pillow...")
    os.system("pip install Pillow --break-system-packages -q")
    from PIL import Image, ImageDraw, ImageFont

def draw_heart_plus(draw, cx, cy, size, color):
    """Dibuja un símbolo de corazón simplificado con cruz."""
    # Cruz médica (rectángulo horizontal + vertical)
    arm = size * 0.18
    len_ = size * 0.45
    # Horizontal
    draw.rounded_rectangle([cx - len_, cy - arm, cx + len_, cy + arm], radius=arm*0.6, fill=color)
    # Vertical
    draw.rounded_rectangle([cx - arm, cy - len_, cx + arm, cy + len_], radius=arm*0.6, fill=color)


def make_icon(size, path):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Fondo azul con esquinas redondeadas
    radius = size * 0.22
    bg_color = (21, 101, 192, 255)     # #1565C0
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=bg_color)

    # Cruz médica blanca centrada
    cx, cy = size / 2, size / 2
    draw_heart_plus(draw, cx, cy, size, (255, 255, 255, 255))

    img.save(path, "PNG")
    print(f"  ✓ {path} ({size}×{size})")


if __name__ == "__main__":
    os.makedirs("icons", exist_ok=True)
    print("Generando iconos PWA...")
    make_icon(192, "icons/icon-192.png")
    make_icon(512, "icons/icon-512.png")
    make_icon(180, "icons/apple-touch-icon.png")
    make_icon(32,  "icons/favicon-32.png")
    make_icon(16,  "icons/favicon-16.png")
    print("¡Listo! Iconos generados en la carpeta icons/")