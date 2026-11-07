"""Build clean, matching shard sprites for the vase and cosmic orb scenes."""

from pathlib import Path
import math
import random

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
RELICS = ROOT / "assets" / "relics"


def vase_shards():
    source = Image.open(RELICS / "vase_cutout.png").convert("RGBA")
    vase = source.resize((320, 480), Image.Resampling.LANCZOS)
    vase = ImageEnhance.Contrast(vase).enhance(1.08)

    # A seeded Voronoi cut divides the transparent vase silhouette into eight
    # connected, interlocking ceramic fragments without rectangular photo tiles.
    seeds = [(160, 43), (91, 153), (229, 153), (94, 272), (230, 272), (94, 388), (226, 388), (160, 454)]
    alpha = vase.getchannel("A")
    labels = Image.new("L", (320, 480), 0)
    label_pixels = labels.load()
    alpha_pixels = alpha.load()
    rng = random.Random(13)
    for y in range(480):
        for x in range(320):
            if alpha_pixels[x, y] < 8:
                continue
            jitter = [rng.randrange(-600, 601) for _ in seeds]
            label_pixels[x, y] = min(
                range(len(seeds)),
                key=lambda index: (x - seeds[index][0]) ** 2 + (y - seeds[index][1]) ** 2 + jitter[index],
            )
    edge_colors = ((32, 238, 202, 235), (255, 211, 111, 240))

    for index in range(len(seeds)):
        mask = Image.eval(labels, lambda value: 255 if value == index else 0)
        mask = ImageChops_multiply(mask, alpha)
        piece = vase.copy()
        piece.putalpha(mask)

        # Fine luminous kintsugi lines define the breaks while preserving the
        # ceramic image detail on every fragment.
        from PIL import ImageFilter

        eroded = mask.filter(ImageFilter.MinFilter(3))
        edge_mask = ImageChops_subtract(mask, eroded)
        outline = Image.new("RGBA", (320, 480), edge_colors[0])
        outline.putalpha(edge_mask.point(lambda value: min(150, value)))
        gold = Image.new("RGBA", (320, 480), edge_colors[1])
        gold.putalpha(edge_mask.point(lambda value: min(220, value)))
        outline = Image.alpha_composite(outline, gold)
        outline.putalpha(ImageChops_multiply(outline.getchannel("A"), vase.getchannel("A")))
        piece = Image.alpha_composite(piece, outline)
        piece.save(RELICS / f"vase_grand_shard_{index}.png", optimize=True)


def ImageChops_multiply(first, second):
    from PIL import ImageChops

    return ImageChops.multiply(first, second)


def ImageChops_subtract(first, second):
    from PIL import ImageChops

    return ImageChops.subtract(first, second)


def orb_surface(size=250):
    source = Image.open(RELICS / "space_galaxy.jpg").convert("RGB")
    # The blue nebula bubble provides a naturally spherical, star-filled surface.
    texture = source.crop((320, 300, 1030, 1010)).resize((size, size), Image.Resampling.LANCZOS)
    texture = ImageEnhance.Color(texture).enhance(1.22)
    texture = ImageEnhance.Contrast(texture).enhance(1.16).convert("RGBA")

    # Spherical edge falloff and cool glass rim.
    shade = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shade_pixels = shade.load()
    center = (size - 1) / 2
    radius = size * 0.492
    for y in range(size):
        for x in range(size):
            distance = math.sqrt((x - center) ** 2 + (y - center) ** 2) / radius
            if distance <= 1:
                darkness = max(0, min(175, int((distance ** 2.15) * 185)))
                shade_pixels[x, y] = (4, 8, 31, darkness)
    texture = Image.alpha_composite(texture, shade)

    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((3, 3, size - 4, size - 4), fill=255)
    texture.putalpha(mask)

    # A glass catchlight, refracted highlight, and thin chromatic outer edge.
    light = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(light)
    draw.ellipse((size * .19, size * .12, size * .47, size * .23), fill=(225, 255, 255, 86))
    draw.arc((7, 7, size - 8, size - 8), 202, 320, fill=(173, 255, 249, 220), width=4)
    draw.arc((5, 5, size - 6, size - 6), 15, 145, fill=(243, 135, 255, 190), width=3)
    light.putalpha(ImageChops_multiply(light.getchannel("A"), mask))
    texture = Image.alpha_composite(texture, light)

    # Delicate fractures make the object read as a broken relic while keeping
    # the art clean when the facets close back into a sphere.
    cracks = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    crack_draw = ImageDraw.Draw(cracks)
    paths = [
        [(size * .23, size * .31), (size * .38, size * .40), (size * .35, size * .51), (size * .49, size * .60)],
        [(size * .68, size * .23), (size * .61, size * .38), (size * .72, size * .48), (size * .64, size * .64)],
        [(size * .27, size * .70), (size * .43, size * .63), (size * .50, size * .73)],
    ]
    for path in paths:
        crack_draw.line(path, fill=(45, 250, 238, 220), width=3, joint="curve")
        crack_draw.line(path, fill=(255, 217, 255, 220), width=1, joint="curve")
    cracks.putalpha(ImageChops_multiply(cracks.getchannel("A"), mask))
    return Image.alpha_composite(texture, cracks)


def orb_shards():
    size = 250
    base = orb_surface(size)
    center = (size - 1) / 2
    radius = size * .49

    for index in range(8):
        # Every sprite is stored as a 45-degree wedge pointing up/right. The
        # game rotates each sprite into its original position as time rewinds.
        angle = index * 45
        local_surface = base.rotate(-angle, resample=Image.Resampling.BICUBIC, expand=False)
        mask = Image.new("L", (size, size), 0)
        draw = ImageDraw.Draw(mask)
        points = [(center, center)]
        for step in range(25):
            progress = step / 24
            jag = 6.5 * math.sin(math.pi * progress) * math.sin(step * 1.7 + index * .6)
            theta = math.radians(step * 45 / 24 + jag)
            edge_radius = radius * (1 if step in (0, 24) else 1 + .045 * math.sin(step * 2.1 + index))
            points.append((center + edge_radius * math.cos(theta), center + edge_radius * math.sin(theta)))
        draw.polygon(points, fill=255)
        facet = local_surface.copy()
        facet.putalpha(ImageChops_multiply(mask, local_surface.getchannel("A")))

        # Draw the two luminous fracture seams and outer glass bevel.
        edge = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        edge_draw = ImageDraw.Draw(edge)
        for degrees, color in ((0, (95, 255, 244, 245)), (45, (250, 153, 255, 235))):
            theta = math.radians(degrees)
            endpoint = (center + radius * math.cos(theta), center + radius * math.sin(theta))
            edge_draw.line((center, center, *endpoint), fill=color, width=5)
            edge_draw.line((center, center, *endpoint), fill=(255, 255, 255, 210), width=1)
        arc = [(center + radius * math.cos(math.radians(step * 45 / 24)), center + radius * math.sin(math.radians(step * 45 / 24))) for step in range(25)]
        edge_draw.line(arc, fill=(180, 255, 250, 220), width=3, joint="curve")
        edge.putalpha(ImageChops_multiply(edge.getchannel("A"), mask))
        facet = Image.alpha_composite(facet, edge)
        facet = facet.filter(ImageFilter.GaussianBlur(0.18))
        facet.save(RELICS / f"orb_grand_prism_{index}.png", optimize=True)


if __name__ == "__main__":
    vase_shards()
    orb_shards()
    print("Generated 8 vase shards and 8 cosmic orb facets.")
