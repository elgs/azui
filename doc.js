const path = require('path');
const fs = require('fs');

const srcDir = path.join(__dirname, '/src/');
const docDir = path.join(__dirname, '/doc/');

const listModules = (...excludes) => fs.readdirSync(srcDir).filter(item => !excludes.includes(item) && fs.statSync(path.join(srcDir, item)).isDirectory());
const listHtmls = mod => fs.readdirSync(path.join(srcDir, mod)).filter(item => item.toLowerCase().endsWith('.html') && fs.statSync(path.join(srcDir, mod, item)).isFile());
const flattenDeep = arr => arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
const loadModule = mod => {
    const m = fs.readdirSync(path.join(srcDir, mod)).filter(item => item === 'module.json' && fs.statSync(path.join(srcDir, mod, item)).isFile());
    if (m && m.length === 1) {
        const moduleJson = m[0];
        const mj = fs.readFileSync(path.join(srcDir, mod, moduleJson), 'utf8');
        return JSON.parse(mj);
    }
    return null;
}
const pkgJson = require('./package.json');