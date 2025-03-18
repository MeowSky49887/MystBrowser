MystWin
==============

> Node module that allows you to modify a bunch of window's properties in Windows.

*This module only supports Windows (Tested on Windows 10)*

Installation
------------

Install `mystwin` by running:

```sh
$ npm install --save https://github.com/MeowSky49887/MystWin.git
```

Documentation
-------------

**Example**

```js
const { app, BrowserWindow, globalShortcut } = require('electron');
const MystWin = require('mystwin');
const path = require('path');

let mainWindow;
let isAttachedAsWallpaper = false; // State to track attachment status

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    frame: false,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL('https://www.youtube.com/');

  // Register a global shortcut for F11
  globalShortcut.register('F11', () => {
    if (isAttachedAsWallpaper) {
      MystWin.detachWindow(mainWindow);
    } else {
      MystWin.attachAsWallpaper(mainWindow);
    }
    isAttachedAsWallpaper = !isAttachedAsWallpaper; // Toggle the state
  });

  // Handle the case when the app quits
  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

```
