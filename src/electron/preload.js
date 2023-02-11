const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('remote', {
  selectFolder: () => ipcRenderer.invoke('selectFolder'),
  getPics: (dir) => ipcRenderer.invoke('getPics', dir),
  readImage: (img, width, height) => ipcRenderer.invoke('readImage', img, width, height),
  copyFile: (source, target) => ipcRenderer.invoke('copyFile', source, target),
  unlink: (source) => ipcRenderer.invoke('unlink', source),
})
