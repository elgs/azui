import * as docs from './docimport.js';
import md from './docs.md';

window.onload = _ => {
    const url = new URL(location.href);
    const m = url.searchParams.get('m');
    const doc = docs[`${m}Doc`];

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
    hljs.highlightBlock(codeBlock);
};