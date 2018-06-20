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
            headerHeight: 40,
        }, options);

        const self = this;
        const node = this.node;
        node.classList.add('azTabs');

        self.tabContextMenu = [{
                icon: icons.svgClose,
                title: 'Close tab',
                action: function (e, target) {
                    self.removeTab(_getTabId(target.id));
                    return false;
                }
            }, {
                icon: icons.svgClose,
                title: 'Close other tabs',
                action: function (e, target) {
                    siblings(target, '.azTabLabel').forEach(function (element) {
                        self.removeTab(_getTabId(element.id));
                    });
                    return false;
                }
            }, {
                icon: icons.svgClose,
                title: 'Close tabs to the right',
                action: function (e, target) {
                    nextAll(target, '.azTabLabel').forEach(function (element) {
                        self.removeTab(_getTabId(element.id));
                    });
                    return false;
                }
            },
            null,
            {
                icon: icons.svgClose,
                title: 'Close All',
                action: function (e, target) {
                    siblings(target, '.azTabLabel').forEach(function (element) {
                        self.removeTab(_getTabId(element.id));
                    });
                    self.removeTab(_getTabId(target.id));
                    return false;
                }
            }
        ];

        self.headerClicked = function (cm) {
            return function (event) {
                if (event.button === 2 || cm.on || self.dragging) {
                    return;
                }
                const tabId = _getTabId(event.currentTarget.id);
                self.activateTab(tabId);
            }
        };

        self.closeClicked = function (event) {
            const tabId = _getTabId(event.currentTarget.parentNode.id);
            self.removeTab(tabId);
            event.stopPropagation();
        };

        const tabHeaderContainer = node.querySelector('div.azTabHeader');
        const tabLabelList = node.querySelectorAll('div.azTabLabel'); // a list
        const tabLabels = document.createElement('div');
        tabLabels.classList.add('azTabLabels');
        tabHeaderContainer.appendChild(tabLabels);

        tabLabelList.forEach(el => {
            const cm = azui.ContextMenu(el, {
                items: self.tabContextMenu
            });
            const headerClicked = self.headerClicked(cm);

            el.addEventListener('mouseup', headerClicked);
            el.addEventListener('touchend', headerClicked);
            if (matches(el, '.azClosable')) {
                const iconDiv = document.createElement('div');
                iconDiv.classList.add('close');
                iconDiv.appendChild(parseDOMElement(icons.svgClose)[0]);
                iconDiv.addEventListener('click', self.closeClicked);
                el.appendChild(iconDiv);
            }
            tabLabels.appendChild(el);
        });
        self.activateTabByIndex(0);

        self.dragging = false;
        self.sortable = azui.Sortable(tabLabels, {
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

        tabHeaderContainer.style['height'] = settings.headerHeight + 'px';

        const leftScroller = parseDOMElement(`<div class='azTabScroller left'>${icons.svgPreviousPage}</div>`)[0];
        const rightScroller = parseDOMElement(`<div class='azTabScroller right'>${icons.svgNextPage}</div>`)[0];

        self.showHideScrollers = () => {
            leftScroller.style.display = tabLabels.scrollLeft <= 0 ? 'none' : 'grid';
            const style = getComputedStyle(tabLabels);
            const width = parseInt(style.width);
            const scrollWidth = tabLabels.scrollWidth;
            // console.log(width, scrollWidth, tabLabels.scrollLeft);
            rightScroller.style.visibility = scrollWidth > width + tabLabels.scrollLeft ? 'visible' : 'hidden';
        };

        leftScroller.addEventListener('click', e => {
            tabLabels.scrollLeft -= 100;
            self.showHideScrollers();
            // console.log(tabLabels.scrollLeft);
        });
        rightScroller.addEventListener('click', e => {
            tabLabels.scrollLeft += 100;
            self.showHideScrollers();
            // console.log(tabLabels.scrollLeft);
        });
        tabHeaderContainer.appendChild(leftScroller);
        tabHeaderContainer.appendChild(rightScroller);
        self.showHideScrollers();
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
        header.classList.add('azTabLabel');
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

        const cm = azui.ContextMenu(header, {
            items: self.tabContextMenu
        });

        const headerClicked = self.headerClicked(cm);
        header.addEventListener('mouseup', headerClicked);
        header.addEventListener('touchend', headerClicked);
        self.showHideScrollers();
    }
    removeTab(tabId) {
        const self = this;
        const node = self.node;
        const isActive = matches(node.querySelector(".azTabLabel#azTabHeader-" + tabId), '.active');
        remove(node.querySelector(".azTabLabel#azTabHeader-" + tabId));
        remove(node.querySelector("#azTabContent-" + tabId));
        const headers = node.querySelectorAll('.azTabLabel');
        if (headers.length) {
            if (isActive) {
                self.activateTabByIndex(0);
            }
        } else {
            remove(node);
        }
        self.showHideScrollers();
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
        const self = this;
        const node = self.node;

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