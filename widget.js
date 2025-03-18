let { dialog, BaseWindow, WebContentsView } = require('electron');
let MystWin = require('./MystWin/lib/mystwin');
let path = require('path');
let fs = require('fs');

let widgetWindows = {};

let widgetsId = new Map();

let widgetsList = {};
let widgetsMapping = {};

let manager;

let exeDir;

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

function createWidgetWindows() {
    let entries = Object.entries(widgetsList);
    entries.forEach(([index, widgetData], _) => {
        try {
            if (widgetData.enable && !widgetsMapping[index]) {
                let view = new WebContentsView();
                view.webContents.loadFile(path.join(widgetData.folder, "index.html"));
                view.setBackgroundColor("rgba(0, 0, 0, 0)");

                let win = createTargetWindow();
                
                if (win != null) {
                    MystWin[{
                        "Wallpaper": "attachAsWallpaper",
                        "Desktop": "attachAsDesktop",
                        "Top": "attachToTop"
                    }[widgetData.attach] || "detachWindow"](win);

                    
                    MystWin.moveWindow(win, widgetData.positionX, widgetData.positionY);
                    MystWin.resizeWindow(win, widgetData.sizeW, widgetData.sizeH);

                    win.contentView.addChildView(view);

                    widgetWindows[win.id] = "";
                    widgetsMapping[index] = win.id;

                    widgetsId.set(win.id, win);

                    let bounds = win.getContentBounds();
                    view.setBounds({ x: 0, y: 0, width: bounds.width, height: bounds.height });
                    win.on('resize', () => {
                        let bounds = win.getContentBounds();
                        view.setBounds({ x: 0, y: 0, width: bounds.width, height: bounds.height });
                    });

                    win.on('close', () => {
                        if (!manager || manager.isDestroyed()) return;

                        view.webContents.close();
                        widgetsId.delete(win.id);

                        delete widgetWindows[win.id];
                        delete widgetsMapping[index];
                    })
                }
            }
        } catch (error) {
            console.error('Error loading widgets:', error);
        }
    });
}

function parseRectJSON(filePath) {
    try {
        let data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        let { enable, positionX, positionY, sizeW, sizeH, attach } = data;
        if (
            typeof enable === "boolean" &&
            typeof positionX === "number" &&
            typeof positionY === "number" &&
            typeof sizeW === "number" &&
            typeof sizeH === "number" &&
            ["Wallpaper", "Desktop", "Top", "None"].includes(attach)
        ) {
            return { enable, positionX, positionY, sizeW, sizeH, attach };
        }
        return null;
    } catch {
        return null;
    }
}

function validateDir(fullPath) {
    let files = fs.readdirSync(fullPath);
    if (!files.includes("index.html")) return null;
    if (!files.includes("rect.json")) return null;
    let rectData = parseRectJSON(path.join(fullPath, "rect.json"));
    return rectData;
}

function loadWidgets() {
    try {
        let dir = path.join(exeDir, 'widgets');
        let result = {};
        let items = fs.readdirSync(dir, { withFileTypes: true });
        for (let item of items) {
            if (!item.isDirectory()) continue;
            let fullPath = path.join(dir, item.name);
            let rectData = validateDir(fullPath);
            if (rectData == null) continue;
            result[item.name] = {
                folder: fullPath,
                enable: rectData.enable,
                positionX: rectData.positionX,
                positionY: rectData.positionY,
                sizeW: rectData.sizeW,
                sizeH: rectData.sizeH,
                attach: rectData.attach
            };
        }
        return result;
    } catch (e) {
        console.error('Error loading widgets:', e);
        return {};
    }
}

exports.init = (m, d) => {
    manager = m;
    exeDir = d;
}

exports.closed = () => {
    for (let id in widgetWindows) {
        let win = BaseWindow.fromId(parseInt(id));
        if (win) win.close();
    }
    widgetWindows = {};
}

exports.update = () => {
    manager.webContents.send('widget-update', widgetsList);
}

exports.loadWidgets = () => {
    widgetsList = loadWidgets();
    createWidgetWindows();
}

exports.uploadWidgets = (index) => {
    let selected = dialog.showOpenDialogSync(manager, {
        properties: ["openDirectory"]
    });

    if (selected) {
        selected.forEach(dir => {
            if (validateDir(dir) != null) {
                fs.mkdir(path.join(exeDir, "widgets", path.basename(dir)), { recursive: true, force: true }, (err) => {
                    if (err) throw err;

                    fs.cp(dir, path.join(exeDir, "widgets", path.basename(dir)), { recursive: true, force: true }, (err) => {
                        if (err) throw err;

                        widgetsList = loadWidgets();
                        createWidgetWindows();

                        manager.webContents.send('widget-update', widgetsList);
                    });
                });
            }
        });
    }
}

exports.saveWidget = (index, enable, positionX, positionY, sizeW, sizeH, attach) => {
    if (!widgetsList[index]) return;
    
    if (widgetsMapping[index]) {
        MystWin[{
            "Wallpaper": "attachAsWallpaper",
            "Desktop": "attachAsDesktop",
            "Top": "attachToTop"
        }[attach] || "detachWindow"](widgetsId.get(widgetsMapping[index]));
        
        MystWin.moveWindow(widgetsId.get(widgetsMapping[index]), positionX, positionY);
        MystWin.resizeWindow(widgetsId.get(widgetsMapping[index]), sizeW, sizeH);

        if (!enable) {
            widgetsId.get(widgetsMapping[index]).close();
        }
    }

    let json = {
        "enable": enable, "positionX": positionX, "positionY": positionY, "sizeW": sizeW, "sizeH": sizeH, "attach": attach
    };

    fs.writeFileSync(path.join(widgetsList[index]["folder"], "rect.json"), JSON.stringify(json, null, 2));
    
    widgetsList = loadWidgets();
    createWidgetWindows();
    manager.webContents.send('widget-update', widgetsList);
}

exports.destroyWidget = (index) => {
    if (!widgetsList[index]) return;

    fs.rm(widgetsList[index]["folder"], { recursive: true, force: true }, (err) => {
        if (err) throw err;

        if (widgetsMapping[index]) {
            widgetsId.get(widgetsMapping[index]).close();
        }

        widgetsList = loadWidgets();
        createWidgetWindows();
        manager.webContents.send('widget-update', widgetsList);
    });
}