import * as docs from './docimport.js';
import md from './docs.md';

import settingsTpl from './settings.tplhtml';
import methodsTpl from './methods.tplhtml';
import eventsTpl from './events.tplhtml';

window.onload = _ => {
    const url = new URL(location.href);
    const m = url.searchParams.get('m');
    const doc = docs[`${m}Doc`];

    md = md.replace('${module_name}', m);
    let settings = ''
    doc.settings.map(s => {
        let defaultValue = s.defaultValue;
        if (s.type === 'string') {
            defaultValue = '"' + defaultValue + '"';
        }
        const item = settingsTpl.replace('${key}', s.key).replace('${type}', s.type).replace('${defaultValue}', defaultValue).replace('${desc}', s.desc);
        settings += item + '  \n';
    });
    md = md.replace('${settings}', settings);

    let methods = ''
    doc.methods.map(m => {
        let pd = '<ul>';
        const pl = m.params.map(p => {
            pd += '<li>' + p.key + ' `' + p.type + '`' + ' default: `' + p.defaultValue + '` ' + p.desc + '</li>';
            return p.key + '`' + p.type + '`';
        }).join(', ');
        const item = methodsTpl.replace('${key}', m.key).replace('${returns}', m.returns).replace(/\$\{desc\}/g, m.desc).replace('${param_list}', '(' + pl + ')').replace('${param_details}', pd + '</ul>');
        methods += item + '  \n';
    });
    md = md.replace('${methods}', methods);

    let events = ''
    doc.events.map(e => {
        const pd = e.params.map(p => {
            return '<li>' + p.key + ' ' + p.desc + '</li>';
        }).join(', ');
        const item = eventsTpl.replace('${key}', e.key).replace(/\$\{desc\}/g, e.desc).replace('${param_details}', '<ul>' + pd + '</ul>');
        events += item + '  \n';
    });
    md = md.replace('${events}', events);


    const converter = new showdown.Converter({
        tables: true,
        tasklists: true,
    });
    converter.setFlavor('github');
    const html = converter.makeHtml(md);

    const el = document.querySelector('.azDocs');
    // el.innerHTML = '<pre><code class="json">' + JSON.stringify(doc, null, 2) + '</code></pre>';
    el.innerHTML = html;
    const codeBlock = el.querySelector('pre>code');
    if (codeBlock) {
        hljs.highlightBlock(codeBlock);
    }
};