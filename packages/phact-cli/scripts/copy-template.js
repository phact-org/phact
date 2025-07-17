const fs = require('fs-extra');

fs.copy('./template', './dist/template')
    .then(() => console.log('Template copied!'))
    .catch(console.error);