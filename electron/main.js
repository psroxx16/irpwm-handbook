// IRPWM Handbook — Windows desktop shell (Electron)
const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

if (!app.requestSingleInstanceLock()) app.quit();

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 360, minHeight: 500,
    backgroundColor: '#17212B', title: 'IRPWM Handbook', show: false,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true, spellcheck: false }
  });
  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(__dirname, '..', 'www', 'index.html'), { hash: 'home' });
  // Open web links in the user's browser; keep in-app hash links inside the app
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (/^https?:/.test(url)) { e.preventDefault(); shell.openExternal(url); } });
}

Menu.setApplicationMenu(null);
app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
