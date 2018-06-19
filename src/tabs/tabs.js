import {
    Base
} from '../utilities/core.js';
import * as icons from '../utilities/icons.js';
import {
    insertAfter,
    matches,
    nextAll,
    normalizeIcon,
    parseDOMElement,
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
            self.activateTab(tabId);
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
            if (matches(el, '.azClosable')) {
                const iconDiv = document.createElement('div');
                iconDiv.classList.add('close');
                iconDiv.appendChild(parseDOMElement(icons.svgClose)[0]);
                iconDiv.addEventListener('click', self.closeClicked);
                el.appendChild(iconDiv);
            }
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
            const iconDiv = document.createElement('div');
            iconDiv.classList.add('close');
            iconDiv.appendChild(parseDOMElement(icons.svgClose)[0]);
            iconDiv.addEventListener('click', self.closeClicked);
            header.appendChild(iconDiv);
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
        // header.querySelectorAll('.close').forEach(el => {
        //     el.addEventListener('click', self.closeClicked);
        // });

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
    activateTab(tabId) {
        const self = this;
        const node = self.node;
        const tabContent = node.querySelectorAll('div.azTabContent').forEach(el => {
            const elId = _getTabId(el.id);
            if (elId === tabId) {
                el.style['display'] = "block";
            } else {
                el.style['display'] = "none";
            }
        });
        const tabHeaders = node.querySelectorAll('div.azTabHeader').forEach(el => {
            const elId = _getTabId(el.id);
            if (elId === tabId) {
                el.classList.add("active");
            } else {
                el.classList.remove("active");
            }
        });
    }
    activateTabByIndex(tabIndex) {
        const self = this;
        const node = self.node;

        const tabContent = node.querySelectorAll('div.azTabContent').forEach((el, index) => {
            if (index === tabIndex) {
                el.style['display'] = "block";
            } else {
                el.style['display'] = "none";
            }

        });
        const tabHeaders = node.querySelectorAll('div.azTabHeader').forEach((el, index) => {
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