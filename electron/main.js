// IRPWM — Windows desktop shell (Electron). Serves the offline app from a private app:// scheme.
const { app, BrowserWindow, shell, Menu, protocol, net } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const WWW = path.join(__dirname, '..', 'www');
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }
]);
if (!app.requestSingleInstanceLock()) app.quit();

function createWindow() {
  const win = new BrowserWindow({
    width: 1360, height: 900, minWidth: 380, minHeight: 520,
    backgroundColor: '#102542', title: 'IRPWM — Indian Railways Permanent Way Manual', show: false,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true, spellcheck: false }
  });
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  win.loadURL('app://irpwm/index.html#/');
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (/^https?:/.test(url)) { e.preventDefault(); shell.openExternal(url); } });
  // Ctrl+P prints the current view
  win.webContents.on('before-input-event', (e, input) => {
    if (input.control && input.key.toLowerCase() === 'p') { e.preventDefault(); win.webContents.print(); }
  });
}

app.whenReady().then(() => {
  protocol.handle('app', (req) => {
    const u = new URL(req.url);
    let rel = decodeURIComponent(u.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.normalize(path.join(WWW, rel));
    if (!file.startsWith(WWW)) return new Response('Not found', { status: 404 });
    return net.fetch(pathToFileURL(file).toString());
  });
  Menu.setApplicationMenu(null);
  createWindow();
});
app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
app.on('window-all-closed', () => app.quit());
