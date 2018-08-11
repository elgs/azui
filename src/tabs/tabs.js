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
    siblings,
    getDocScrollTop,
    getDocScrollLeft
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
            draggable: true,
            resizable: true,
        }, options);

        const self = this;
        const node = this.node;
        self.settings = settings;
        node.classList.add('azTabs');

        self.tabContextMenu = [{
                // icon: icons.svgClose,
                title: 'Close tab',
                action: function (e, target) {
                    self.removeTab(_getTabId(target.id));
                    return false;
                }
            }, {
                // icon: icons.svgClose,
                title: 'Close other tabs',
                action: function (e, target) {
                    siblings(target, '.azTabLabel').forEach(function (element) {
                        self.removeTab(_getTabId(element.id));
                    });
                    return false;
                }
            }, {
                // icon: icons.svgClose,
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
                // icon: icons.svgClose,
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
                // console.log(event.button);
                const tabId = _getTabId(event.currentTarget.id);
                self.activateTab(tabId);
            }
        };

        self.closeClicked = function (event) {
            const tabId = _getTabId(event.currentTarget.parentNode.id);
            self.removeTab(tabId);
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
                self.dragging = true;
            },
            stop: (e, data) => {
                self.dragging = false;
                const tabId = _getTabId(data.source.id);
                if (data.escaped) {
                    const x = data.boundingClientRect.left + getDocScrollLeft();
                    const y = data.boundingClientRect.top + getDocScrollTop();
                    self.spawn(tabId, x, y);
                } else {
                    self.activateTab(tabId);
                }
            },
            escape: (e) => {
                console.log(e);
            },
            capture: (e) => {
                console.log(e);
            }
        });

        tabHeaderContainer.style['height'] = settings.headerHeight + 'px';

        // const leftScroller = parseDOMElement(`<div class='azTabScroller left'>${icons.svgPreviousPage}</div>`)[0];
        // const rightScroller = parseDOMElement(`<div class='azTabScroller right'>${icons.svgNextPage}</div>`)[0];

        // self.showHideScrollers = () => {
        //     leftScroller.style.display = tabLabels.scrollLeft <= 0 ? 'none' : 'grid';
        //     const style = getComputedStyle(tabLabels);
        //     const width = parseInt(style.width);
        //     const scrollWidth = tabLabels.scrollWidth;
        //     // console.log(width, scrollWidth, tabLabels.scrollLeft);
        //     rightScroller.style.visibility = scrollWidth > width + tabLabels.scrollLeft ? 'visible' : 'hidden';
        // };

        // leftScroller.addEventListener('click', e => {
        //     tabLabels.scrollLeft -= 100;
        //     self.showHideScrollers();
        //     // console.log(tabLabels.scrollLeft);
        // });
        // rightScroller.addEventListener('click', e => {
        //     tabLabels.scrollLeft += 100;
        //     self.showHideScrollers();
        //     // console.log(tabLabels.scrollLeft);
        // });
        // tabHeaderContainer.appendChild(leftScroller);
        // tabHeaderContainer.appendChild(rightScroller);
        // self.showHideScrollers();

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
                    // self.showHideScrollers();
                    self.fitTabWidth();
                },
            });
        }
    }

    fitTabWidth() {
        const self = this;
        const node = self.node;
        const nodeWidth = parseInt(getComputedStyle(node)['width']);
        const tabLabels = node.querySelectorAll('.azTabLabel:not(.az-placeholder)');
        const newWidth = Math.min((nodeWidth - (self.settings.draggable ? 40 : 0)) / tabLabels.length, 150);
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
        const self = this;
        const node = self.node;
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
        const newNode = newTabs.node;

        // const newLabels = newNode.querySelector('div.azTabHeader>.azTabLabels');
        // console.log(tabHeader, newLabels);
        // newLabels.appendChild(tabHeader);
        newTabs.sortable.add(tabHeader);

        tabContent.style['display'] = "block";
        newNode.appendChild(tabContent);

        const headers = node.querySelectorAll('.azTabLabel');
        if (headers.length) {
            if (isActive) {
                self.activateTabByIndex(0);
            }
            // self.showHideScrollers();
            self.fitTabWidth();
        } else {
            remove(node);
        }
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
        // self.showHideScrollers();
        self.fitTabWidth();
    }
    removeTab(tabId) {
        const self = this;
        const node = self.node;
        const tab = node.querySelector(".azTabLabel#azTabHeader-" + tabId);
        const isActive = matches(tab, '.active');
        remove(tab);
        remove(node.querySelector("#azTabContent-" + tabId));
        const headers = node.querySelectorAll('.azTabLabel');
        if (headers.length) {
            if (isActive) {
                self.activateTabByIndex(0);
            }
            // self.showHideScrollers();
            self.fitTabWidth();
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