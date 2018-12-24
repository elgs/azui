import * as docs from './docimport.js';

window.onload = _ => {
    const url = new URL(location.href);
    const m = url.searchParams.get('m');
    const doc = docs[`${m}Doc`];

    const el = document.querySelector('.azDocs');
    el.innerHTML = '<pre><code>' + JSON.stringify(doc, null, 2) + '</pre></code>';
};