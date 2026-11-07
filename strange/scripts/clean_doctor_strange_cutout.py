"""Remove the checkerboard baked into the downloaded Doctor Strange preview."""

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
source_path = ROOT / "assets" / "characters" / "doctor_strange_casting_source.jpg"
output_path = ROOT / "assets" / "characters" / "doctor_strange_casting_cutout.png"

image = Image.open(source_path).convert("RGB")
width, height = image.size
pixels = image.load()
background = Image.new("L", (width, height), 0)
background_pixels = background.load()
queue = deque()


def is_checkerboard(pixel):
    red, green, blue = pixel
    return min(pixel) >= 170 and max(pixel) - min(pixel) <= 20


for x in range(width):
    for y in (0, height - 1):
        if is_checkerboard(pixels[x, y]) and not background_pixels[x, y]:
            background_pixels[x, y] = 255
            queue.append((x, y))
for y in range(height):
    for x in (0, width - 1):
        if is_checkerboard(pixels[x, y]) and not background_pixels[x, y]:
            background_pixels[x, y] = 255
            queue.append((x, y))

while queue:
    x, y = queue.popleft()
    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
        if 0 <= nx < width and 0 <= ny < height and not background_pixels[nx, ny] and is_checkerboard(pixels[nx, ny]):
            background_pixels[nx, ny] = 255
            queue.append((nx, ny))

alpha = Image.eval(background, lambda value: 255 - value).filter(ImageFilter.GaussianBlur(0.65))
rgba = image.convert("RGBA")
rgba.putalpha(alpha)
bounds = alpha.point(lambda value: 255 if value > 16 else 0).getbbox()
if bounds is None:
    raise RuntimeError("The background removal found no character pixels")

left, top, right, bottom = bounds
margin = 5
crop = (max(0, left - margin), max(0, top - margin), min(width, right + margin), min(height, bottom + margin))
rgba.crop(crop).save(output_path, optimize=True)
print(f"Saved transparent cutout: {output_path} ({crop[2] - crop[0]}x{crop[3] - crop[1]})")
