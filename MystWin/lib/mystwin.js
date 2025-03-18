// @ts-check

/**
 * @module mystwin
 */

'use strict'

const bindings = require('bindings')
const mystwin = bindings('mystwin')

/**
 * @summary Attaches a window into the Desktop Wallpaper layer (1 layer above wallpaper).
 * @function
 * @public
 *
 * @param {import('electron').BrowserWindow} window
 *
 * @example
 * const MystWin = require('mystwin');
 * const currentWindow = require('electron').remote.getCurrentWindow();
 *
 * MystWin.attachAsWallpaper(currentWindow);
 */
exports.attachAsWallpaper = function attachAsWallpaper (window) {
  mystwin.attachAsWallpaper(window.getNativeWindowHandle())
}

/**
 * @summary Attaches a window into the Windows Desktop layer (1 layer above icons).
 * @function
 * @public
 *
 * @param {import('electron').BrowserWindow} window
 *
 * @example
 * const MystWin = require('mystwin');
 * const currentWindow = require('electron').remote.getCurrentWindow();
 *
 * MystWin.attachAsDesktop(currentWindow);
 */
exports.attachAsDesktop = function attachAsDesktop (window) {
  mystwin.attachAsDesktop(window.getNativeWindowHandle())
}

/**
 * @summary Attaches a window into the Top Most layer (Always On Top).
 * @function
 * @public
 *
 * @param {import('electron').BrowserWindow} window
 *
 * @example
 * const MystWin = require('mystwin');
 * const currentWindow = require('electron').remote.getCurrentWindow();
 *
 * MystWin.attachToTop(currentWindow);
 */
exports.attachToTop = function attachToTop (window) {
  mystwin.attachToTop(window.getNativeWindowHandle())
}

/**
 * @summary Removes a child window from its parent, making it independent again.
 * @function
 * @public
 *
 * @param {import('electron').BrowserWindow} window
 *
 * @example
 * const MystWin = require('mystwin');
 * const currentWindow = require('electron').remote.getCurrentWindow();
 *
 * MystWin.detachWindow(currentWindow);
 */
exports.detachWindow = function detachWindow (window) {
  mystwin.detachWindow(window.getNativeWindowHandle())
}

/**
 * @summary Sends a window to the bottom of the Z-order.
 * @function
 * @public
 *
 * @param {import('electron').BrowserWindow} window
 *
 * @example
 * const MystWin = require('mystwin');
 * const currentWindow = require('electron').remote.getCurrentWindow();
 *
 * MystWin.sendToBack(currentWindow);
 */
exports.sendToBack = function sendToBack (window) {
  mystwin.sendToBack(window.getNativeWindowHandle())
}

/**
 * @summary Brings a window to the top of the Z-order.
 * @function
 * @public
 *
 * @param {import('electron').BrowserWindow} window
 *
 * @example
 * const MystWin = require('mystwin');
 * const currentWindow = require('electron').remote.getCurrentWindow();
 *
 * MystWin.bringToFront(currentWindow);
 */
exports.bringToFront = function bringToFront (window) {
  mystwin.bringToFront(window.getNativeWindowHandle())
}

/**
 * @summary Moves a window to the specific position without resizing.
 * @function
 * @public
 *
 * @param {import('electron').BrowserWindow} window
 * @param {number} x
 * @param {number} y
 *
 * @example
 * const MystWin = require('mystwin');
 * const currentWindow = require('electron').remote.getCurrentWindow();
 *
 * MystWin.moveWindow(currentWindow);
 */
exports.moveWindow = function moveWindow (window, x, y) {
  mystwin.moveWindow(window.getNativeWindowHandle(), x, y)
}

/**
 * @summary Resizes a window to the given dimensions without moving.
 * @function
 * @public
 *
 * @param {import('electron').BrowserWindow} window
 * @param {number} width
 * @param {number} height
 *
 * @example
 * const MystWin = require('mystwin');
 * const currentWindow = require('electron').remote.getCurrentWindow();
 *
 * MystWin.resizeWindow(currentWindow);
 */
exports.resizeWindow = function resizeWindow (window, width, height) {
  mystwin.resizeWindow(window.getNativeWindowHandle(), width, height)
}

// /**
//  * @summary Sets the window opacity (0 = fully transparent, 255 = fully opaque).
//  * @function
//  * @public
//  *
//  * @param {import('electron').BrowserWindow} window
//  * @param {number} opacity
//  *
//  * @example
//  * const MystWin = require('mystwin');
//  * const currentWindow = require('electron').remote.getCurrentWindow();
//  *
//  * MystWin.setOpacity(currentWindow);
//  */
// exports.setOpacity = function setOpacity (window, opacity) {
//   mystwin.setOpacity(window.getNativeWindowHandle(), opacity)
// }

// /**
//  * @summary Display window's frame or not.
//  * @function
//  * @public
//  *
//  * @param {import('electron').BrowserWindow} window
//  * @param {boolean} enable
//  *
//  * @example
//  * const MystWin = require('mystwin');
//  * const currentWindow = require('electron').remote.getCurrentWindow();
//  *
//  * MystWin.toggleFrame(currentWindow);
//  */
// exports.toggleFrame = function toggleFrame (window, enable) {
//   mystwin.toggleFrame(window.getNativeWindowHandle(), enable)
// }

// /**
//  * @summary Allows clicks to pass through a window or not.
//  * @function
//  * @public
//  *
//  * @param {import('electron').BrowserWindow} window
//  * @param {boolean} enable
//  *
//  * @example
//  * const MystWin = require('mystwin');
//  * const currentWindow = require('electron').remote.getCurrentWindow();
//  *
//  * MystWin.toggleOverlay(currentWindow);
//  */
// exports.toggleOverlay = function toggleOverlay (window, enable) {
//   mystwin.toggleOverlay(window.getNativeWindowHandle(), enable)
// }

// /**
//  * @summary Show icon on task bar or not.
//  * @function
//  * @public
//  *
//  * @param {import('electron').BrowserWindow} window
//  * @param {boolean} enable
//  *
//  * @example
//  * const MystWin = require('mystwin');
//  * const currentWindow = require('electron').remote.getCurrentWindow();
//  *
//  * MystWin.toggleTaskBar(currentWindow);
//  */
// exports.toggleTaskBar = function toggleTaskBar (window, enable) {
//   mystwin.toggleTaskBar(window.getNativeWindowHandle(), enable)
// }
