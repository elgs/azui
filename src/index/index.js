import '../layout/index.js';
import '../accordion/index.js';

import './index.scss';
import {
    parseDOMElement,
} from '../utilities/utilities.js';
import modules from './modules.json';

window.onload = () => {
    const buildTime = document.querySelector('.azui span.buildTime');
    buildTime.innerHTML = modules.buildTime;

    const container = document.querySelector('.azui.azIndex');
    azui.Layout(container, {
        hideCollapseButton: true,
        westWidth: '150px',
    });

    const accDOM = document.querySelector('#accordionMenu');
    const acc = azui.Accordion(accDOM, {
        collapseOthers: false,
    });

    [modules.modules3, modules.modules2, modules.modules1, ].map(m => {
        m.map(m => {
            const k = acc.append(m.name);
            const c = acc.getContentDiv(k);

            const ul = parseDOMElement(`<ul></ul>`)[0];
            m.pages.map(page => {
                const pageLiTpl = `<li><a href='${page}' target='content'>${page}</a></li>`
                const pageLi = parseDOMElement(pageLiTpl)[0];
                ul.appendChild(pageLi);
            });

            c.append(ul);
        });
    });


    // console.log(modules);
};