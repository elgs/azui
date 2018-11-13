import {
    azObj,
    Base
} from '../utilities/core.js';
import {
    calcMenuPosition,
    getHeight,
    getWidth,
    index,
    isOutside,
    isTouchDevice,
    matches,
    normalizeIcon,
    parseDOMElement
} from '../utilities/utilities.js';


azui.ContextMenu = function (el, options, init) {
    return azObj(ContextMenu, el, options, init);
};

class ContextMenu extends Base {
    static className = 'ContextMenu';

    azInit(options) {
        const settings = Object.assign({
                onRightClick: function (e) {},
                onTouchStart: function (e) {},
                onTouchEnd: function (e) {},
                items: []
            },
            options);

        const me = this;
        const node = this.node;

        let highlightIndex = -1;

        const navigateMenu = function () {
            // console.log(me.menu);
            if (!me.menu) {
                return;
            }
            const selected = Array.prototype.filter.call(me.menu.children, n => matches(n, '.azMenuItem'))[highlightIndex];
            // console.log(selected.innerHTML);
            // const selected = menu.children('.azMenuItem').eq(highlightIndex);
            Array.prototype.filter
                .call(me.menu.children, n => matches(n, '.azMenuItem'))
                .forEach(el => {
                    el.classList.remove('selected');
                });
            // menu.children('.azMenuItem').removeClass('selected');
            selected.classList.add('selected');
        };

        me.dismissMenu = e => {
            if (e.type === 'touchstart') {
                const pb = me.menu.getBoundingClientRect();
                if (isOutside(e.pageX || e.touches[0].pageX, e.pageY || e.touches[0].pageY, pb)) {
                    me.menu.remove();
                } else {
                    document.addEventListener('touchstart', me.dismissMenu, {
                        once: true
                    });
                }
            } else {
                me.menu.remove();
            }
        };

        const createMenuItem = function (item, menu) {
            if (!item) {
                const separator = parseDOMElement('<div>&nbsp;</div>')[0];
                separator.classList.add('azMenuSeparator');
                return separator;
            }

            const menuItem = document.createElement('div');
            menuItem.classList.add('azMenuItem');
            if (item.disabled) {
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
            if (!item.disabled) {
                menuItem.addEventListener('click', e => {
                    if (item.action.call(menuItem, e, node) === false) {
                        menu.blur();
                    }
                    e.stopPropagation();
                });
            }

            const onMouseEnter = function (e) {
                highlightIndex = index(e.currentTarget, '.azMenuItem');
                navigateMenu();
            };
            menuItem.addEventListener('mouseenter', onMouseEnter);

            return menuItem;
        };

        const onContextMenu =
            function (e) {
                // console.log(e.currentTarget);

                const menu = document.createElement('div');
                me.menu = menu;
                menu.classList.add('azContextMenu');
                menu.style['z-index'] = Number.MAX_SAFE_INTEGER;

                const onKeyDown = e => {
                    e.preventDefault();
                    // console.log(e.keyCode);

                    if (e.keyCode === 27) {
                        // esc
                        menu.blur();
                    } else if (e.keyCode === 38) {
                        // up
                        --highlightIndex;
                        highlightIndex = highlightIndex < 0 ? 0 : highlightIndex;
                        navigateMenu();
                    } else if (e.keyCode === 40) {
                        // down
                        const menuLength = me.menu.querySelectorAll('.azMenuItem').length;
                        // console.log(menuLength);
                        ++highlightIndex;
                        highlightIndex = highlightIndex >= menuLength - 1 ? menuLength - 1 : highlightIndex;
                        // console.log(highlightIndex);
                        navigateMenu();
                    } else if (e.keyCode === 13 || e.keyCode === 32) {
                        // enter
                        const selected = Array.prototype.filter.call(me.menu.children, n => matches(n, '.azMenuItem'))[highlightIndex];
                        // console.log(selected.innerHTML);
                        selected.click();
                    }
                };

                menu.setAttribute('tabindex', 0);
                document.documentElement.appendChild(menu);
                menu.addEventListener('blur', e => {
                    me.dismissMenu(e);
                });
                menu.addEventListener('keydown', onKeyDown);
                menu.focus({
                    preventScroll: true
                });

                // $('<div>&nbsp;</div>').addClass('azMenuIconSeparator').appendTo($menu);

                let items = settings.items;
                if (typeof items === 'function') {
                    items = items();
                }
                items.map(item => {
                    const menuItem = createMenuItem(item, menu)
                    menu.appendChild(menuItem);
                });

                // console.log(getWidth(menu), getHeight(menu));
                const menuPosition = calcMenuPosition(
                    e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY,
                    getWidth(menu), getHeight(menu));
                // console.log(menuPosition);
                menu.style['position'] = 'absolute';
                menu.style['left'] = menuPosition.x + 'px';
                menu.style['top'] = menuPosition.y + 'px';

                if (isTouchDevice()) {
                    document.addEventListener('touchstart', me.dismissMenu, {
                        once: true
                    });
                }

                e.preventDefault(); // prevent browser context menu
            }

        azui.RightClick(node, {
            onRightClick: function (e) {
                onContextMenu(e);
                settings.onRightClick(e);
            },
            onTouchStart: function (e) {
                settings.onTouchStart(e);
            },
            onTouchEnd: function (e) {
                settings.onTouchEnd(e);
            },
        });
    }
};