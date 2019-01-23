import * as docs from './docimport.js';
import docstpl from './docs.tplhtml';

import settingsTpl from './settings.tplhtml';
import methodsTpl from './methods.tplhtml';
import eventsTpl from './events.tplhtml';

window.onload = _ => {
    const url = new URL(location.href);
    const m = url.searchParams.get('m');
    const doc = docs[`${m}Doc`];

    docstpl = docstpl.replace('${module_name}', m);
    let settings = ''
    doc.settings.map(s => {
        let defaultValue = s.defaultValue;
        if (s.type === 'string') {
            defaultValue = '"' + defaultValue + '"';
        }
        const item = settingsTpl.replace('${key}', s.key).replace('${type}', s.type).replace('${defaultValue}', defaultValue).replace(/\$\{desc\}/g, s.desc);
        settings += item + '  \n';
    });
    docstpl = docstpl.replace('${settings}', settings);

    let methods = ''
    doc.methods.map(m => {
        let pd = '<ul>';
        const pl = m.params.map(p => {
            pd += '<li>`' + p.key + '`: `' + p.type + '`' + ' default: `' + p.defaultValue + '` ' + p.desc + '</li>';
            return '`' + p.key + '`: `' + p.type + '`';
        }).join(', ');
        const item = methodsTpl.replace('${key}', m.key).replace('${returns}', m.returns).replace(/\$\{desc\}/g, m.desc).replace('${param_list}', '(' + pl + ')').replace('${param_details}', pd + '</ul>');
        methods += item + '  \n';
    });
    docstpl = docstpl.replace('${methods}', methods);

    let events = ''
    doc.events.map(e => {
        const pd = e.params.map(p => {
            return '<li>' + p.key + ' ' + p.desc + '</li>';
        }).join(', ');
        const item = eventsTpl.replace('${key}', e.key).replace(/\$\{desc\}/g, e.desc).replace('${param_details}', '<ul>' + pd + '</ul>');
        events += item + '  \n';
    });
    docstpl = docstpl.replace('${events}', events);

    const el = document.querySelector('.azDocs');
    el.innerHTML = docstpl;
    const codeBlocks = el.querySelectorAll('pre>code');
    codeBlocks.forEach(codeBlock => {
        hljs.highlightBlock(codeBlock);
    });
};