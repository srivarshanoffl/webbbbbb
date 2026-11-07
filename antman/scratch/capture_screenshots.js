const http = require('node:http');
const net = require('node:net');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const WORKSPACE_ROOT = 'c:\\Users\\sriva\\parllel3';
const ARTIFACT_DIR = 'C:\\Users\\sriva\\.gemini\\antigravity\\brain\\7d57f027-dd70-4f13-9632-028d191be315';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function getFreePort() {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
  });
}

function createServer() {
  return http.createServer((req, res) => {
    try {
      const urlPath = req.url.split('?')[0];
      const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
      let filePath = path.join(WORKSPACE_ROOT, safePath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
    } catch (e) {
      res.writeHead(500);
      res.end(e.message);
    }
  });
}

function findBrowser() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  return candidates.find(p => fs.existsSync(p));
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const server = createServer();
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browserBin = findBrowser();
  const cdpPort = await getFreePort();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'screenshot-profile-'));
  const targetUrl = `http://127.0.0.1:${port}/index.html`;

  const proc = spawn(browserBin, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--disable-translate',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-first-run',
    '--safebrowsing-disable-auto-update',
    '--window-size=1200,800',
    targetUrl
  ], { stdio: 'ignore' });

  // Wait for CDP version
  let wsUrl = null;
  const startWait = Date.now();
  while (Date.now() - startWait < 10000) {
    try {
      const version = await fetchJson(`http://127.0.0.1:${cdpPort}/json/version`);
      if (version && version.webSocketDebuggerUrl) {
        wsUrl = version.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 200));
  }

  let pageTarget = null;
  const targetStart = Date.now();
  while (Date.now() - targetStart < 6000) {
    try {
      const pages = await fetchJson(`http://127.0.0.1:${cdpPort}/json/list`);
      pageTarget = pages.find(p => p.url.includes('index.html') && p.webSocketDebuggerUrl);
      if (pageTarget) break;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 200));
  }

  const activeWsUrl = pageTarget ? pageTarget.webSocketDebuggerUrl : wsUrl;
  const ws = new WebSocket(activeWsUrl);
  let msgId = 1;
  const callbacks = new Map();

  ws.addEventListener('message', (evt) => {
    const data = JSON.parse(evt.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    }
  });

  await new Promise(r => ws.addEventListener('open', r));

  function call(method, params = {}) {
    return new Promise(r => {
      const id = msgId++;
      callbacks.set(id, r);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await call('Runtime.enable');
  await call('Page.enable');

  await new Promise(r => setTimeout(r, 800));

  async function snap(name) {
    const shot = await call('Page.captureScreenshot', { format: 'png' });
    if (shot.result && shot.result.data) {
      fs.writeFileSync(path.join(ARTIFACT_DIR, name), Buffer.from(shot.result.data, 'base64'));
      console.log('Saved', name);
    }
  }

  // Phase 1
  await snap('phase1_screenshot.png');

  // Advance to Phase 2
  await call('Runtime.evaluate', {
    expression: `window.UIManager.transitionToPhase(2);`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 600));
  await snap('phase2_screenshot.png');

  // Advance to Phase 3
  await call('Runtime.evaluate', {
    expression: `window.UIManager.transitionToPhase(3);`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 600));
  await snap('phase3_screenshot.png');

  // Advance to Phase 4
  await call('Runtime.evaluate', {
    expression: `window.UIManager.transitionToPhase(4);`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 600));
  await snap('phase4_screenshot.png');

  // Advance to Phase 5
  await call('Runtime.evaluate', {
    expression: `window.UIManager.transitionToPhase(5);`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 600));
  await snap('phase5_screenshot.png');

  // Advance to Phase 8
  await call('Runtime.evaluate', {
    expression: `window.UIManager.transitionToPhase(8);`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 600));
  await snap('phase8_screenshot.png');

  try { ws.close(); } catch (e) {}
  try { proc.kill(); } catch (e) {}
  try { server.close(); } catch (e) {}
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
  console.log('Done capturing all screenshots');
}

main().catch(console.error);
