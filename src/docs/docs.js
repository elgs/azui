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
        methods += '* ' + m.key + '  \n';
    });
    md = md.replace('${methods}', methods);

    let events = ''
    doc.methods.map(e => {
        events += '* ' + e.key + '  \n';
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