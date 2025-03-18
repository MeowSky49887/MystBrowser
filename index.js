let { app, ipcMain, nativeTheme, BrowserWindow, Tray } = require('electron');
let path = require('path');

const Browser = require("./browser");
const Widgets = require("./widget");

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
    manager.loadFile(path.join(__dirname, 'browser-manager.html')); 
    manager.setMenuBarVisibility(false);

    // manager.webContents.openDevTools();

    tray = new Tray(path.join(__dirname, 'MystBrowser.png')); 
    tray.setToolTip('MystBrowser');

    manager.on('minimize', (event) => {
        event.preventDefault();
        manager.hide();
    });

    manager.on('closed', () => {
        Browser.closed();
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

    Browser.init(manager);
    Widgets.init(manager, exeDir);
    
    Browser.createTab("https://www.google.com/");
    Widgets.loadWidgets();

    ipcMain.on('manage-widget', (event, bool) => {
        if (!manager || manager.isDestroyed()) return;
        if (bool) {
            manager.loadFile(path.join(__dirname, 'widgets-manager.html')); 
            manager.webContents.on('did-finish-load', (event) => {
                Browser.update(bool);
                Widgets.update();
            });
        } else {
            manager.loadFile(path.join(__dirname, 'browser-manager.html'));
            manager.webContents.on('did-finish-load', (event) => {
                Browser.update(bool);
                Widgets.update();
            });
        }
    });

    ipcMain.on('control-action', (event, { index, action, params }) => {Browser.control(index, action, params)});
    ipcMain.on('load-url', (event, { index, url }) => {Browser.loadURL(index, url)});
    ipcMain.on('nav-back', (event, index) => {Browser.navigate(index, "back")});
    ipcMain.on('nav-forward', (event, index) => {Browser.navigate(index, "forward")});
    ipcMain.on('refresh-page', (event, index) => {Browser.navigate(index, "reload")});
    ipcMain.on('pop-tab', (event, index) => {Browser.popTab(index)});
    ipcMain.on('switch-tab', (event, index) => {Browser.switchTab(index)});
    ipcMain.on('destroy-tab', (event, index) => {Browser.destroyTab(index)});
    ipcMain.on('add-tab', (event) => {Browser.createTab("https://www.google.com/")});
    ipcMain.on('toggle-theme', (event, theme) => {nativeTheme.themeSource = theme});

    ipcMain.on('save-widget', (event, {index, enable, positionX, positionY, sizeW, sizeH, attach}) => {
        Widgets.saveWidget(index, enable, positionX, positionY, sizeW, sizeH, attach);
    });
    ipcMain.on('destroy-widget', (event, index) => {Widgets.destroyWidget(index)});
    ipcMain.on('upload-widget', (event) => {Widgets.uploadWidgets()});
});