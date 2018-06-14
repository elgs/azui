import {
    Base
} from '../utilities/core.js';
import {
    insertAfter,
    matches,
    nextAll,
    normalizeIcon,
    randGen,
    remove,
    siblings
} from '../utilities/utilities.js';

azui.Tabs = function (el, options) {
    return new Tabs(el, options);
};

const _getTabId = (elemId) => {
    return elemId.split('-').splice(1, Number.MAX_SAFE_INTEGER).join('-');
};

class Tabs extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({

        }, options);

        const self = this;
        const node = this.node;
        node.classList.add('azTabs');

        self.tabContextMenu = [{
                icon: '',
                title: 'Close tab',
                action: function (e, target) {
                    self.removeTab(_getTabId(target.id));
                    return false;
                }
            }, {
                icon: '',
                title: 'Close other tabs',
                action: function (e, target) {
                    siblings(target, '.azTabHeader').forEach(function (element) {
                        self.removeTab(_getTabId(element.id));
                    });
                    return false;
                }
            }, {
                icon: '',
                title: 'Close tabs to the right',
                action: function (e, target) {
                    nextAll(target, '.azTabHeader').forEach(function (element) {
                        self.removeTab(_getTabId(element.id));
                    });
                    return false;
                }
            },
            null,
            {
                icon: '',
                title: 'Close All',
                action: function (e, target) {
                    siblings(target, '.azTabHeader').forEach(function (element) {
                        self.removeTab(_getTabId(element.id));
                    });
                    self.removeTab(_getTabId(target.id));
                    return false;
                }
            }
        ];

        self.headerClicked = function (event) {
            if (event.button === 2 || self.cm.on || self.dragging) {
                return;
            }
            const tabId = _getTabId(event.currentTarget.id);
            const tabContent = node.querySelectorAll('div.azTabContent').forEach(el => {
                el.style['display'] = "none";
            });
            const tabHeaders = node.querySelectorAll('div.azTabHeader').forEach(el => {
                el.classList.remove("active");
            });

            node.querySelector('#azTabContent-' + tabId).style['display'] = "block";
            event.currentTarget.classList.add("active");
        };

        self.closeClicked = function (event) {
            const tabId = _getTabId(event.currentTarget.parentNode.id);
            self.removeTab(tabId);
            event.stopPropagation();
        };

        // const newTabClicked = function (e) {
        //     self.addTab('x', 'New Tab', true);
        // };

        const tabHeaderContainer = node.querySelector('div.azTabHeaders');
        const tabHeaderList = node.querySelectorAll('div.azTabHeader'); // a list
        // const tabContentList = node.querySelectorAll('div.azTabContent'); // a list

        tabHeaderList.forEach(el => {
            el.addEventListener('mouseup', self.headerClicked);
            el.addEventListener('touchend', self.headerClicked);
        });
        node.querySelectorAll('div.azTabHeader .close').forEach(el => {
            el.addEventListener('click', self.closeClicked);
        });
        tabHeaderList[0].click();

        self.dragging = false;
        self.sortable = azui.Sortable(tabHeaderContainer, {
            create: (e, target) => {
                if (e.type === 'touchstart') {
                    e.preventDefault();
                }
            },
            start: (e, data) => {
                self.dragging = true;
            },
            stop: (e, data) => {
                self.dragging = false;
            }
        });

        self.cm = azui.ContextMenu(tabHeaderList, {
            items: self.tabContextMenu
        });
    }

    addTab(icon, title, closable) {
        const self = this;
        const node = self.node;
        const tabId = randGen(8);
        const iconDiv = document.createElement('div');
        iconDiv.classList.add('icon');
        iconDiv.appendChild(normalizeIcon(icon));
        const titleDiv = document.createElement('div');
        titleDiv.classList.add('title');
        titleDiv.appendChild(normalizeIcon(title));
        const header = document.createElement('div');
        header.classList.add('azTabHeader');
        header.setAttribute('id', 'azTabHeader-' + tabId)
        header.appendChild(iconDiv)
        header.appendChild(titleDiv);
        if (closable) {
            const close = document.createElement('div');
            close.classList.add('close');
            close.textContent = '×';
            header.appendChild(close);
        }

        self.sortable.add(header);

        const content = document.createElement('div');
        // content.innerHTML = data.content;
        content.setAttribute('id', 'azTabContent-' + tabId);
        content.classList.add('azTabContent');
        content.style['display'] = 'none';

        const contents = node.querySelectorAll('.azTabContent');
        if (contents.length) {
            insertAfter(content, contents[contents.length - 1]);
        } else {
            tabHeaderContainer.appendChild(content);
        }

        header.addEventListener('mouseup', self.headerClicked);
        header.addEventListener('touchend', self.headerClicked);
        header.querySelectorAll('.close').forEach(el => {
            el.addEventListener('click', self.closeClicked);
        });

        azui.ContextMenu(header, {
            items: self.tabContextMenu
        });
    }
    removeTab(tabId) {
        const self = this;
        const node = self.node;
        const isActive = matches(node.querySelector(".azTabHeader#azTabHeader-" + tabId), '.active');
        remove(node.querySelector(".azTabHeader#azTabHeader-" + tabId));
        remove(node.querySelector("#azTabContent-" + tabId));
        const headers = node.querySelectorAll('.azTabHeader');
        if (headers.length) {
            if (isActive) {
                node.querySelectorAll('.azTabHeader')[0].click();
            }
        } else {
            remove(node);
        }

    }
    activateTab(tabId) {}
    activateTabByIndex(tabIndex) {}
    attachTab() {}
    detachTab(tabId) {}

};