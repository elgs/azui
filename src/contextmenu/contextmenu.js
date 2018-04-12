import {
    Base
} from '../utilities/core.js';

import {
    isOutside,
    calcMenuPosition,
    parseDOMElement,
    getWidth,
    getHeight,
    normalizeIcon,
} from '../utilities/utilities.js';

azui.ContextMenu = function (el, options) {
    return new ContextMenu(el, options);
};

class ContextMenu extends Base {
    constructor(el, options) {
        super(el, options);
        const settings = Object.assign({
            items: []
        }, options);

        for (const node of this.nodeList) {
            const self = node;

            let mx, my = 0;
            const mousePositionTracker = function (e) {
                mx = e.clientX || e.touches[0].clientX;
                my = e.clientY || e.touches[0].clientY;
            };

            const blurFocusDetector = function (e) {
                mousePositionTracker(e);
                document.querySelectorAll('.azMenuFocusDetector').forEach(function (el) {
                    el.blur();
                });
            };

            const onContextMenu = function (e) {
                // console.log(e.currentTarget);

                const createMenuItem = function (item) {
                    if (!item) {
                        const separator = parseDOMElement('<div>&nbsp;</div>')[0];
                        separator.classList.add('azMenuSeparator');
                        return separator;
                    }
                    let icon = item.icon;
                    let title = item.title;
                    icon = normalizeIcon(icon);
                    title = normalizeIcon(title);
                    const iconDiv = document.createElement('div');
                    iconDiv.classList.add('icon');
                    const titleDiv = document.createElement('div');
                    titleDiv.classList.add('title')
                    const menuItem = document.createElement('div');
                    menuItem.classList.add('azMenuItem');
                    menuItem.appendChild(iconDiv);
                    menuItem.appendChild(titleDiv);
                    iconDiv.appendChild(icon);
                    titleDiv.appendChild(title);
                    menuItem.addEventListener('click', function (e) {
                        if (item.action.call(menuItem, e, self) === false) {
                            document.removeEventListener('mousemove', mousePositionTracker);
                            document.removeEventListener('touchstart', blurFocusDetector);
                            menu.parentNode.removeChild(menu);
                        } else {
                            focusDetector.focus();
                        }
                        e.stopPropagation();
                    });
                    return menuItem;
                };

                const menu = document.createElement('div');
                menu.classList.add('azContextMenu');
                menu.style['display'] = 'none';
                menu.style['z-index'] = 1000;
                document.documentElement.appendChild(menu);

                // $('<div>&nbsp;</div>').addClass('azMenuIconSeparator').appendTo($menu);

                if (typeof settings.items === 'function') {
                    settings.items = settings.items();
                }
                settings.items.map(item => {
                    const menuItem = createMenuItem(item)
                    menu.appendChild(menuItem);
                });
                const menuPosition = calcMenuPosition(e.clientX || e.touches[0].pageX, e.clientY || e.touches[0].pageY, getWidth(menu), getHeight(menu));
                menu.style['left'] = menuPosition.x;
                menu.style['top'] = menuPosition.y;
                menu.style['display'] = 'block';

                document.addEventListener('mousemove', mousePositionTracker);
                document.addEventListener('touchstart', blurFocusDetector);

                const focusDetector = parseDOMElement('<input class="azMenuFocusDetector" type="checkbox">')[0];
                focusDetector.style['position'] = 'absolute';
                focusDetector.style['z-index'] = -1000;
                focusDetector.style['opacity'] = 0;
                menu.appendChild(focusDetector);
                focusDetector.focus();
                focusDetector.addEventListener('blur', function (e1) {
                    const pb = menu.getBoundingClientRect();
                    if (isOutside(mx, my, pb)) {
                        document.removeEventListener('mousemove', mousePositionTracker);
                        document.removeEventListener('touchstart', blurFocusDetector);
                        menu.remove();
                    } else {
                        focusDetector.focus();
                    }
                });
                e.preventDefault(); // prevent browser context menu
            }

            azui.RightClick(self, {
                onRightClick: onContextMenu,
                onTouchStart: blurFocusDetector,
            });
        }
    }
};