const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    addTab: () => ipcRenderer.send('add-tab'),
    sendAction: (index, action, params) => ipcRenderer.send('control-action', { index, action, params }),
    loadURL: (index, url) => ipcRenderer.send('load-url', { index, url }),
    navBack: (index) => ipcRenderer.send('nav-back', index),
    navForward: (index) => ipcRenderer.send('nav-forward', index),
    refreshPage: (index) => ipcRenderer.send('refresh-page', index),
    popTab: (index) => ipcRenderer.send('pop-tab', index),
    switchTab: (index) => ipcRenderer.send('switch-tab', index),
    destroyTab: (index) => ipcRenderer.send('destroy-tab', index),
    manageWidgets: (bool) => ipcRenderer.send('manage-widget', bool),
    toggleTheme: (theme) => ipcRenderer.send('toggle-theme', theme),
    toggleManager: (callback) => ipcRenderer.on('toggle-manager', (event, visibility) => callback(visibility)),
    onTabUpdate: (callback) => ipcRenderer.on('tab-update', (event, info) => callback(info)),
    uploadWidget: () => ipcRenderer.send('upload-widget'),
    saveWidget: (index, enable, positionX, positionY, sizeW, sizeH, attach) => ipcRenderer.send('save-widget', { index, enable, positionX, positionY, sizeW, sizeH, attach }),
    destroyWidget: (index) => ipcRenderer.send('destroy-widget', index),
    onWidgetUpdate: (callback) => ipcRenderer.on('widget-update', (event, info) => callback(info))
});
