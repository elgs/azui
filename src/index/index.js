import '../layout/index.js';
import '../accordion/index.js';
import '../menu/index.js';
import '../tabs/index.js';

import {
    parseDOMElement,
} from '../utilities/utilities.js';

import {
    svgApps
} from '../utilities/icons.js';

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

    const menus = [];

    [modules.modules3, modules.modules2, modules.modules1, ].map(m => {
        m.map(m => {
            const k = acc.append(m.name);
            const c = acc.getContentDiv(k);

            const items = m.pages.map(page => {
                const title = page.replace(/^\d+_/, '').replace(/\.[^/.]+$/, '');
                return {
                    icon: svgApps,
                    title,
                    action: function (e, target) {
                        // window.open(m.name + '/' + page, 'content');
                        menus.filter(m => m !== menu).map(m => m.clearActive());
                        tabs.addTab(null, title, null, true, true, m.name + title);
                    }
                }
            });

            const menuEl = parseDOMElement(`<div></div>`)[0];
            const menu = azui.Menu(menuEl, {
                items,
            });
            menus.push(menu);

            c.append(menuEl);
        });
    });

    const elem = document.querySelector('.azLayoutCenter>.mainTab');
    const tabs = azui.Tabs(elem, {
        draggable: false,
        resizable: false,
        closeOnEmpty: false,
        detachable: false,
    });
    // console.log(modules);
};