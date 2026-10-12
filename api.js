const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mystAPI', {
    runExe: (path, args) => ipcRenderer.invoke('run-exe', { path, args }),
    getFileIcon: (path) => ipcRenderer.invoke('get-file-icon', { path }),
    getSystem: () => ipcRenderer.invoke('get-system')
});
