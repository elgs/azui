import {
    azObj,
    Base
} from '../utilities/core.js';
import * as icons from '../utilities/icons.js';
import {
    empty,
    getDocScrollLeft,
    getDocScrollTop,
    index,
    isTouchDevice,
    matches,
    remove
} from '../utilities/utilities.js';

azui.Select = function (el, options, init) {
    return azObj(Select, el, options, init);
};

class Select extends Base {
    static className = 'Select';

    azInit(options) {
        const settings = Object.assign({
                items: [],
                select: (e) => {},
            },
            options);

        const me = this;
        const node = me.node;

        empty(node);

        node.classList.add('azSelect');

        const showDropdown = function (e, showAll = false) {
            // console.log('show');
            // alert(e.currentTarget.outerHTML);
            // console.log(e.currentTarget);
            const createMenuItem = function (item) {
                if (!item) {
                    const sep = document.createElement('div');
                    sep.textContent('&nbsp;');
                    sep.classList.add('azMenuSeparator');
                }
                const title = item.title;
                const titleDiv = document.createElement('div');
                titleDiv.classList.add('title');
                const menuItem = document.createElement('div');
                menuItem.classList.add('azMenuItem');
                menuItem.appendChild(titleDiv);
                titleDiv.textContent = title;
                const onSelect = function (e) {
                    me.selectInput.value = title;
                };
                menuItem.addEventListener('mousedown', onSelect);
                if (isTouchDevice()) {
                    menuItem.addEventListener('touchstart', onSelect);
                }

                const onMouseEnter = function (e) {
                    highlightIndex = index(e.currentTarget, '.azMenuItem');
                    navigateDropdown(e);
                };
                menuItem.addEventListener('mouseenter', onMouseEnter);

                return menuItem;
            };

            me.menu = document.createElement('div');
            me.menu.classList.add('azSelectMenu');
            me.menu.style['display'] = 'none';
            me.menu.style['z-index'] = 1000;
            document.documentElement.appendChild(me.menu);
            dropdownShown = true;
            highlightIndex = -1;

            // $('<div>&nbsp;</div>').addClass('azMenuIconSeparator').appendTo($menu);

            if (typeof settings.items === 'function') {
                settings.items = settings.items();
            }

            settings.items.map((item, index) => {
                if (typeof item === 'function') {
                    const title = item();
                    item = {
                        key: title,
                        title
                    }
                } else if (
                    item === null || item === undefined || typeof item === 'object') {
                    // unchanged.
                } else {
                    item = {
                        key: item,
                        title: item
                    }
                }
                // console.log(item);
                if (!!showAll || item.title.toLowerCase().includes(me.selectInput.value.toLowerCase())) {
                    me.menu.appendChild(createMenuItem(item));

                    // highlight the selected
                    if (!!showAll && item.title === me.selectInput.value) {
                        highlightIndex = index;
                        navigateDropdown(e);
                    }
                }
            });

            document.addEventListener('mousedown', offDropdown);
            document.addEventListener('keyup', navigateDropdown);

            if (isTouchDevice()) {
                document.addEventListener('touchstart', offDropdown);
            }

            const meBcr = node.getBoundingClientRect();
            me.menu.style['left'] = meBcr.left + getDocScrollLeft();
            me.menu.style['top'] = meBcr.bottom + getDocScrollTop();
            me.menu.style['width'] = meBcr.width;
            me.menu.style['display'] = 'block';

            setTimeout(() => {
                me.selectInput.focus();
            });

            if (e) {
                e.stopPropagation();
            }
        };

        let dropdownShown = false;
        let highlightIndex = -1;

        const navigateDropdown = function (e) {
            // console.log(e.keyCode);
            const menuLength = me.menu.querySelectorAll('.azMenuItem').length;
            if (e.keyCode === 38) {
                // up
                --highlightIndex;
                highlightIndex = highlightIndex < 0 ? 0 : highlightIndex;
            } else if (e.keyCode === 40) {
                // down
                ++highlightIndex;
                highlightIndex =
                    highlightIndex >= menuLength - 1 ? menuLength - 1 : highlightIndex;
            }

            const selected = Array.prototype.filter.call(
                me.menu.children, n => matches(n, '.azMenuItem'))[highlightIndex];
            // const selected = menu.children('.azMenuItem').eq(highlightIndex);
            Array.prototype.filter
                .call(me.menu.children, n => matches(n, '.azMenuItem'))
                .forEach(el => {
                    el.classList.remove('selected');
                });
            // menu.children('.azMenuItem').removeClass('selected');
            if (selected) {
                selected.classList.add('selected');
                if (e.keyCode === 13) {
                    me.selectInput.value = selected.textContent;
                    // document.documentElement.click();
                    offDropdown(e);
                }
            }
        };

        const offDropdown = function (e) {
            // console.log('off');
            // if (e.target === me.selectInput) {
            // return;
            // }
            remove(me.menu);

            document.removeEventListener('mousedown', offDropdown);
            document.removeEventListener('keyup', navigateDropdown);

            if (isTouchDevice()) {
                document.removeEventListener('touchstart', offDropdown);
            }

            dropdownShown = false;

            if (e) {
                // alert(e.currentTarget.innerHTML);
                e.stopPropagation();
            }
        };

        const toggleDropdown = function (e) {
            // console.log(dropdownShown, e.type, e.button, e);
            if (e.type === 'mousedown' && e.button !== 0) {
                return;
            }
            if (e.type === 'touchstart') {
                e.preventDefault();
            }
            if (!dropdownShown) {
                showDropdown(e, true);
            } else {
                offDropdown(e);
            }
        };

        const onInputKeyUp = function (e) {
            // console.log(me.selectInput.value.trim().length);
            // console.log(e.keyCode, me.selectInput.value.trim().length);
            if (e.keyCode === 27) {
                // esc key is pressed
                if (dropdownShown) {
                    offDropdown(e);
                }
            } else if (e.keyCode === 40) {
                // if key code is down arrow key, triggered full dropdown
                if (!dropdownShown) {
                    showDropdown(e, true);
                }
            } else if (e.keyCode === 38) {
                // if key code is up arrow key, remove dropdown
                // if (dropdownShown) {
                //     toggleDropdown(e);
                // }
            } else if (e.keyCode === 13) {
                if (dropdownShown) {
                    // document.documentElement.dispatchEvent(new e.constructor(e.type,
                    // e));

                } else {
                    // submit
                    node.dispatchEvent(
                        new CustomEvent('done', {
                            detail: {
                                value: me.selectInput.value
                            }
                        }));
                }
            } else if (me.selectInput.value.trim().length >= 0) {
                // if input.val().trim().length>0, trigger filtered dropdown
                settings.select(e);
                if (!dropdownShown) {
                    showDropdown(e);
                } else {
                    offDropdown(e);
                    showDropdown(e);
                }
            }
        };

        me.selectInput = document.createElement('input');
        me.selectInput.setAttribute('type', 'text');
        me.selectInput.classList.add('azSelectInput');
        node.appendChild(me.selectInput);

        me.selectInput.addEventListener('keyup', onInputKeyUp);

        const dropdownButton = document.createElement('div');
        dropdownButton.innerHTML = icons.svgTriangleDown;
        dropdownButton.classList.add('azSelectdropdownButton');
        node.appendChild(dropdownButton);

        if (isTouchDevice()) {
            dropdownButton.addEventListener('touchstart', toggleDropdown);
        }
        dropdownButton.addEventListener('mousedown', toggleDropdown);
    }
};