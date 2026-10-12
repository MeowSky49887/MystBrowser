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
                let view = new WebContentsView({
                    webPreferences: {
                        preload: path.join(__dirname, 'api.js'),
                        contextIsolation: true,
                        enableRemoteModule: false,
                        nodeIntegration: false
                    }
                });

                const entry = getWidgetEntry(widgetData.folder);

                if (!entry) return;

                if (entry.type === "html") {
                    view.webContents.loadFile(entry.path);
                } else {
                    view.webContents.loadURL(entry.url);
                }
                
                view.setBackgroundColor("rgba(0, 0, 0, 0)");

                // view.webContents.openDevTools();

                let win = createTargetWindow();
                
                if (win != null) {

                    MystWin.moveWindow(win, widgetData.positionX, widgetData.positionY);
                    MystWin.resizeWindow(win, widgetData.sizeW, widgetData.sizeH);

                    MystWin[{
                        "Wallpaper": "attachAsWallpaper",
                        "Desktop": "attachAsDesktop",
                        "Top": "attachToTop"
                    }[widgetData.attach] || "detachWindow"](win);

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
    if (!fs.statSync(fullPath).isDirectory()) return null;
    if (!getWidgetEntry(fullPath)) return null;

    return parseRectJSON(path.join(fullPath, "rect.json"));
}

function getWidgetEntry(fullPath) {
    const htmlPath = path.join(fullPath, "index.html");
    const urlPath = path.join(fullPath, "index.url");

    // Prefer index.html if it exists
    if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
        return {
            type: "html",
            path: htmlPath
        };
    }

    // Otherwise, read the Internet Shortcut file
    if (fs.existsSync(urlPath) && fs.statSync(urlPath).isFile()) {
        try {
            const content = fs.readFileSync(urlPath, "utf8");

            const match = content.match(/^\s*URL\s*=\s*(.+?)\s*$/im);
            if (!match) {
                console.error("No URL= entry found in:", urlPath);
                return null;
            }

            const url = match[1].trim();
            const parsed = new URL(url);

            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                console.error("Unsupported URL protocol:", url);
                return null;
            }

            return {
                type: "url",
                url
            };
        } catch (error) {
            console.error("Failed to read index.url:", urlPath, error);
            return null;
        }
    }

    return null;
}

function loadWidgets() {
    try {
        const dir = path.join(exeDir, "widgets");
        const result = {};

        fs.mkdirSync(dir, { recursive: true });

        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            if (!item.isDirectory()) continue;

            const fullPath = path.join(dir, item.name);
            const rectData = validateDir(fullPath);

            if (!rectData) continue;

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
        console.error("Error loading widgets:", e);
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