import {
    Base
} from '../utilities/core.js';

import {
    randGen,
    randGenConsts,
    normalizeIcon,
    matches,
    remove,
    siblings,
    nextAll,
    insertAfter,
} from '../utilities/utilities.js';

azui.Tabs = function (el, options) {
    return new Tabs(el, options);
};

class Tabs extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({

        }, options);
        const self = this;

        for (const node of this.nodeList) {
            node.classList.add('azTabs');

            const tabContextMenu = [{
                    icon: '',
                    title: 'Close tab',
                    action: function (e, target) {
                        node.dispatchEvent(new CustomEvent('closeTab', {
                            detail: {
                                id: self._getTabId(target.id)
                            }
                        }));
                    }
                }, {
                    icon: '',
                    title: 'Close other tabs',
                    action: function (e, target) {
                        siblings(target, '.azTabHeader').forEach(function (element) {
                            node.dispatchEvent(new CustomEvent('closeTab', {
                                detail: {
                                    id: self._getTabId(element.id)
                                }
                            }));
                        });
                    }
                }, {
                    icon: '',
                    title: 'Close tabs to the right',
                    action: function (e, target) {
                        nextAll(target, '.azTabHeader').forEach(function (element) {
                            node.dispatchEvent(new CustomEvent('closeTab', {
                                detail: {
                                    id: self._getTabId(element.id)
                                }
                            }));
                        });
                    }
                },
                null,
                {
                    icon: '',
                    title: 'Close All',
                    callback: function (e, target) {
                        siblings(target, '.azTabHeader').forEach(function (element) {
                            const tabId = self._getTabId(element.id);
                            node.dispatchEvent(new CustomEvent('closeTab', {
                                detail: {
                                    id: tabId
                                }
                            }));
                        });
                        const tabId = self._getTabId(target.id);
                        node.dispatchEvent(new CustomEvent('closeTab', {
                            detail: {
                                id: tabId
                            }
                        }));
                    }
                }
            ];

            const headerClicked = function (event) {
                const tabId = self._getTabId(event.currentTarget.id);
                const tabContent = node.querySelectorAll('div.azTabContent').forEach(el => {
                    el.style['display'] = "none";
                });
                const tabHeaders = node.querySelectorAll('div.azTabHeader').forEach(el => {
                    el.classList.remove("active");
                });

                node.querySelector('#azTabContent-' + tabId).style['display'] = "block";
                event.currentTarget.classList.add("active");
            };

            const closeClicked = function (event) {
                const tabId = self._getTabId(event.currentTarget.parentNode.id);
                node.dispatchEvent(new CustomEvent('closeTab', {
                    detail: {
                        id: tabId
                    }
                }));
            };

            const newTabClicked = function (e) {
                node.dispatchEvent(new CustomEvent('newTab', {
                    detail: {
                        id: randGen(8, randGenConsts.LowerUpperDigit, '', ''),
                        icon: '☺',
                        title: 'New Tab',
                        closable: true,
                        // content: 'SH',
                    }
                }));
            };

            const tabHeaderContainer = node.querySelector('div.azTabHeaders');
            const tabHeaderList = node.querySelectorAll('div.azTabHeader'); // a list
            const tabContentList = node.querySelectorAll('div.azTabContent'); // a list

            tabHeaderList.forEach(el => {
                el.addEventListener('mousedown', headerClicked);
            });
            tabHeaderList.forEach(el => {
                el.addEventListener('touchstart', headerClicked);
            });
            node.querySelectorAll('div.azTabHeader .close').forEach(el => {
                el.addEventListener('click', closeClicked);
            });
            tabHeaderList[0].click();
            node.querySelector('.newTab').addEventListener('click', newTabClicked);

            azui.Sortable(tabHeaderContainer);

            azui.ContextMenu(tabHeaderList, {
                items: tabContextMenu
            });

            // methods

            node.addEventListener('newTab', function (e) {
                const data = e.detail;
                const icon = document.createElement('div');
                icon.classList.add('icon');
                icon.appendChild(normalizeIcon(data.icon));
                const title = document.createElement('div');
                title.classList.add('title');
                title.appendChild(normalizeIcon(data.title));
                const header = document.createElement('div');
                header.classList.add('azTabHeader');
                header.setAttribute('id', 'azTabHeader-' + data.id)
                header.appendChild(icon)
                header.appendChild(title);
                if (data.closable) {
                    const close = document.createElement('div');
                    close.classList.add('close');
                    close.textContent = '×';
                    header.appendChild(close);
                }

                const headers = node.querySelectorAll('.azTabHeader');
                if (headers.length) {
                    insertAfter(header, headers[headers.length - 1]);
                } else {
                    tabHeaderContainer.appendChild(header);
                }

                const content = document.createElement('div');
                content.innerHTML = data.content;
                content.setAttribute('id', 'azTabContent-' + data.id);
                content.classList.add('azTabContent');
                content.style['display'] = 'none';

                const contents = node.querySelectorAll('.azTabContent');
                if (contents.length) {
                    insertAfter(content, contents[contents.length - 1]);
                } else {
                    tabHeaderContainer.appendChild(content);
                }

                header.addEventListener('click', headerClicked);
                header.querySelectorAll('.close').forEach(el => {
                    el.addEventListener('click', closeClicked);
                });

                azui.ContextMenu(header, {
                    items: tabContextMenu
                });
            });

            node.addEventListener('closeTab', function (e) {
                const data = e.detail;
                const tabId = data.id;
                const isActive = matches(node.querySelector(".azTabHeader#azTabHeader-" + tabId), '.active');
                remove(node.querySelector(".azTabHeader#azTabHeader-" + tabId));
                remove(node.querySelector("#azTabContent-" + tabId));
                if (isActive) {
                    node.querySelectorAll('.azTabHeader')[0].click();
                }
            });
        }
    }

    _getTabId(elemId) {
        return elemId.split('-').splice(1, Number.MAX_SAFE_INTEGER).join('-');
    }
};