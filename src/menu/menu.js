import {
    azObj,
    Base
} from '../utilities/core.js';
import {
    matches,
    normalizeIcon,
    parseDOMElement,
    resolveFunction,
    siblings
} from '../utilities/utilities.js';


azui.Menu = function (el, options, init) {
    return azObj(Menu, el, options, init);
};

class Menu extends Base {

    static className = 'Menu';

    azInit(options) {
        const settings = Object.assign({}, options);

        const me = this;
        const node = me.node;

        const navigateMenu = function () {
            const selected = Array.prototype.filter.call(node.children, n => matches(n, '.azMenuItem'))[highlightIndex];
            // console.log(selected.innerHTML);
            // const selected = menu.children('.azMenuItem').eq(highlightIndex);
            Array.prototype.filter
                .call(node.children, n => matches(n, '.azMenuItem'))
                .forEach(el => {
                    el.classList.remove('selected');
                });
            // menu.children('.azMenuItem').removeClass('selected');
            selected.classList.add('selected');
        };

        const createMenuItem = function (item) {
            if (!item) {
                const separator = parseDOMElement('<div>&nbsp;</div>')[0];
                separator.classList.add('azMenuSeparator');
                return separator;
            }

            const hidden = resolveFunction(item.hidden);
            if (hidden === true) {
                return null;
            }

            const menuItem = document.createElement('div');
            menuItem.classList.add('azMenuItem');
            const disabled = resolveFunction(item.disabled);
            if (disabled) {
                menuItem.classList.add('disabled');
            }

            const icon = item.icon || '';
            const iconDiv = normalizeIcon(icon);
            iconDiv.classList.add('icon');
            menuItem.appendChild(iconDiv);

            const title = item.title || '';
            const titleDiv = normalizeIcon(title);
            titleDiv.classList.add('title');
            menuItem.appendChild(titleDiv);
            // iconDiv.innerHTML = icon;
            // titleDiv.innerHTML = title;
            if (!disabled) {
                menuItem.addEventListener('click', e => {
                    item.action.call(menuItem, e, settings.target || node);
                    menuItem.classList.add('active');
                    siblings(menuItem, '.azMenuItem').map(o => {
                        o.classList.remove('active');
                    });
                });
            }

            return menuItem;
        };

        const onKeyUp = e => {
            // console.log(e.keyCode);

            if (e.keyCode === 38) {
                // up
            } else if (e.keyCode === 40) {
                // down
            } else if (e.keyCode === 13 || e.keyCode === 32) {
                // enter
                const selected = Array.prototype.filter.call(node.children, n => matches(n, '.azMenuItem'))[highlightIndex];
                selected.click();
            }
        };

        node.setAttribute('tabindex', 0);
        node.addEventListener('keyup', onKeyUp);

        // $('<div>&nbsp;</div>').addClass('azMenuIconSeparator').appendTo($menu);

        const items = resolveFunction(settings.items);
        let lastItem = null;
        items.map((item, index) => {
            const menuItem = createMenuItem(item)
            lastItem = menuItem;
            let append = !!menuItem;
            if (append && matches(menuItem, '.azMenuSeparator') && !!lastItem) {
                append = false;
            }
            // console.log(menuItem, append);
            if (append) {
                node.appendChild(menuItem);
            }
        });

    }
};