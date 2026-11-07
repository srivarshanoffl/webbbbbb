const https = require('https');

async function searchPng(q) {
  return new Promise((resolve) => {
    const url = 'https://www.pngall.com/?s=' + encodeURIComponent(q);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let html = '';
      res.on('data', d => html += d);
      res.on('end', () => {
        const matches = html.match(/href="(https:\/\/www\.pngall\.com\/[^\"]+-png\/)"/g);
        console.log('Results for', q, matches ? matches.slice(0, 5) : 'none');
        resolve();
      });
    }).on('error', (e) => {
      console.log('Error', e.message);
      resolve();
    });
  });
}

(async () => {
  await searchPng('portal');
  await searchPng('cyberpunk');
  await searchPng('laser');
  await searchPng('machine');
})();

