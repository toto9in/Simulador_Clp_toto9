const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Check if running in Electron
  isElectron: () => ipcRenderer.invoke('app:isElectron'),

  // Get app version
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  // File dialogs
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content) => ipcRenderer.invoke('dialog:saveFile', content),
});

// Log that preload script has loaded
console.log('Preload script loaded successfully');
