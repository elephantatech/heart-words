from functools import lru_cache
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONT_PATH = Path(__file__).resolve().parents[1] / "static" / "fonts" / "Andika-Regular.ttf"
DOT = (92, 115, 136, 255)


@lru_cache(maxsize=64)
def dotted_letter_png(glyph: str) -> bytes:
    font = ImageFont.truetype(str(FONT_PATH), 240)
    probe = ImageDraw.Draw(Image.new("L", (1, 1)))
    left, top, right, bottom = probe.textbbox((0, 0), glyph, font=font)
    pad = 18
    width = right - left + pad * 2
    height = bottom - top + pad * 2
    mask = Image.new("L", (width, height), 0)
    ImageDraw.Draw(mask).text((pad - left, pad - top), glyph, font=font, fill=255)
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    pixels = image.load()
    ink = mask.load()
    step = 8
    radius = 2
    for y in range(0, height, step):
        for x in range(0, width, step):
            if ink[x, y] > 140:
                _dot(pixels, x, y, radius, width, height)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def _dot(pixels, cx: int, cy: int, radius: int, width: int, height: int) -> None:
    for y in range(cy - radius, cy + radius + 1):
        for x in range(cx - radius, cx + radius + 1):
            if 0 <= x < width and 0 <= y < height and (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2:
                pixels[x, y] = DOT
