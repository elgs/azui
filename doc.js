const replacer = (key, value) => {
    if (typeof value === 'function') {
        return value.toString();
    }
    return value;
};

const parse = (o) => {
    const ret = {};
    for (const name of Object.getOwnPropertyNames(o)) {
        const v = o[name];
        if (typeof v === 'object') {
            ret[name] = parse(v);
        } else {
            ret[name] = JSON.parse(JSON.stringify(v, replacer));
        }
    }

    for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(o))) {
        const method = o[name];
        if (name === 'constructor') continue;
        if (typeof method === 'function' && !name.startsWith('__') && !method.toString().includes('[native code]')) {
            ret[name] = method.toString();
        }
    }
    return ret;
};

import './src/all/index.js';
const w0 = azui.Window('.win0');
const p = parse(w0);
console.log(p);