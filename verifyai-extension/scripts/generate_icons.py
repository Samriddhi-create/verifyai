"""Generates the extension's toolbar icons as plain PNGs (no Pillow dependency).

Draws a rounded-square shield in the brand color with a white checkmark,
at each size Chrome requires (16/48/128px), and writes them to public/icons/.
"""

import struct
import zlib
from pathlib import Path

BRAND_RGB = (22, 101, 52)  # dark green, matches the "supported" palette family
CHECK_RGB = (255, 255, 255)

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "icons"
SIZES = (16, 48, 128)


def rounded_square_mask(size: int, radius_ratio: float = 0.22) -> list[list[bool]]:
    r = max(1, int(size * radius_ratio))
    mask = [[True] * size for _ in range(size)]
    for y in range(r):
        for x in range(r):
            dx, dy = r - x, r - y
            outside = dx * dx + dy * dy > r * r
            if outside:
                mask[y][x] = False
                mask[y][size - 1 - x] = False
                mask[size - 1 - y][x] = False
                mask[size - 1 - y][size - 1 - x] = False
    return mask


def distance_to_segment(px, py, ax, ay, bx, by) -> float:
    abx, aby = bx - ax, by - ay
    apx, apy = px - ax, py - ay
    ab_len_sq = abx * abx + aby * aby
    t = max(0.0, min(1.0, (apx * abx + apy * aby) / ab_len_sq)) if ab_len_sq else 0.0
    cx, cy = ax + t * abx, ay + t * aby
    return ((px - cx) ** 2 + (py - cy) ** 2) ** 0.5


def draw_icon(size: int) -> bytes:
    mask = rounded_square_mask(size)
    stroke_w = max(1.4, size * 0.09)

    # Checkmark control points, in fractional coordinates.
    p1 = (size * 0.28, size * 0.52)
    p2 = (size * 0.45, size * 0.70)
    p3 = (size * 0.75, size * 0.32)

    pixels = bytearray()
    for y in range(size):
        pixels.append(0)  # no filter for this scanline
        for x in range(size):
            if not mask[y][x]:
                pixels.extend((0, 0, 0, 0))
                continue

            d = min(
                distance_to_segment(x + 0.5, y + 0.5, *p1, *p2),
                distance_to_segment(x + 0.5, y + 0.5, *p2, *p3),
            )
            if d <= stroke_w:
                pixels.extend((*CHECK_RGB, 255))
            else:
                pixels.extend((*BRAND_RGB, 255))
    return bytes(pixels)


def png_chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data))


def write_png(path: Path, size: int) -> None:
    raw = draw_icon(size)
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    idat = zlib.compress(raw, 9)
    png = b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", idat) + png_chunk(b"IEND", b"")
    path.write_bytes(png)


if __name__ == "__main__":
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for size in SIZES:
        out_path = OUT_DIR / f"icon-{size}.png"
        write_png(out_path, size)
        print(f"wrote {out_path}")
