const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    navigate: (url) => ipcRenderer.send('navigate', url),
    goBack: () => ipcRenderer.send('go-back'),
    goForward: () => ipcRenderer.send('go-forward'),
    reload: () => ipcRenderer.send('reload'),
    goHome: () => ipcRenderer.send('go-home'),

    onNavigateTo: (callback) => ipcRenderer.on('navigate-to', (event, url) => callback(url)),
    onGoBack: (callback) => ipcRenderer.on('go-back', callback),
    onGoForward: (callback) => ipcRenderer.on('go-forward', callback),
    onReload: (callback) => ipcRenderer.on('reload', callback)
});
