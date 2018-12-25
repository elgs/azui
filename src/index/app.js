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

    [modules.modules3, modules.modules2, modules.modules1].map(m => {
        m.map(m => {
            const k = acc.append(m.name);
            const c = acc.getContentDiv(k);

            const items = m.pages.map(page => {
                const title = page.replace(/^\d+_/, '').replace(/\.[^/.]+$/, '');
                return {
                    icon: svgApps,
                    title: title.replace(/_/g, ' '),
                    action: function (e, target) {
                        const tabId = m.name + title;
                        const iframeMarkup = `<div><iframe name='${tabId}' frameBorder='0'></iframe></div>`;
                        const iframe = parseDOMElement(iframeMarkup)[0];
                        menus.filter(m => m !== menu).map(m => m.clearActive());
                        const activated = tabs.addTab(null, title.replace(/_/g, ' '), iframe, true, true, tabId);
                        if (activated !== true) {
                            window.open(m.name + '/' + page, tabId);
                        }
                    }
                };
            });

            items.unshift({
                icon: svgApps,
                title: 'api',
                action: function (e, target) {
                    const tabId = m.name + '_api';
                    const iframeMarkup = `<div><iframe name='${tabId}' frameBorder='0'></iframe></div>`;
                    const iframe = parseDOMElement(iframeMarkup)[0];
                    menus.filter(m => m !== menu).map(m => m.clearActive());
                    const activated = tabs.addTab(null, m.name + ' api', iframe, true, true, tabId);
                    if (activated !== true) {
                        window.open(`docs/docs.html?m=${m.name}`, tabId);
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

    const elem = document.querySelector('.azLayoutCenter>.mainTabs');
    const tabs = azui.Tabs(elem, {
        draggable: false,
        resizable: false,
        closeOnEmpty: false,
        detachable: false,
    });
    // console.log(modules);
};