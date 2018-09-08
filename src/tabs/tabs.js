import {
    azObj,
    Base
} from '../utilities/core.js';
import * as icons from '../utilities/icons.js';
import {
    getDocScrollLeft,
    getDocScrollTop,
    insertAfter,
    matches,
    nextAll,
    normalizeIcon,
    parseDOMElement,
    randGen,
    remove,
    siblings
} from '../utilities/utilities.js';

azui.Tabs = function (el, options, init) {
    return azObj(Tabs, el, options, init);
};

const _getTabId = (elemId) => {
    return elemId.split('-').splice(1, Number.MAX_SAFE_INTEGER).join('-');
};

class Tabs extends Base {
    azInit(options) {
        const settings = Object.assign({
            headerHeight: 40,
            draggable: true,
            resizable: true,
        }, options);

        const me = this;
        const node = this.node;
        me.settings = settings;
        node.classList.add('azTabs');

        me.tabContextMenu = [{
                // icon: icons.svgClose,
                title: 'Close tab',
                action: function (e, target) {
                    me.removeTab(_getTabId(target.id));
                    return false;
                }
            }, {
                // icon: icons.svgClose,
                title: 'Close other tabs',
                action: function (e, target) {
                    siblings(target, '.azTabLabel').forEach(function (element) {
                        me.removeTab(_getTabId(element.id));
                    });
                    return false;
                }
            }, {
                // icon: icons.svgClose,
                title: 'Close tabs to the right',
                action: function (e, target) {
                    nextAll(target, '.azTabLabel').forEach(function (element) {
                        me.removeTab(_getTabId(element.id));
                    });
                    return false;
                }
            },
            null,
            {
                // icon: icons.svgClose,
                title: 'Close All',
                action: function (e, target) {
                    siblings(target, '.azTabLabel').forEach(function (element) {
                        me.removeTab(_getTabId(element.id));
                    });
                    me.removeTab(_getTabId(target.id));
                    return false;
                }
            }
        ];

        me.headerClicked = function (cm) {
            return function (event) {
                if (event.button === 2 || cm.on || me.dragging) {
                    return;
                }
                // console.log(event.button);
                const tabId = _getTabId(event.currentTarget.id);
                me.activateTab(tabId);
            }
        };

        me.closeClicked = function (event) {
            const tabId = _getTabId(event.currentTarget.parentNode.id);
            me.removeTab(tabId);
            event.stopPropagation();
        };

        let tabHeaderContainer = node.querySelector('div.azTabHeader');
        if (!tabHeaderContainer) {
            tabHeaderContainer = document.createElement('div');
            tabHeaderContainer.classList.add('azTabHeader');
            node.appendChild(tabHeaderContainer);
        }
        const tabLabelList = node.querySelectorAll('div.azTabLabel'); // a list
        const tabLabels = document.createElement('div');
        tabLabels.classList.add('azTabLabels');
        tabHeaderContainer.appendChild(tabLabels);

        tabLabelList.forEach(el => {
            const cm = azui.ContextMenu(el, {
                items: me.tabContextMenu
            });
            const headerClicked = me.headerClicked(cm);

            el.addEventListener('mouseup', headerClicked);
            el.addEventListener('touchend', headerClicked);
            if (matches(el, '.azClosable')) {
                const iconDiv = document.createElement('div');
                iconDiv.classList.add('close');
                iconDiv.appendChild(parseDOMElement(icons.svgClose)[0]);
                iconDiv.addEventListener('click', me.closeClicked);
                el.appendChild(iconDiv);
            }
            tabLabels.appendChild(el);
        });
        me.activateTabByIndex(0);

        me.dragging = false;
        me.sortable = azui.Sortable(tabLabels, {
            escapable: true,
            create: (e, target) => {
                if (matches(e.target, '.close,.close *')) {
                    return false; // don't drag when clicking on icons
                }
                if (e.type === 'touchstart') {
                    e.preventDefault();
                }
            },
            start: (e, data) => {
                me.dragging = true;
            },
            stop: (e, data) => {
                me.dragging = false;
                const tabId = _getTabId(data.source.id);
                if (data.escaped) {
                    const x = data.boundingClientRect.left + getDocScrollLeft();
                    const y = data.boundingClientRect.top + getDocScrollTop();
                    me.spawn(tabId, x, y);
                } else {
                    me.activateTab(tabId);
                }
            }
        });

        tabHeaderContainer.style['height'] = settings.headerHeight + 'px';

        if (settings.draggable) {
            azui.Draggable(node, {
                handle: '.azTabHeader',
                create: function (event, ui) {
                    // console.log(event.target.classList.contains('azTabHeader'));
                    // console.log(event.target.classList);
                    if (event.type === 'touchstart' && event.target.classList.contains('azTabLabels')) {
                        event.preventDefault();
                    }
                },
            });
        }
        if (settings.resizable) {
            azui.Resizable(node, {
                hideHandles: true,
                resize: e => {
                    // me.showHideScrollers();
                    me.fitTabWidth();
                },
            });
        }
    }

    fitTabWidth() {
        const me = this;
        const node = me.node;
        const nodeWidth = parseInt(getComputedStyle(node)['width']);
        const tabLabels = node.querySelectorAll('.azTabLabel:not(.az-placeholder)');
        const newWidth = Math.min((nodeWidth - (me.settings.draggable ? 40 : 0)) / tabLabels.length, 150);
        tabLabels.forEach(tabLabel => {
            // console.log(tabLabel);
            if (newWidth < 60) {
                tabLabel.querySelector('.icon').style['display'] = 'none';
                tabLabel.style['grid-template-columns'] = '0 1fr 30px';
            } else {
                tabLabel.querySelector('.icon').style['display'] = '';
                tabLabel.style['grid-template-columns'] = '30px 1fr 30px';
            }
            tabLabel.style['width'] = newWidth + 'px';
        });
    }

    spawn(tabId, x = 10, y = 10) {
        const me = this;
        const node = me.node;
        const tabHeader = node.querySelector(".azTabLabel#azTabHeader-" + tabId);
        const tabContent = node.querySelector("#azTabContent-" + tabId);
        const isActive = matches(tabHeader, '.active');

        const parentBcr = node.parentNode.getBoundingClientRect();
        const parentX = parentBcr.left + getDocScrollLeft();
        const parentY = parentBcr.top + getDocScrollTop();
        const parentStyle = getComputedStyle(node.parentNode);
        const parentBorderTop = parseInt(parentStyle["border-top-width"]);
        const parentBorderLeft = parseInt(parentStyle["border-left-width"]);
        if (parentStyle.position !== 'relative' &&
            parentStyle.position !== 'absolute' &&
            parentStyle.position !== 'fixed') {
            node.parentNode.style.position = 'relative';
        }

        const nodeStyle = getComputedStyle(node);
        // console.log(nodeStyle.width, nodeStyle.height);
        const newTabsElem = document.createElement('div');
        newTabsElem.style.width = nodeStyle.width;
        newTabsElem.style.height = nodeStyle.height;
        newTabsElem.style.position = nodeStyle.position;
        newTabsElem.style.top = (y - parentY - parentBorderTop) + 'px';
        newTabsElem.style.left = (x - parentX - parentBorderLeft) + 'px';
        node.parentNode.appendChild(newTabsElem);
        const newTabs = azui.Tabs(newTabsElem, {});

        // const newLabels = newNode.querySelector('div.azTabHeader>.azTabLabels');
        // console.log(tabHeader, newLabels);
        // newLabels.appendChild(tabHeader);
        tabContent.style['display'] = "block";
        newTabs.addTab(tabHeader, tabContent, true);
        // remove(tabHeader);

        const headers = node.querySelectorAll('.azTabLabel');
        if (headers.length) {
            if (isActive) {
                me.activateTabByIndex(0);
            }
            // me.showHideScrollers();
            me.fitTabWidth();
        } else {
            remove(node);
        }
    }

    addTab(headerNode, contentNode, activate) {
        const me = this;
        const node = me.node;
        const tabId = randGen(8);

        const header = headerNode;
        header.classList.add('azTabLabel');
        header.setAttribute('id', 'azTabHeader-' + tabId)

        const closeDiv = header.querySelector('.close');
        if (closeDiv) {
            closeDiv.addEventListener('click', me.closeClicked);
        }

        me.sortable.add(header);

        const content = contentNode || document.createElement('div');
        // content.innerHTML = data.content;
        content.setAttribute('id', 'azTabContent-' + tabId);
        content.classList.add('azTabContent');
        content.style['display'] = 'none';

        const contents = node.querySelectorAll('.azTabContent');
        if (contents.length) {
            insertAfter(content, contents[contents.length - 1]);
        } else {
            node.appendChild(content);
        }

        const cm = azui.ContextMenu(header, {
            items: me.tabContextMenu
        });

        const headerClicked = me.headerClicked(cm);
        header.addEventListener('mouseup', headerClicked);
        header.addEventListener('touchend', headerClicked);
        // me.showHideScrollers();
        me.fitTabWidth();
        if (activate === true) {
            me.activateTab(tabId)
        }
    }

    addTab0(icon, title, closable, contentNode, activate) {
        const me = this;
        const iconDiv = document.createElement('div');
        iconDiv.classList.add('icon');
        iconDiv.appendChild(normalizeIcon(icon));
        const titleDiv = document.createElement('div');
        titleDiv.classList.add('title');
        titleDiv.appendChild(normalizeIcon(title));
        const header = document.createElement('div');
        header.classList.add('azTabLabel');
        header.appendChild(iconDiv)
        header.appendChild(titleDiv);
        if (closable) {
            const closeDiv = document.createElement('div');
            closeDiv.classList.add('close');
            closeDiv.appendChild(parseDOMElement(icons.svgClose)[0]);
            header.appendChild(closeDiv);
        }

        me.addTab(header, contentNode);
    }
    removeTab(tabId) {
        const me = this;
        const node = me.node;
        const tab = node.querySelector(".azTabLabel#azTabHeader-" + tabId);
        const isActive = matches(tab, '.active');
        remove(tab);
        remove(node.querySelector("#azTabContent-" + tabId));
        const headers = node.querySelectorAll('.azTabLabel');
        if (headers.length) {
            if (isActive) {
                me.activateTabByIndex(0);
            }
            // me.showHideScrollers();
            me.fitTabWidth();
        } else {
            remove(node);
        }
    }
    activateTab(tabId) {
        const me = this;
        const node = me.node;
        const tabContent = node.querySelectorAll('div.azTabContent').forEach(el => {
            const elId = _getTabId(el.id);
            if (elId === tabId) {
                el.style['display'] = "block";
            } else {
                el.style['display'] = "none";
            }
        });
        const tabHeaders = node.querySelectorAll('div.azTabLabel').forEach(el => {
            const elId = _getTabId(el.id);
            if (elId === tabId) {
                el.classList.add("active");
            } else {
                el.classList.remove("active");
            }
        });
    }
    activateTabByIndex(tabIndex) {
        const me = this;
        const node = me.node;

        const tabContent = node.querySelectorAll('div.azTabContent').forEach((el, index) => {
            if (index === tabIndex) {
                el.style['display'] = "block";
            } else {
                el.style['display'] = "none";
            }

        });
        const tabHeaders = node.querySelectorAll('div.azTabLabel').forEach((el, index) => {
            if (index === tabIndex) {
                el.classList.add("active");
            } else {
                el.classList.remove("active");
            }
        });

    }
    attachTab() {}
    detachTab(tabId) {}
};