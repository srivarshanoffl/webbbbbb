import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def find_urls(url):
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            matches = re.findall(r'https?://[^\s"\'<>]+\.(?:png|jpg|jpeg)', html)
            return list(set(matches))
    except Exception as e:
        print("Error fetching", url, e)
        return []

pngs = find_urls("https://www.pngall.com/doctor-strange-casting-spell-png/")
for p in pngs:
    print("PNGAll:", p)

