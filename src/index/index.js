import '../layout/index.js';
import '../accordion/index.js';
import '../menu/index.js';

import './index.scss';
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
                return {
                    icon: svgApps,
                    title: page,
                    action: function (e, target) {
                        window.open(page, 'content');
                        menus.filter(m => m !== menu).map(m => m.clearActive());
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

    // console.log(modules);
};