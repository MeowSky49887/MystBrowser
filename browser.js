let { BaseWindow, WebContentsView } = require('electron');
let MystWin = require('./MystWin/lib/mystwin');
let path = require('path');

let targetWindows = {};

let tabsId = new Map();

let tabsParent = {};
let tabsInfo = {};

let tabCache;

let manager;

function createTargetWindow() {
    let newWindow = new BaseWindow({
        title: 'MystBrowser',
        icon: path.join(__dirname, 'MystBrowser.png'),
        hasShadow: false,
        roundedCorners: false,
        transparent: true,
        skipTaskbar: true,
        backgroundMaterial: "none",
        backgroundColor: "rgba(0, 0, 0, 0)",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    }); 

    newWindow.setMenuBarVisibility(false);

    newWindow.setPosition(100, 100);
    newWindow.setSize(800, 600);

    return newWindow;
}

function resize(view, win) {
    let titleBar = win == manager ? 80 : 0;
    let bounds = win.getContentBounds();
    view.setBounds({ x: 0, y: titleBar, width: bounds.width, height: bounds.height - titleBar });
    win.on('resize', () => {
        let bounds = win.getContentBounds();
        view.setBounds({ x: 0, y: titleBar, width: bounds.width, height: bounds.height - titleBar });
    });      
    win.on('maximize', () => {
        let bounds = win.getContentBounds();
        view.setBounds({ x: 0, y: titleBar, width: bounds.width, height: bounds.height - titleBar });
    });  
    win.on('unmaximize', () => {
        let bounds = win.getContentBounds();
        view.setBounds({ x: 0, y: titleBar, width: bounds.width, height: bounds.height - titleBar });
    });  
}

exports.init = (m) => manager = m;

exports.closed = () => {
    for (let id in targetWindows) {
        let win = BaseWindow.fromId(parseInt(id));
        if (win) win.close();
    }
    targetWindows = {};
}

exports.update = (bool) => {
    if (bool) {
        tabsId.forEach((tab, id) => {
            let focusedWindow = tabsParent[id];
            if (focusedWindow == manager) {
                if (tab.getVisible()) tabCache = tab;
                tab.setVisible(false);
            }
        });
    } else {
        tabCache.setVisible(true);
        tabCache = null;
    }
    manager.webContents.send('tab-update', tabsInfo);
}

exports.createTab = (url) => {
    if (!manager || manager.isDestroyed()) return;

    let newView = new WebContentsView();
    let content = newView.webContents;
    newView.setBackgroundColor("rgba(0, 0, 0, 0)");

    content.loadURL(url);

    tabsId.set(content.id, newView);

    manager.contentView.addChildView(newView);
    tabsParent[content.id] = manager;

    if (tabsParent[content.id] == manager) {
        resize(newView, manager);
    }

    content.on('dom-ready', (event , title) => {
        if (!manager || manager.isDestroyed()) return;

        let current = content.navigationHistory.getEntryAtIndex(content.navigationHistory.getActiveIndex());

        tabsInfo[content.id] = {
            "title": current.title,
            "url": current.url,
        };

        manager.webContents.send('tab-update', tabsInfo);
    });

    content.on('destroyed', () => {
        if (!manager || manager.isDestroyed()) return;

        tabsId.delete(content.id);

        delete tabsParent[content.id];
        delete tabsInfo[content.id];

        manager.webContents.send('tab-update', tabsInfo);
    })

    return newView;
}

exports.control = (index, action, params) => {
    if (!tabsId.get(parseInt(index))) return;
    let focusedWindow = tabsParent[parseInt(index)];
    if (!focusedWindow || focusedWindow.isDestroyed() || focusedWindow == manager) return;
    switch (action) {
        case 'attachAsWallpaper': 
            MystWin.detachWindow(focusedWindow);
            MystWin.attachAsWallpaper(focusedWindow); 
            break;
        case 'attachAsDesktop': 
            MystWin.detachWindow(focusedWindow);    
            MystWin.attachAsDesktop(focusedWindow); 
            break;
        case 'attachToTop': 
            MystWin.detachWindow(focusedWindow);
            MystWin.attachToTop(focusedWindow); 
            break;
        case 'detachWindow': MystWin.detachWindow(focusedWindow); break;
        case 'sendToBack': MystWin.sendToBack(focusedWindow); break;
        case 'bringToFront': MystWin.bringToFront(focusedWindow); break;
        case 'maximize':
            if (focusedWindow.isMaximized()) {
                focusedWindow.unmaximize(); 
            } else {
                focusedWindow.maximize(); 
            }
            break;
        case 'minimize':
            if (focusedWindow.isMinimized()) {
                focusedWindow.restore(); 
            } else {
                focusedWindow.minimize(); 
            }
            break;
        case 'close': focusedWindow.close(); break;
        case 'moveWindow': 
            MystWin.moveWindow(focusedWindow, params.x, params.y);
            break;
        case 'resizeWindow': 
            MystWin.resizeWindow(focusedWindow, params.w, params.h);
            break;
    }
}

exports.loadURL = (index, url) => {
    if (!tabsId.get(parseInt(index))) return;
    tabsId.get(parseInt(index)).webContents.loadURL(url);
}

exports.navigate = (index, direction) => {
    if (!tabsId.get(parseInt(index))) return;
    let content = tabsId.get(parseInt(index)).webContents;
    let history = content.navigationHistory;
    if (direction === "back" && history.canGoBack()) history.goBack();
    if (direction === "forward" && history.canGoForward()) history.goForward();
    if (direction === "reload") tabsId.reload();
}

exports.popTab = (index) => {
    if (!tabsId.get(parseInt(index))) return;
    if (tabsParent[parseInt(index)] != manager) return;

    let win = createTargetWindow();
    MystWin.detachWindow(win);

    win.contentView.addChildView(tabsId.get(parseInt(index)));

    targetWindows[win.id] = ""
    tabsParent[parseInt(index)] = win;

    if (tabsParent[parseInt(index)] != manager) {
        resize(tabsId.get(parseInt(index)), win);
    }

    win.on('close', () => {
        if (!manager || manager.isDestroyed()) return;

        manager.contentView.addChildView(tabsId.get(parseInt(index)));

        delete targetWindows[win.id];
        tabsParent[parseInt(index)] = manager;

        if (tabsParent[parseInt(index)] == manager) {
            resize(tabsId.get(parseInt(index)), manager);
        }

        manager.webContents.send('toggle-manager', tabsParent[parseInt(index)] == manager ? "hidden" : "visible");
    });

    manager.webContents.send('toggle-manager', tabsParent[parseInt(index)] == manager ? "hidden" : "visible");
}

exports.switchTab = (index) => {
    if (!tabsId.get(parseInt(index))) return;
    tabsId.forEach((tab, id) => {
        let focusedWindow = tabsParent[id];
        if (focusedWindow == manager) {
            tab.setVisible(id == parseInt(index));
        }
    });
    manager.webContents.send('toggle-manager', tabsParent[parseInt(index)] == manager ? "hidden" : "visible");
}

exports.destroyTab = (index) => {
    if (!tabsId.get(parseInt(index))) return;
    tabsId.forEach((tab, id) => {
        let focusedWindow = tabsParent[id];
        if (focusedWindow == manager) {
            tab.setVisible(id == parseInt(index));
        }
    });
    manager.webContents.send('toggle-manager', tabsParent[parseInt(index)] == manager ? "hidden" : "visible");
}