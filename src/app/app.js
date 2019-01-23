import {
    parseDOMElement,
} from '../utilities/utilities.js';

import {
    svgApps
} from '../utilities/icons.js';

import modules from './modules.json';

import exampleTabMarkup from './exampletab.tplhtml';

window.onload = () => {
    const buildTime = document.querySelector('.azui span.buildTime');
    buildTime && (buildTime.innerHTML = modules.buildTime);

    const container = document.querySelector('.azui.azIndex');
    azui.Layout(container, {
        hideCollapseButton: false,
        westWidth: '180px',
    });

    const accDOM = document.querySelector('#accordionMenu');
    const acc = azui.Accordion(accDOM, {
        collapseOthers: false,
    });

    const url2TabId = {};

    const menus = [];

    let activeUrl = '';

    [modules.modules3, modules.modules2, modules.modules1].map(m => {
        m.map(m => {
            const k = acc.append(m.name);
            const c = acc.getContentDiv(k);

            const items = m.pages.map(page => {
                const title = page.replace(/^\d+_/, '').replace(/\.[^/.]+$/, '');
                const url = m.name + '/' + page;
                const urlNoExt = url.replace('.html', '');
                const tabId = m.name + title;
                const menuItem = {
                    id: tabId,
                    icon: svgApps,
                    title: title.replace(/_/g, ' '),
                    action: function (e, target) {
                        // console.log(e);
                        menus.filter(m => m !== menu).map(m => m.clearActive());
                        // if (e.isTrusted) {
                        //     history.pushState(tabId, '', '../' + urlNoExt);
                        // }
                        if (!tabs.activate(tabId)) {
                            const w = parseInt(getComputedStyle(tabs.node).width);
                            const exampleTab = parseDOMElement(exampleTabMarkup)[0];
                            const exampleTabLayout = azui.Layout(exampleTab, {
                                eastWidth: w / 2 + 'px',
                                hideCollapseButton: false,
                            });

                            const exampleTabContent = document.createElement('div');
                            exampleTabContent.appendChild(exampleTab);
                            tabs.add(null, title.replace(/_/g, ' '), exampleTabContent, true, true, tabId);
                            // window.open(m.name + '/' + page, 'example_' + tabId);

                            const refreshIframe = src => {
                                const iframeExampleMarkup = `<iframe name='example_${tabId}' frameBorder='0'></iframe>`;
                                const iframeExample = parseDOMElement(iframeExampleMarkup)[0];
                                exampleTabLayout.eastContent.appendChild(iframeExample);
                                const doc = iframeExample.contentDocument || iframeExample.contentWindow.document;
                                doc.open();
                                doc.write(src);
                                doc.close();
                            };

                            fetch('../' + url).then(res => res.text()).then(text => {
                                text = text.trim();
                                text = text.replace(/<script\s+type=(\"|')text\/javascript(\"|')/g, '<script ');
                                text = text.replace(/<html>\s+<head>/, '<html>\n<head>');
                                text = text.replace(/<\/body>\s+<\/html>$/, '</body>\n</html>');
                                refreshIframe(text);
                                ace.require("ace/ext/language_tools");
                                const editor = ace.edit(exampleTabLayout.centerContent, {
                                    mode: "ace/mode/html",
                                    theme: 'ace/theme/tomorrow_night',
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: true,
                                });
                                editor.commands.addCommand({
                                    name: "format",
                                    bindKey: {
                                        win: "Ctrl-Shift-F",
                                        mac: "Command-Shift-F"
                                    },
                                    exec: function () {
                                        const pos = editor.getCursorPosition();
                                        editor.session.doc.setValue(html_beautify(editor.session.getValue(), fmtOpt));
                                        editor.clearSelection();
                                        editor.selection.moveCursorToPosition(pos);
                                    }
                                });
                                const fmtOpt = {
                                    html: {
                                        extra_liners: []
                                    }
                                };
                                let _src = html_beautify(text, fmtOpt);
                                editor.on('blur', function () {
                                    const src = editor.getValue();
                                    if (src === _src) {
                                        return;
                                    }
                                    _src = src;
                                    const oldIframe = exampleTabLayout.eastContent.querySelector('iframe');
                                    oldIframe && oldIframe.remove();
                                    refreshIframe(src);
                                });
                                editor.setValue(_src, -1);
                            });
                        }
                    }
                };
                url2TabId[urlNoExt] = tabId;
                return menuItem;
            });

            const url = `docs/docs.html?m=${m.name}`;
            // const urlNoExt = url.replace('.html', '');
            const urlNoExt = `docs/${m.name}`;
            const tabId = m.name + '_api';
            const menuItem = {
                id: tabId,
                icon: svgApps,
                title: 'api',
                action: function (e, target) {
                    // console.log(e);
                    const iframeMarkup = `<div><iframe name='${tabId}' frameBorder='0'></iframe></div>`;
                    const iframe = parseDOMElement(iframeMarkup)[0];
                    menus.filter(m => m !== menu).map(m => m.clearActive());
                    const activated = tabs.add(null, m.name + ' api', iframe, true, true, tabId);
                    if (e.isTrusted) {
                        history.pushState(tabId, '', '../' + urlNoExt);
                    }
                    if (activated !== true) {
                        window.open('../' + url, tabId);
                    }
                }
            };
            url2TabId[urlNoExt] = tabId;
            items.unshift(menuItem);

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
    tabs.node.addEventListener('didActivate', e => {
        // console.log(e.detail);
        const tabId = e.detail.tabId;
        history.pushState(tabId, '', '../' + activeUrl);
    });
    // console.log(modules);


    const urlObj = new URL(location.href);
    // console.log(urlObj);
    const tabId = url2TabId[urlObj.pathname.split('/').slice(-2).join('/') + urlObj.search];

    // console.log(url2TabId);

    const simOpenTab = tabId => {
        if (tabId) {
            const miEl = acc.node.querySelector('.azAccordionContent [menu-item-id=' + tabId + ']');
            // console.log(miEl);
            if (miEl) {
                const header = miEl.closest('.azAccordionComponent').querySelector('.azAccordionHeader');
                // console.log(header);
                acc._toggle(header, true);

                const menuEl = miEl.closest('.azMenu');
                const menu = azui.Menu(menuEl);
                menu.activate(tabId);
            }
        }
    };

    simOpenTab(tabId);

    window.onpopstate = function (e) {
        // console.log('onpopstate');
        if (e.state) {
            const tabId = e.state;
            simOpenTab(tabId);
        }
    };
};