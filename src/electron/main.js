const { app, BrowserWindow } = require('electron');
const path = require('path');

const initApi = require('./api');

const isDev = process.env.APP_DEV ? process.env.APP_DEV.trim() == 'true' : false;

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    ...(isDev ? { width: 1200, height: 800 } : { fullscreen: true }),
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadURL('http://localhost:3000');

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  initApi();

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
