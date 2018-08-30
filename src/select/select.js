import {
    azObj,
    Base
} from '../utilities/core.js';
import * as icons from '../utilities/icons.js';
import {
    matches,
    empty
} from '../utilities/utilities.js';

azui.Select = function (el, options, init) {
    // return new Select(el, options);
    return azObj(Select, el, options, init);
};

class Select extends Base {
    // constructor(el, options) {
    // super(el);
    azInit(options) {
        const settings = Object.assign({
            items: []
        }, options);

        const me = this;
        const node = me.node;

        empty(node);

        node.classList.add('azSelect');

        const onDropdown = function (e) {
            // console.log(e.currentTarget);
            const createMenuItem = function (item) {
                if (!item) {
                    const sep = document.createElement('div');
                    sep.textContent('&nbsp;');
                    sep.classList.add('azMenuSeparator');
                }
                let title = item.title;
                const titleDiv = document.createElement('div');
                titleDiv.classList.add('title');
                const menuItem = document.createElement('div');
                menuItem.classList.add('azMenuItem');
                menuItem.appendChild(titleDiv);
                titleDiv.textContent = title;
                const onClick = function (e) {
                    selectInput.value = title;
                };
                menuItem.addEventListener('click', onClick);
                menuItem.addEventListener('touchstart', onClick);
                return menuItem;
            };

            const menu = document.createElement('div');
            menu.classList.add('azSelectMenu');
            menu.style['display'] = 'none';
            menu.style['z-index'] = 1000;
            document.documentElement.appendChild(menu);
            dropdownShown = true;
            highlightIndex = -1;

            // $('<div>&nbsp;</div>').addClass('azMenuIconSeparator').appendTo($menu);

            if (typeof settings.items === 'function') {
                settings.items = settings.items();
            }

            settings.items.map(item => {
                if (typeof item === 'function') {
                    const title = item();
                    item = {
                        key: title,
                        title
                    }
                } else if (item === null || item === undefined || typeof item === 'object') {
                    // unchanged.
                } else {
                    item = {
                        key: item,
                        title: item
                    }
                }
                if (item.title.toLowerCase().includes(selectInput.value.toLowerCase())) {
                    menu.appendChild(createMenuItem(item));
                }
            });

            const offDropdown = function (e) {
                if (e.target === selectInput[0]) {
                    return;
                }
                menu.parentNode.removeChild(menu);
                document.removeEventListener('click', offDropdown);
                document.removeEventListener('touchstart', offDropdown);
                document.removeEventListener('keyup', navigateDropdown);
                dropdownShown = false;
            };

            const navigateDropdown = function (e) {
                // console.log(e.keyCode);
                const menuLength = menu.querySelectorAll('.azMenuItem').length;
                if (e.keyCode === 38) {
                    // up
                    --highlightIndex;
                    highlightIndex = highlightIndex < 0 ? 0 : highlightIndex;
                } else if (e.keyCode === 40) {
                    // down
                    ++highlightIndex;
                    highlightIndex = highlightIndex >= menuLength - 1 ? menuLength - 1 : highlightIndex;
                }

                const selected = Array.prototype.filter.call(menu.children, n => matches(n, '.azMenuItem'))[highlightIndex];
                //const selected = menu.children('.azMenuItem').eq(highlightIndex);
                Array.prototype.filter.call(menu.children, n => matches(n, '.azMenuItem')).forEach(el => {
                    el.classList.remove('selected');
                });
                // menu.children('.azMenuItem').removeClass('selected');
                if (selected) {
                    selected.classList.add('selected');
                    if (e.keyCode === 13) {
                        selectInput.value = selected.textContent;
                        document.documentElement.click();
                    }
                }
            };

            document.addEventListener('click', offDropdown);
            document.addEventListener('touchstart', offDropdown);
            document.addEventListener('keyup', navigateDropdown);

            const meBcr = node.getBoundingClientRect();
            menu.style['left'] = meBcr.left;
            menu.style['top'] = meBcr.bottom;
            menu.style['width'] = meBcr.width;
            menu.style['display'] = 'block';

            e.stopPropagation();
        };

        let dropdownShown = false;
        let highlightIndex = -1;

        const toggleDropdown = function (e) {
            if (!dropdownShown) {
                onDropdown(e);
            } else {
                document.documentElement.click();
            }
        };

        const onInputKeyUp = function (e) {
            // console.log(e.keyCode);
            if (e.keyCode === 27) {
                // esc key is pressed
                if (dropdownShown) {
                    toggleDropdown(e);
                }
            } else if (e.keyCode === 40) {
                // if key code is down arrow key, triggered full dropdown
                if (!dropdownShown) {
                    toggleDropdown(e);
                }
            } else if (e.keyCode === 38) {
                // if key code is up arrow key, remove dropdown
                // if (dropdownShown) {
                //     toggleDropdown(e);
                // }
            } else if (e.keyCode === 13) {
                if (dropdownShown) {
                    document.documentElement.dispatchEvent(new e.constructor(e.type, e));
                } else {
                    // submit
                    node.dispatchEvent(new CustomEvent('done', {
                        detail: {
                            value: selectInput.value
                        }
                    }));
                }
            } else if (selectInput.value.trim().length > 0) {
                // if input.val().trim().length>0, trigger filtered dropdown
                if (!dropdownShown) {
                    toggleDropdown(e);
                } else {
                    toggleDropdown(e);
                    toggleDropdown(e);
                }
            } else if (selectInput.value.trim().length === 0) {
                if (dropdownShown) {
                    toggleDropdown(e);
                }
            }
        };

        const selectInput = document.createElement('input');
        selectInput.setAttribute('type', 'text');
        selectInput.classList.add('azSelectInput');
        node.appendChild(selectInput);

        selectInput.addEventListener('keyup', onInputKeyUp);

        const dropdownButton = document.createElement('div');
        dropdownButton.innerHTML = icons.svgTriangleDown;
        dropdownButton.classList.add('azSelectdropdownButton');
        node.appendChild(dropdownButton);

        dropdownButton.addEventListener('click', toggleDropdown);
    }
};