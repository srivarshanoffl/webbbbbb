import urllib.request
import os
from PIL import Image

headers = {'User-Agent': 'Mozilla/5.0'}
urls = [
    'https://www.pngmart.com/files/2/Doctor-Strange-PNG-Clipart.png',
    'https://www.pngmart.com/files/2/Doctor-Strange-PNG-File.png',
    'https://www.pngmart.com/files/2/Doctor-Strange-PNG-HD.png',
    'https://www.pngmart.com/files/2/Doctor-Strange-PNG-Photos.png',
    'https://www.pngmart.com/files/2/Doctor-Strange-PNG-Pic.png',
    'https://www.pngmart.com/files/2/Doctor-Strange-PNG-Transparent-Image.png',
    'https://www.pngmart.com/files/2/Doctor-Strange-Transparent-Background.png',
    'https://www.pngmart.com/files/2/Doctor-Strange-Transparent-PNG.png',
]

out_dir = r'c:\Users\sriva\strange portals\three-lost-relics\assets\characters\candidates'
os.makedirs(out_dir, exist_ok=True)

for u in urls:
    name = os.path.basename(u)
    out_path = os.path.join(out_dir, name)
    if not os.path.exists(out_path):
        try:
            req = urllib.request.Request(u, headers=headers)
            with urllib.request.urlopen(req) as resp:
                with open(out_path, 'wb') as f:
                    f.write(resp.read())
            im = Image.open(out_path)
            print(f"Downloaded {name}: {im.size}")
        except Exception as e:
            print(f"Failed {name}: {e}")
    else:
        im = Image.open(out_path)
        print(f"Exists {name}: {im.size}")

