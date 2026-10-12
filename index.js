let { app, ipcMain, nativeTheme, BrowserWindow, Tray } = require('electron');
let path = require('path');

let Widgets = require("./widget");
// let Processer = require("./processer");

let manager;
let tray;

let exeDir = path.dirname(app.getPath('exe'));
console.log(exeDir);

nativeTheme.themeSource = 'dark'

app.whenReady().then(() => {
    manager = new BrowserWindow({
        title: 'MystBrowser',
        icon: path.join(__dirname, 'MystBrowser.png'),
        webPreferences: {
            devTools: true,
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });
    manager.loadFile(path.join(__dirname, 'manager.html')); 
    manager.setMenuBarVisibility(false);

    // manager.webContents.openDevTools();

    tray = new Tray(path.join(__dirname, 'MystBrowser.png')); 
    tray.setToolTip('MystBrowser');

    manager.on('minimize', (event) => {
        event.preventDefault();
        manager.hide();
    });

    manager.on('closed', () => {
        Widgets.closed();
        app.quit();
    });

    tray.on('click', () => {
        if (!manager || manager.isDestroyed()) return;
        if (manager.isVisible()) {
            manager.focus();
        } else {
            manager.show();
        }
    });

    Widgets.init(manager, exeDir);
    Widgets.loadWidgets();
    Widgets.update();

    ipcMain.on('refresh-widget', (event) => {Widgets.update()});
    ipcMain.on('save-widget', (event, {index, enable, positionX, positionY, sizeW, sizeH, attach}) => {
        Widgets.saveWidget(index, enable, positionX, positionY, sizeW, sizeH, attach);
    });
    ipcMain.on('destroy-widget', (event, { index }) => {Widgets.destroyWidget(index)});
    ipcMain.on('upload-widget', (event) => {Widgets.uploadWidgets()});

    // ipcMain.handle('run-exe', async (event, {path, args}) => {return Processer.runExe(path, args)});
    // ipcMain.handle('get-system', async () => {return Processer.getSystem()});
    // ipcMain.handle('get-file-icon', async (event, {path}) => {return Processer.getFileIcon(path)});
});