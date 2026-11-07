import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0'}
url = 'https://www.pngmart.com/image/tag/doctor-strange'
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        matches = re.findall(r'https?://www\.pngmart\.com/files/[^\s"\'<>]+\.png', html)
        for m in sorted(set(matches)):
            print('Found:', m)
except Exception as e:
    print('Error:', e)

