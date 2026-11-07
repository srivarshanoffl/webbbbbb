import urllib.request
import os
from PIL import Image

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://commons.wikimedia.org/'
}

downloads = [
    ('https://upload.wikimedia.org/wikipedia/commons/e/e1/Ming_Porcelain_Vase_01.jpg', r'c:\Users\sriva\strange portals\three-lost-relics\assets\relics\ming_vase_hd.jpg'),
    ('https://upload.wikimedia.org/wikipedia/commons/2/2d/Czech-2013-Prague-Astronomical_clock_face.jpg', r'c:\Users\sriva\strange portals\three-lost-relics\assets\relics\prague_clock_hd.jpg')
]

for url, dest in downloads:
    try:
        print(f"Downloading {url}...")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            with open(dest, 'wb') as f:
                f.write(resp.read())
        im = Image.open(dest)
        print(f"Saved {dest}: {im.size}")
    except Exception as e:
        print(f"Failed {url}: {e}")
