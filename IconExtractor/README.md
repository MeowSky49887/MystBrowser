<!-- Make sure you edit doc/README.hbs rather than README.md because the latter is auto-generated -->

icon-extractor
==============

> Node module that allows you to extract a icon from file in Windows.

*This module only supports Windows (Tested on Windows 10)*

Installation
------------

Install `icon-extractor` by running:

```sh
$ npm install --save https://github.com/MeowSky49887/Icon-Extractor.git
```

Documentation
-------------

**Example**

```js
const IconExtractor = require("icon-extractor");

IconExtractor.extractIcon("C:\\Windows\\system32\\notepad.exe")
    .then(icon => console.log(icon))
    .catch(err => console.error(err));
```
