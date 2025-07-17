const fsExtra = require('fs-extra');
const path = require("node:path");

fsExtra.removeSync(path.join(__dirname, '../dist'));