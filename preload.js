const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    refreshWidget: () => ipcRenderer.send('refresh-widget'),
    uploadWidget: () => ipcRenderer.send('upload-widget'),
    saveWidget: (index, enable, positionX, positionY, sizeW, sizeH, attach) => ipcRenderer.send('save-widget', { index, enable, positionX, positionY, sizeW, sizeH, attach }),
    destroyWidget: (index) => ipcRenderer.send('destroy-widget', { index }),
    onWidgetUpdate: (callback) => ipcRenderer.on('widget-update', (event, info) => callback(info))
});
