// @ts-check

/**
 * @module icon-extractor
 */

'use strict'

/**
 * @summary Extract Icon from File
 * @function
 * @public
 *
 * @param {string} filePath - File Path of the file to extract the icon from
 * @returns {Promise<string>} - A promise that resolves to the base64 icon string
 * 
 * @example
 * const IconExtractor = require("icon-extractor");
 * 
 * IconExtractor.extractIcon("C:\\Windows\\system32\\notepad.exe")
 *   .then(icon => console.log(icon))
 *   .catch(err => console.error(err));
 */

exports.extractIcon = function extractIcon(filePath) {
    var edge = require('electron-edge-js');
    const path = require('path');

    const extractIconFunc = edge.func(path.join(__dirname, '../src/Main.csx'));

    return new Promise((resolve, reject) => {
        try {
            extractIconFunc(filePath, (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            });
        } catch (err) {
            reject(err);
        }
    });
};
