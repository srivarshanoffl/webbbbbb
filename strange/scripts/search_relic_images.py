import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def search_wikimedia(query, limit=5):
    api_url = f"https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch={urllib.parse.quote(query)}&gsrlimit={limit}&prop=imageinfo&iiprop=url|size|mime"
    req = urllib.request.Request(api_url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            results = []
            for pid, pdata in pages.items():
                infos = pdata.get('imageinfo', [])
                if infos:
                    url = infos[0].get('url')
                    results.append((pdata.get('title'), url, infos[0].get('width'), infos[0].get('height')))
            return results
    except Exception as e:
        print(f"Error searching {query}: {e}")
        return []

print("--- VASE ---")
for r in search_wikimedia("antique ornate porcelain vase high resolution", 3):
    print(r)

print("--- CLOCK ---")
for r in search_wikimedia("astronomical clock prague dial face", 3):
    print(r)

print("--- ORB / NEBULA ---")
for r in search_wikimedia("celestial sphere glass crystal orb nebula", 3):
    print(r)

