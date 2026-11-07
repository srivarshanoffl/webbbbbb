import urllib.request
import json
import urllib.parse

headers = {'User-Agent': 'AntigravityGameDev/1.0 (contact@example.com)'}

def search_commons(query):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&srnamespace=6&format=json"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        titles = [item['title'] for item in data['query']['search'][:4]]
    
    results = []
    for t in titles:
        info_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(t)}&prop=imageinfo&iiprop=url|size&format=json"
        req = urllib.request.Request(info_url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            idata = json.loads(resp.read().decode('utf-8'))
            for pid, pinfo in idata['query']['pages'].items():
                if 'imageinfo' in pinfo:
                    results.append((t, pinfo['imageinfo'][0]['url'], pinfo['imageinfo'][0]['width'], pinfo['imageinfo'][0]['height']))
    return results

print("VASE:")
for r in search_commons("Ming dynasty vase porcelain"):
    print(r)

print("\nCLOCK:")
for r in search_commons("Orloj Prague astronomical clock face"):
    print(r)

