import {
    azObj,
    Base
} from '../utilities/core.js';
import {
    calcMenuPosition,
    getHeight,
    getWidth,
    isOutside,
    normalizeIcon,
    parseDOMElement,
    isTouchDevice
} from '../utilities/utilities.js';


azui.ContextMenu = function (el, options, init) {
    return azObj(ContextMenu, el, options, init);
};

class ContextMenu extends Base {
    azInit(options) {
        const settings = Object.assign({
            onRightClick: function (e) {},
            onTouchStart: function (e) {},
            onTouchEnd: function (e) {},
            items: []
        }, options);

        const me = this;
        const node = this.node;

        this.on = false;
        let mx, my = 0;
        const mousePositionTracker = function (e) {
            mx = e.pageX || e.touches[0].pageX;
            my = e.pageY || e.touches[0].pageY;
        };

        const blurFocusDetector = function (e) {
            mousePositionTracker(e);
            document.querySelectorAll('.azMenuFocusDetector').forEach(function (el) {
                el.blur();
            });
        };

        const onContextMenu = function (e) {
            // console.log(e.currentTarget);

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
                    menuItem.addEventListener('click', function (e) {
                        if (item.action.call(menuItem, e, node) === false) {
                            document.removeEventListener('mousemove', mousePositionTracker);
                            document.removeEventListener('touchstart', blurFocusDetector);
                            menu.parentNode.removeChild(menu);
                            me.on = false;
                            // alert('off');
                        } else {
                            focusDetector.focus();
                        }
                        e.stopPropagation();
                    });
                }
                return menuItem;
            };

            const menu = document.createElement('div');
            menu.classList.add('azContextMenu');
            menu.style['visibility'] = 'hidden';
            menu.style['z-index'] = Number.MAX_SAFE_INTEGER;
            document.documentElement.appendChild(menu);

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
            const menuPosition = calcMenuPosition(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, getWidth(menu), getHeight(menu));
            // console.log(menuPosition);
            menu.style['position'] = 'absolute';
            menu.style['left'] = menuPosition.x + 'px';
            menu.style['top'] = menuPosition.y + 'px';
            menu.style['visibility'] = 'visible';

            document.addEventListener('mousemove', mousePositionTracker);
            if (isTouchDevice()) {
                document.addEventListener('touchstart', blurFocusDetector);
            }

            const focusDetector = parseDOMElement('<input class="azMenuFocusDetector" type="checkbox">')[0];
            focusDetector.style['position'] = 'absolute';
            focusDetector.style['z-index'] = -1000;
            focusDetector.style['top'] = 0;
            focusDetector.style['left'] = 0;
            focusDetector.style['opacity'] = 0;
            menu.appendChild(focusDetector);
            focusDetector.focus();
            me.on = true;
            // alert('on');
            focusDetector.addEventListener('blur', function (e1) {
                const pb = menu.getBoundingClientRect();
                if (isOutside(mx, my, pb)) {
                    document.removeEventListener('mousemove', mousePositionTracker);
                    document.removeEventListener('touchstart', blurFocusDetector);
                    menu.remove();
                    me.on = false;
                    // alert('off 0');
                } else {
                    focusDetector.focus();
                }
            });
            e.preventDefault(); // prevent browser context menu
        }

        azui.RightClick(node, {
            onRightClick: function (e) {
                onContextMenu(e);
                settings.onRightClick(e);
            },
            onTouchStart: function (e) {
                blurFocusDetector(e);
                settings.onTouchStart(e);
            },
            onTouchEnd: function (e) {
                settings.onTouchEnd(e);
            },
        });
    }
};