import {
    parseDOMElement,
} from '../utilities/utilities.js';

import modules from './modules.json';

import exampleTabMarkup from './exampletab.tplhtml';

window.onload = () => {
    // const buildTime = document.querySelector('.azui span.buildTime');
    // buildTime && (buildTime.innerHTML = modules.buildTime);

    const container = document.querySelector('.azui.azApp');
    azui.Layout(container, {
        hideCollapseButton: false,
        westWidth: '180px',
    });

    const menuDOM = document.querySelector('#menu');
    const tree = azui.Tree(menuDOM, {});

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
        // console.log(tabId2Url[tabId]);
        history.pushState(tabId, '', '../' + tabId2Url[tabId]);
    });
    // console.log(modules);

    const url2TabId = {};
    const tabId2Url = {};

    const refreshIframe = (src, dst) => {
        const iframeExampleMarkup = `<iframe name='example_${tabId}' frameBorder='0'></iframe>`;
        const iframeExample = parseDOMElement(iframeExampleMarkup)[0];
        dst.appendChild(iframeExample);
        const doc = iframeExample.contentDocument || iframeExample.contentWindow.document;
        doc.open();
        doc.write(src);
        doc.close();
    };

    [modules.modules3, modules.modules2, modules.modules1].map(m => {
        m.map(m => {
            const url = `docs/docs.html`;
            const urlNoExt = m.name + '/api';
            const tabId = m.name + '_api';
            const action = (e) => {
                // console.log(e);
                if (!tabs.activate(tabId, e.isTrusted)) {
                    // console.log(url);
                    fetch('../' + url).then(res => res.text()).then(text => {
                        text = text.trim();
                        const content = document.createElement('div');
                        tabs.add(null, m.name + ' api', content, true, true, tabId, e.isTrusted);
                        refreshIframe(text, content);
                    });
                    // window.open('../' + url, tabId);
                }
            };
            url2TabId[urlNoExt] = tabId;
            tabId2Url[tabId] = urlNoExt;
            const key = tree.append(m.name, null, action, tabId);
            // console.log(key);
            m.pages.map(page => {
                const title = page.replace(/^\d+_/, '').replace(/\.[^/.]+$/, '');
                const url = m.name + '/' + page;
                const urlNoExt = url.replace('.html', '');
                const tabId = m.name + title;

                const action = (e) => {
                    if (!tabs.activate(tabId, e.isTrusted)) {
                        const w = parseInt(getComputedStyle(tabs.node).width);
                        const exampleTab = parseDOMElement(exampleTabMarkup)[0];
                        const exampleTabLayout = azui.Layout(exampleTab, {
                            eastWidth: w / 2 + 'px',
                            hideCollapseButton: false,
                        });

                        tabs.add(null, title.replace(/_/g, ' '), exampleTab, true, true, tabId, e.isTrusted);
                        // window.open(m.name + '/' + page, 'example_' + tabId);
                        // console.log(url);
                        fetch('../' + url).then(res => res.text()).then(text => {
                            text = text.trim();
                            refreshIframe(text, exampleTabLayout.eastContent);
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
                                refreshIframe(src, exampleTabLayout.eastContent);
                            });
                            editor.setValue(_src, -1);
                        });
                    }
                };
                tree.append(title, key, action, tabId);
                url2TabId[urlNoExt] = tabId;
                tabId2Url[tabId] = urlNoExt;
            });
        });
    });

    const urlObj = new URL(location.href);
    // console.log(urlObj);
    const tabId = url2TabId[urlObj.pathname.split('/').slice(-2).join('/') + urlObj.search];

    // console.log(url2TabId);

    const simOpenTab = tabId => {
        if (tabId) {
            tree.activate(tabId);
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