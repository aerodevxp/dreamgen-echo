const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
});

contextBridge.exposeInMainWorld('menuAPI', {
    showMenu: () => ipcRenderer.send('show-menu'),
    hideMenu: () => ipcRenderer.send('hide-menu'),
  });