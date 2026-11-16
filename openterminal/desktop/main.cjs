const { app, BrowserWindow, dialog, shell, Menu } = require('electron');
const { spawn } = require('node:child_process');
const { createServer } = require('node:net');
const { join } = require('node:path');
const { mkdirSync, openSync, readFileSync, writeFileSync } = require('node:fs');
const { randomBytes } = require('node:crypto');
const children = [];
let quitting = false;
app.setName('J&J Equity');
if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if(w) { if(w.isMinimized()) w.restore(); w.focus(); } });
const port = (preferred = 0) => new Promise((resolve, reject) => { const s = createServer(); s.on('error', error => { if(preferred && error.code === "EADDRINUSE") port().then(resolve,reject); else reject(error); }); s.listen(preferred, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
async function ready(url) {
  for(let i=0;i<120;i++) {
    try { const r = await fetch(url); if(r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('The local service did not start. See desktop.log in the app data folder.');
}
app.on('before-quit', () => { quitting = true; children.forEach(p => p.kill()); });
app.on('window-all-closed', () => app.quit());
app.whenReady().then(async () => {
  const base = join(process.resourcesPath, 'runtime');
  const data = app.getPath('userData');
  mkdirSync(data, { recursive: true });
  const log = openSync(join(data, 'desktop.log'), 'a');
  let savedPorts = {};
  try { savedPorts = JSON.parse(readFileSync(join(data, 'desktop-ports.json'), 'utf8')); } catch {}
  if (!savedPorts.schemaVersion) {
    try { const legacy = readFileSync(join(data, 'desktop.log'), 'utf8').match(/Local:\s+http:\/\/127\.0\.0\.1:(\d+)/); if (legacy) savedPorts.webPort = Number(legacy[1]); } catch {}
  }
  const apiPort = await port(savedPorts.apiPort || 62102);
  const webPort = await port(savedPorts.webPort || 62101);
  const wmApiPort = await port(savedPorts.wmApiPort || 62104);
  writeFileSync(join(data, 'desktop-ports.json'), JSON.stringify({schemaVersion:1,apiPort,webPort,wmApiPort}));
  mkdirSync(join(data,'worldmonitor'), {recursive:true});
  const origin = `http://127.0.0.1:${webPort}`;
  const env = { ...process.env, NODE_ENV: 'production', DATA_DIR: data, API_KEY: randomBytes(32).toString('hex'), API_HOST: '127.0.0.1', API_PORT: String(apiPort), API_URL: `http://127.0.0.1:${apiPort}`, WEB_ORIGIN: origin, PORT: String(webPort), HOSTNAME: '127.0.0.1', NEXT_TELEMETRY_DISABLED: '1', INTELLIGENCE_API_URL: `http://127.0.0.1:${wmApiPort}`, LOCAL_API_PORT: String(wmApiPort), LOCAL_API_RESOURCE_DIR: join(base, 'worldmonitor'), LOCAL_API_DATA_DIR: join(data, 'worldmonitor'), LOCAL_API_MODE: 'desktop-sidecar', LOCAL_API_CLOUD_FALLBACK: 'true', LOCAL_API_APP_VERSION: '2.11.6', LOCAL_API_TOKEN: randomBytes(32).toString('hex'), WM_SESSION_SECRET: randomBytes(32).toString('hex'), JJ_PARENT_ORIGIN: origin };
  env.INTELLIGENCE_TOKEN = env.LOCAL_API_TOKEN;
  delete env.NODE_OPTIONS;
  function start(script, cwd) {
    const p = spawn(join(base, 'node'), [script], { cwd, env, stdio: ['ignore', log, log] });
    children.push(p);
    p.on('error', error => { if(!quitting) { dialog.showErrorBox('J&J Equity could not start', error.message); app.quit(); } });
    p.on('exit', () => { if(!quitting) { dialog.showErrorBox('J&J Equity stopped', 'A local service stopped unexpectedly. Restart the app. Details are in '+join(data,'desktop.log')); app.quit(); } });
  }
  start(join(base, 'intelligence-service.cjs'), base);
  await ready(`http://127.0.0.1:${wmApiPort}/api/sidecar-health`);
  start(join(base, 'api', 'index.mjs'), base);
  await ready(`http://127.0.0.1:${apiPort}/api/status`);
  start(join(base, 'web', 'web', 'server.js'), join(base, 'web', 'web'));
  await ready(origin);
  const win = new BrowserWindow({ title: 'J&J Equity', width: 1440, height: 960, minWidth: 1000, minHeight: 650, backgroundColor: '#09090b', webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true } });
  win.webContents.setWindowOpenHandler(({url}) => { if(/^https?:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (event, url) => { if(new URL(url).origin !== origin) { event.preventDefault(); if(/^https?:\/\//.test(url)) shell.openExternal(url); } });
  Menu.setApplicationMenu(Menu.buildFromTemplate([{label: app.name, submenu:[{role:'about'},{label:'Source and licences',click:() => shell.showItemInFolder(join(process.resourcesPath,'J&J-Equity-Source.zip'))},{type:'separator'},{role:'quit'}]}, {role:'editMenu'}, {role:'viewMenu'}, {role:'windowMenu'}]));
  await win.loadURL(origin);
}).catch(error => { dialog.showErrorBox('J&J Equity could not start', error.message); app.quit(); });
