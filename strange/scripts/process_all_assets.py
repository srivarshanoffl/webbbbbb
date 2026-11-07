import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

base_dir = r'c:\Users\sriva\strange portals\three-lost-relics'
char_dir = os.path.join(base_dir, 'assets', 'characters')
relic_dir = os.path.join(base_dir, 'assets', 'relics')
effects_dir = os.path.join(base_dir, 'assets', 'effects')

# ============================================================
# 1. DOCTOR STRANGE LIVE-ACTION HERO CUTOUT
# ============================================================
print("Processing Doctor Strange...")
strange_src = os.path.join(char_dir, 'strange_pngmart.png')
strange_dest = os.path.join(char_dir, 'doctor_strange_cinematic.png')
im_strange = Image.open(strange_src)
# Let's crop from head to boots cleanly
bbox = im_strange.getbbox()
im_strange_cropped = im_strange.crop(bbox)
# Resize to high quality 600 x 960 for crystal-sharp rendering
im_strange_final = im_strange_cropped.resize((600, int(600 * im_strange_cropped.height / im_strange_cropped.width)), Image.Resampling.LANCZOS)
im_strange_final.save(strange_dest, 'PNG')
print(f"Doctor Strange saved to {strange_dest}: {im_strange_final.size}")

# ============================================================
# 2. GRAND MULTI-RING TAO MANDALA (512x512)
# ============================================================
print("Generating Ultra-Grand Tao Mandala...")
m_size = 512
mandala = Image.new('RGBA', (m_size, m_size), (0, 0, 0, 0))
draw = ImageDraw.Draw(mandala)
cx, cy = m_size // 2, m_size // 2

# Layer 1: Outer Runes / Tick Ring
r_out = 240
draw.ellipse([cx - r_out, cy - r_out, cx + r_out, cy + r_out], outline=(0, 255, 136, 255), width=4)
draw.ellipse([cx - r_out + 8, cy - r_out + 8, cx + r_out - 8, cy + r_out - 8], outline=(61, 240, 213, 200), width=2)
for i in range(72):
    angle = i * (2 * math.pi / 72)
    l = 14 if i % 6 == 0 else (9 if i % 2 == 0 else 5)
    w = 3 if i % 6 == 0 else 1
    x1 = cx + (r_out - l) * math.cos(angle)
    y1 = cy + (r_out - l) * math.sin(angle)
    x2 = cx + r_out * math.cos(angle)
    y2 = cy + r_out * math.sin(angle)
    draw.line([(x1, y1), (x2, y2)], fill=(0, 255, 136, 240), width=w)

# Layer 2: Interlocking Heptagram / Square Glyphs
r_mid = 190
draw.ellipse([cx - r_mid, cy - r_mid, cx + r_mid, cy + r_mid], outline=(0, 255, 136, 230), width=3)
# Draw 4 rotated concentric squares (octagram / dodecagram)
for rot in [0, math.pi / 6, math.pi / 3, math.pi / 2, 2 * math.pi / 3]:
    pts = []
    for corner in range(4):
        a = rot + corner * (math.pi / 2)
        pts.append((cx + r_mid * math.cos(a), cy + r_mid * math.sin(a)))
    draw.polygon(pts, outline=(61, 240, 213, 180), width=2)

# Layer 3: Inner Sacred Geometry Ring
r_in = 120
draw.ellipse([cx - r_in, cy - r_in, cx + r_in, cy + r_in], outline=(0, 255, 136, 255), width=3)
draw.ellipse([cx - r_in + 6, cy - r_in + 6, cx + r_in - 6, cy + r_in - 6], outline=(245, 196, 82, 220), width=2)
# Draw 12-pointed star inside
for i in range(12):
    a1 = i * (2 * math.pi / 12)
    a2 = (i + 5) * (2 * math.pi / 12)
    x1, y1 = cx + r_in * math.cos(a1), cy + r_in * math.sin(a1)
    x2, y2 = cx + r_in * math.cos(a2), cy + r_in * math.sin(a2)
    draw.line([(x1, y1), (x2, y2)], fill=(0, 255, 136, 200), width=2)

# Layer 4: Central Mystic Sun Core
r_core = 50
draw.ellipse([cx - r_core, cy - r_core, cx + r_core, cy + r_core], outline=(245, 196, 82, 255), width=3)
for i in range(16):
    a = i * (2 * math.pi / 16)
    x1 = cx + (r_core - 8) * math.cos(a)
    y1 = cy + (r_core - 8) * math.sin(a)
    x2 = cx + (r_core + 8) * math.cos(a)
    y2 = cy + (r_core + 8) * math.sin(a)
    draw.line([(x1, y1), (x2, y2)], fill=(255, 255, 255, 240), width=2)

# Add glow bloom
mandala_glow = mandala.filter(ImageFilter.GaussianBlur(radius=6))
mandala_final = Image.alpha_composite(mandala_glow, mandala)
mandala_final.save(os.path.join(effects_dir, 'tao_mandala_grand.png'), 'PNG')
print("Tao Mandala Grand saved.")

# ============================================================
# 3. MING DYNASTY PORCELAIN SHARDS (ANCIENT VASE)
# ============================================================
print("Processing Ming Dynasty Vase Shards...")
vase_hd = Image.open(os.path.join(relic_dir, 'ming_vase_hd.jpg'))
# Crop the main body of the porcelain vase
vw, vh = vase_hd.size
# The vase is centered, roughly x: 0.25 to 0.75, y: 0.08 to 0.90
vase_body = vase_hd.crop((int(vw * 0.22), int(vh * 0.08), int(vw * 0.74), int(vh * 0.88)))
vase_body = vase_body.resize((320, 520), Image.Resampling.LANCZOS)

# Create 8 jagged porcelain shards with gold kintsugi / emerald fracture rims
shard_polys = [
    # Top rim & neck
    [(50, 0), (270, 0), (280, 80), (160, 95), (40, 75)],
    # Upper left shoulder
    [(40, 75), (160, 95), (150, 200), (20, 180)],
    # Upper right shoulder
    [(160, 95), (280, 80), (300, 190), (170, 210)],
    # Center left dragon body
    [(20, 180), (150, 200), (160, 320), (10, 310)],
    # Center right dragon body
    [(170, 210), (300, 190), (310, 325), (160, 320)],
    # Lower left landscape
    [(10, 310), (160, 320), (150, 430), (25, 420)],
    # Lower right landscape
    [(160, 320), (310, 325), (295, 430), (150, 430)],
    # Bottom heavy stone base
    [(25, 420), (295, 430), (280, 520), (40, 520)]
]

for idx, poly in enumerate(shard_polys):
    shard = Image.new('RGBA', (320, 520), (0, 0, 0, 0))
    # Create mask for poly
    mask = Image.new('L', (320, 520), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.polygon(poly, fill=255)
    
    # Paste vase body onto shard using mask
    shard.paste(vase_body, (0, 0), mask)
    
    # Draw radiant kintsugi / emerald fracture rim along edges
    s_draw = ImageDraw.Draw(shard)
    s_draw.polygon(poly, outline=(0, 255, 136, 230), width=3)
    s_draw.polygon(poly, outline=(245, 196, 82, 160), width=1)
    
    out_file = os.path.join(relic_dir, f'vase_grand_shard_{idx}.png')
    shard.save(out_file, 'PNG')

print("8 Grand Ming Vase Shards generated.")

# ============================================================
# 4. PRAGUE ASTRONOMICAL CLOCK DIAL & CELESTIAL RINGS
# ============================================================
print("Processing Prague Astronomical Clock Face...")
clock_hd = Image.open(os.path.join(relic_dir, 'prague_clock_hd.jpg'))
cw, ch = clock_hd.size
# Center of astronomical clock face in prague_clock_hd
# Center is approximately x: 0.495, y: 0.505, radius: ~1500px
clock_center_x = int(cw * 0.496)
clock_center_y = int(ch * 0.506)
radius = int(cw * 0.35)

clock_crop = clock_hd.crop((clock_center_x - radius, clock_center_y - radius, clock_center_x + radius, clock_center_y + radius))
clock_crop = clock_crop.resize((420, 420), Image.Resampling.LANCZOS)

# Circular mask
mask = Image.new('L', (420, 420), 0)
m_draw = ImageDraw.Draw(mask)
m_draw.ellipse([5, 5, 415, 415], fill=255)

clock_face = Image.new('RGBA', (420, 420), (0, 0, 0, 0))
clock_face.paste(clock_crop, (0, 0), mask)
c_draw = ImageDraw.Draw(clock_face)
c_draw.ellipse([5, 5, 415, 415], outline=(245, 196, 82, 255), width=5)
c_draw.ellipse([15, 15, 405, 405], outline=(0, 255, 136, 180), width=2)

clock_face.save(os.path.join(relic_dir, 'clock_grand_face.png'), 'PNG')
print("Prague Clock Grand Face generated.")

# ============================================================
# 5. HUBBLE BUBBLE NEBULA COSMIC ORB PRISMS
# ============================================================
print("Processing Hubble Cosmic Orb Prisms...")
nebula_src = os.path.join(relic_dir, 'space_galaxy.jpg')
nebula_im = Image.open(nebula_src)
nw, nh = nebula_im.size
# Crop the central spherical bubble
nebula_bubble = nebula_im.crop((int(nw * 0.22), int(nh * 0.25), int(nw * 0.92), int(nh * 0.95)))
nebula_bubble = nebula_bubble.resize((360, 360), Image.Resampling.LANCZOS)

# Create 8 faceted crystal prism shells
prism_angles = [
    (0, 45), (45, 90), (90, 135), (135, 180),
    (180, 225), (225, 270), (270, 315), (315, 360)
]

for idx, (a_start, a_end) in enumerate(prism_angles):
    facet = Image.new('RGBA', (200, 200), (0, 0, 0, 0))
    mask = Image.new('L', (200, 200), 0)
    m_draw = ImageDraw.Draw(mask)
    
    # Outer polygon petal
    pts = [
        (100, 100),
        (int(100 + 95 * math.cos(math.radians(a_start))), int(100 + 95 * math.sin(math.radians(a_start)))),
        (int(100 + 98 * math.cos(math.radians((a_start + a_end) / 2))), int(100 + 98 * math.sin(math.radians((a_start + a_end) / 2)))),
        (int(100 + 95 * math.cos(math.radians(a_end))), int(100 + 95 * math.sin(math.radians(a_end))))
    ]
    m_draw.polygon(pts, fill=255)
    
    # Crop matching region from nebula
    crop_neb = nebula_bubble.crop((80, 80, 280, 280))
    facet.paste(crop_neb, (0, 0), mask)
    
    # Glass refraction and iridescent violet/cyan edge
    f_draw = ImageDraw.Draw(facet)
    f_draw.polygon(pts, outline=(197, 64, 255, 230), width=3)
    f_draw.polygon(pts, outline=(61, 240, 213, 190), width=1)
    
    out_file = os.path.join(relic_dir, f'orb_grand_prism_{idx}.png')
    facet.save(out_file, 'PNG')

print("8 Hubble Cosmic Orb Prism Facets generated.")
print("ALL ASSETS PROCESSED SUCCESSFULLY!")

