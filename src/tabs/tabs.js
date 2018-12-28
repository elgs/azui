import {
    azObj,
    Base
} from '../utilities/core.js';
import * as icons from '../utilities/icons.js';
import {
    getDocScrollLeft,
    getDocScrollTop,
    isTouchDevice,
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

const getTabContextMenu = closable => [{
        // icon: icons.svgClose,
        title: 'Close tab',
        disabled: !closable,
        action: function (e, target) {
            const currentTabNode = target.closest('.azTabs');
            const currentTabs = azui.Tabs(currentTabNode);
            currentTabs.removeTab(_getTabId(target.id));
            return false;
        }
    },
    {
        // icon: icons.svgClose,
        title: 'Close other tabs',
        disabled: !closable,
        action: function (e, target) {
            const currentTabNode = target.closest('.azTabs');
            const currentTabs = azui.Tabs(currentTabNode);
            siblings(target, '.azTabLabel').forEach(function (element) {
                if (matches(element, '.azClosable')) {
                    currentTabs.removeTab(_getTabId(element.id));
                }
            });
            return false;
        }
    },
    {
        // icon: icons.svgClose,
        title: 'Close tabs to the right',
        disabled: !closable,
        action: function (e, target) {
            const currentTabNode = target.closest('.azTabs');
            const currentTabs = azui.Tabs(currentTabNode);
            nextAll(target, '.azTabLabel').forEach(function (element) {
                if (matches(element, '.azClosable')) {
                    currentTabs.removeTab(_getTabId(element.id));
                }
            });
            return false;
        }
    },
    null,
    {
        // icon: icons.svgClose,
        title: 'Close All',
        disabled: !closable,
        action: function (e, target) {
            const currentTabNode = target.closest('.azTabs');
            const currentTabs = azui.Tabs(currentTabNode);
            siblings(target, '.azTabLabel').forEach(function (element) {
                if (matches(element, '.azClosable')) {
                    currentTabs.removeTab(_getTabId(element.id));
                }
            });
            currentTabs.removeTab(_getTabId(target.id));
            return false;
        }
    }
];


class Tabs extends Base {
    static className = 'Tabs';

    static z = 0;

    _init(options) {
        const settings = Object.assign({
                // @doc:settings:start
                headerHeight: 36, // @doc:headerHeight: Header height.
                draggable: true, // @doc:draggable: Whether the tab window should be draggable or not.
                resizable: true, // @doc:resizable: Whether the tab window should be resizable or not.
                detachable: true, // @doc:detachable: Whether the tabs could be detached by dragging out or not.
                closeOnEmpty: true, // @doc:closeOnEmpty: Whether the tab window should be close or not when the last tab is closed.
                // @doc:settings:end
            },
            options);

        const me = this;
        const node = me.node;
        me.settings = settings;

        node.style['grid-template-rows'] = `${settings.headerHeight}px 1fr`;

        me.createHeaderClicked = function (cm) {
            return function (event) {
                if (event.type === 'touchend') {
                    // event.preventDefault();
                    if (cm.rightClick.triggered) {
                        return;
                    }
                }

                const currentTabNode = event.target.closest('.azTabs');
                const currentTabs = azui.Tabs(currentTabNode);
                if (event.button === 2 || cm.on || me.sorted) {
                    return;
                }
                // console.log(event.button);
                const tabId = _getTabId(event.currentTarget.id);
                if (!event.target.classList.contains('close') &&
                    !event.target.parentNode.classList.contains('close')) {
                    currentTabs.activateTab(tabId);
                }
            };
        };
        me.closeClicked = function (event) {
            const currentTabNode = event.target.closest('.azTabs');
            const currentTabs = azui.Tabs(currentTabNode);
            const tabId = _getTabId(event.currentTarget.parentNode.id);
            currentTabs.removeTab(tabId);
            event.stopPropagation();
        };

        me.applyEvents = el => {
            const closable = matches(el, '.azClosable');
            const cm = azui.ContextMenu(el, {
                items: getTabContextMenu(closable),
            });
            const headerClicked = me.createHeaderClicked(cm);
            el.addEventListener('mouseup', headerClicked);
            el.addEventListener('touchend', headerClicked);
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
            me.applyEvents(el);

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

        // me.dragging = false;
        me.sortable = azui.Sortable(tabLabels, {
            detachable: settings.detachable,
            create: (e, target) => {
                if (matches(e.target, '.close,.close *')) {
                    return false; // don't drag when clicking on icons
                }
                if (e.type === 'touchstart') {
                    // prevent text from being selected on context menu.
                    e.preventDefault();
                }
            },
            // start: (e, data) => {
            //     me.dragging = true;
            // },
            sort: (e, data) => {
                me.sorted = true;
            },
            stop: (e, data) => {
                me.sorted = false;
                const tabId = _getTabId(data.source.id);
                if (data.detached) {
                    const x = data.boundingClientRect.left + getDocScrollLeft();
                    const y = data.boundingClientRect.top + getDocScrollTop();
                    me.spawn(tabId, x, y);
                } else {
                    const contentNode = me.node.querySelector('#azTabContent-' + tabId);

                    const targetTabsNode = data.source.closest('.azTabs');

                    if (targetTabsNode !== me.node) {
                        targetTabsNode.appendChild(contentNode);

                        const targetTabs = azui.Tabs(targetTabsNode);
                        targetTabs.activateTab(tabId);

                        const tabHeader = data.source; //.closest('.azTabLabel#azTabHeader-' + tabId);
                        // const isActive = matches(tabHeader, '.active');
                        const headers = me.node.querySelectorAll('.azTabLabel');
                        if (headers.length) {
                            const active = tabHeader.parentNode.querySelector('.active');
                            if (!active) {
                                me.activateTabByIndex(0);
                            }
                            // me.showHideScrollers();
                            me.fitTabWidth();
                        } else if (settings.closeOnEmpty) {
                            remove(me.node);
                        }
                    }
                }
            },
            add: (e, elem) => {
                const draggable = azui.Draggable(elem);
                draggable.detachedX = false;
                draggable.detachedY = false;

                draggable.stopHook = function () {
                    // draggable and droppable need to be in the same sortable in order to
                    // share the same place holder, improvement?
                    azui.Droppable(elem, me.sortable.dropConfig, true);
                    azui.Draggable(elem, me.sortable.dragConfig, true);
                }
                me.node.style['z-index'] = ++Tabs.z;
                me.fitTabWidth();
            }
        });

        tabHeaderContainer.style['height'] = settings.headerHeight + 'px';

        if (settings.draggable) {
            azui.Draggable(node, {
                handle: '.azTabHeader',
                snapDistance: 8,
                create: function (event, ui) {
                    me.node.style['z-index'] = ++Tabs.z;
                    // console.log(event.target.classList.contains('azTabHeader'));
                    // console.log(event.target.classList);
                    if (event.type === 'touchstart' &&
                        event.target.classList.contains('azTabLabels')) {
                        // event.preventDefault();
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

        const mouseDownTouchStartEventListener = function (event) {
            me.node.style['z-index'] = ++Tabs.z;
        };
        me.replaceEventListener(
            'mousedown', 'mousedown', mouseDownTouchStartEventListener);

        if (isTouchDevice()) {
            me.replaceEventListener(
                'touchstart', 'touchstart', mouseDownTouchStartEventListener);
        }
    }

    fitTabWidth() {
        const me = this;
        const node = me.node;
        const nodeWidth = parseInt(getComputedStyle(node)['width']);
        const tabLabels = node.querySelectorAll('.azTabLabel:not(.az-placeholder)');
        const newWidth = Math.min(
            (nodeWidth - (me.settings.draggable ? 40 : 0)) / tabLabels.length, 150);
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
        const tabHeader = document.querySelector('.azTabLabel#azTabHeader-' + tabId);
        const tabContent = document.querySelector('#azTabContent-' + tabId);
        const isActive = matches(tabHeader, '.active');

        const parentBcr = node.parentNode.getBoundingClientRect();
        const parentX = parentBcr.left + getDocScrollLeft();
        const parentY = parentBcr.top + getDocScrollTop();
        const parentStyle = getComputedStyle(node.parentNode);
        const parentBorderTop = parseInt(parentStyle['border-top-width']);
        const parentBorderLeft = parseInt(parentStyle['border-left-width']);
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
        tabContent.style['display'] = 'block';
        newTabs.addTab(null, tabHeader, tabContent);
        // remove(tabHeader);

        const headers = node.querySelectorAll('.azTabLabel');
        if (headers.length) {
            if (isActive) {
                me.activateTabByIndex(0);
            }
            // me.showHideScrollers();
            me.fitTabWidth();
        } else if (me.settings.closeOnEmpty) {
            remove(node);
        }
    }

    addTab(icon, title, contentNode, closable = true, activate = true, tabId = null) {
        const me = this;

        if (tabId) {
            const labels = [...me.node.querySelectorAll('div.azTabLabel')]
            for (const el of labels) {
                const elId = _getTabId(el.id);
                if (elId === tabId) {
                    me.activateTab(tabId);
                    return true;
                }
            }
        }

        tabId = tabId || randGen(8);

        const iconDiv = document.createElement('div');
        iconDiv.classList.add('icon');
        iconDiv.appendChild(normalizeIcon(icon || ''));

        let headerNode;
        if (typeof title === 'string') {
            const titleDiv = document.createElement('div');
            titleDiv.classList.add('title');
            titleDiv.appendChild(normalizeIcon(title));
            headerNode = document.createElement('div');
            // headerNode.classList.add('azTabLabel');
            headerNode.appendChild(iconDiv)
            headerNode.appendChild(titleDiv);

            if (closable) {
                const closeDiv = document.createElement('div');
                closeDiv.classList.add('close');
                closeDiv.appendChild(parseDOMElement(icons.svgClose)[0]);
                headerNode.appendChild(closeDiv);
                headerNode.classList.add('azClosable');
            }
        } else {
            headerNode = title;
        }

        headerNode.classList.add('azTabLabel');
        headerNode.setAttribute('id', 'azTabHeader-' + tabId)

        const closeDiv = headerNode.querySelector('.close');
        if (closeDiv) {
            closeDiv.addEventListener('click', me.closeClicked);
        }

        me.sortable.add(headerNode);

        if (contentNode && typeof contentNode === 'string') {
            contentNode = document.createElement('div');
        }
        contentNode.setAttribute('id', 'azTabContent-' + tabId);
        contentNode.classList.add('azTabContent');
        contentNode.style['display'] = 'none';
        me.node.appendChild(contentNode);

        me.applyEvents(headerNode);

        // me.showHideScrollers();
        me.fitTabWidth();
        if (activate === true) {
            me.activateTab(tabId)
        }
        return tabId;
    }

    removeTab(tabId) {
        const me = this;
        const node = me.node;
        const tab = node.querySelector('.azTabLabel#azTabHeader-' + tabId);
        const isActive = matches(tab, '.active');
        remove(tab);
        remove(node.querySelector('#azTabContent-' + tabId));
        const headers = node.querySelectorAll('.azTabLabel');
        if (headers.length) {
            if (isActive) {
                me.activateTabByIndex(0);
            }
            me.fitTabWidth();
        } else if (me.settings.closeOnEmpty) {
            remove(node);
        }
    }
    activateTab(tabId) {
        const me = this;
        const node = me.node;
        let activated = false;
        node.querySelectorAll('div.azTabContent').forEach(el => {
            const elId = _getTabId(el.id);
            if (elId === tabId) {
                el.style['display'] = 'block';
            } else {
                el.style['display'] = 'none';
            }
        });
        node.querySelectorAll('div.azTabLabel').forEach(el => {
            const elId = _getTabId(el.id);
            if (elId === tabId) {
                el.classList.add('active');
                activated = true;
            } else {
                el.classList.remove('active');
            }
        });
        return activated;
    }
    activateTabByIndex(tabIndex) {
        const me = this;
        const node = me.node;

        node.querySelectorAll('div.azTabContent').forEach((el, index) => {
            if (index === tabIndex) {
                el.style['display'] = 'block';
            } else {
                el.style['display'] = 'none';
            }
        });
        node.querySelectorAll('div.azTabLabel').forEach((el, index) => {
            if (index === tabIndex) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }
};