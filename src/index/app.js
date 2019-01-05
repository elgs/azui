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
        hideCollapseButton: true,
        westWidth: '180px',
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
                        menus.filter(m => m !== menu).map(m => m.clearActive());
                        if (!tabs.activateTab(tabId)) {
                            const w = parseInt(getComputedStyle(tabs.node).width);
                            const exampleTab = parseDOMElement(exampleTabMarkup)[0];
                            const exampleTabLayout = azui.Layout(exampleTab, {
                                eastWidth: w / 2 + 'px',
                                hideCollapseButton: false,
                            });

                            const exampleTabContent = document.createElement('div');
                            exampleTabContent.appendChild(exampleTab);
                            tabs.addTab(null, title.replace(/_/g, ' '), exampleTabContent, true, true, tabId);
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

                            fetch('../' + m.name + '/' + page).then(res => res.text()).then(text => {
                                text = text.replace(/<script\s+type=(\"|')text\/javascript(\"|')/g, '<script ');
                                refreshIframe(text);
                                ace.require("ace/ext/language_tools");
                                const editor = ace.edit(exampleTabLayout.centerContent, {
                                    mode: "ace/mode/html",
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
                                        editor.session.doc.setValue(html_beautify(editor.session.getValue()));
                                        editor.clearSelection();
                                        editor.selection.moveCursorToPosition(pos);
                                    }
                                });
                                editor.on('blur', function () {
                                    const src = editor.getValue();
                                    const oldIframe = exampleTabLayout.eastContent.querySelector('iframe');
                                    oldIframe && oldIframe.remove();
                                    refreshIframe(src);
                                });
                                editor.setValue(html_beautify(text), -1);

                                // text = text.replace(/<\/script>/g, '&lt;/script&gt;');
                                // exampleTabLayout.eastContent.innerHTML = '<script type="text/plain" class="language-markup line-numbers">' + text + '</script>';
                                // Prism.highlightAll();
                            });
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
                        window.open(`../docs/docs.html?m=${m.name}`, tabId);
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