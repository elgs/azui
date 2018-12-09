import {
    azObj,
    Base
} from '../utilities/core.js';
import * as icons from '../utilities/icons.js';
import {
    isOutside,
    matches,
    parseDOMElement,
    remove,
    siblings,
    isTouchDevice,
    diffPosition,
    diffPositionOut
} from '../utilities/utilities.js';

azui.Window = function (el, options, init) {
    return azObj(Window, el, options, init);
};

class Window extends Base {

    static className = 'Window';

    azInit(options) {
        const settings = Object.assign({
            width: 400,
            height: 300,
            headerHeight: 36,
            icon: icons.svgApps,
            showMinimizeButton: true,
            showMaximizeButton: true,
            showCloseButton: true,
            showSlideButton: true,
            showButtonInDocker: true,
            snapDistance: 8,
            snapGap: 3,
            title: 'Arizona',
        }, options);

        const me = this;
        const node = this.node;
        this.settings = settings;

        if (!settings.showMinimizeButton) {
            settings.showButtonInDocker = false;
        }

        node.style['position'] = 'absolute';

        const dockers = siblings(node, '.azDocker');
        if (dockers.length === 0) {
            const dockerElem = document.createElement('div');
            node.parentNode.appendChild(dockerElem);
            me.docker = azui.Docker(dockerElem, null, true);
        } else {
            const dockerElem = dockers[0];
            me.docker = azui.Docker(dockerElem, null, false);
        }

        this.headerIcons = {};

        const initHeader = function () {
            settings.showSlideButton && addHeaderIcon('slideup', icons.svgArrowUp, 'Hide', false, 'right', me.slideup);
            settings.showSlideButton && addHeaderIcon('slidedown', icons.svgArrowDown, 'Show', true, 'right', me.slidedown);
            settings.showMinimizeButton && addHeaderIcon('minimize', icons.svgWindowMin, 'Minimize', false, 'right', me.minimize);
            (settings.showMinimizeButton || settings.showMaximizeButton) && addHeaderIcon('restore', icons.svgWindowNormal, 'Restore', true, 'right', me.restore);
            settings.showMaximizeButton && addHeaderIcon('maximize', icons.svgWindowMax, 'Maximize', false, 'right', me.maximize);
            settings.showCloseButton && addHeaderIcon('close', icons.svgClose, 'Close', false, 'right', me.close);
        };

        const setHeaderIcon = function (icon) {
            header.querySelector('.left span.icon').innerHTML = icon;
        };

        const setHeaderTitle = function (title) {
            header.querySelector('.left span.title').innerHTML = title;
        };

        const addHeaderIcon = function (key, icon, toolTip, hidden, position, callback) {
            const iconSpan = document.createElement('span');
            iconSpan.classList.add('azHeaderIcon');
            if (hidden) {
                iconSpan.style.display = 'none';
            }
            iconSpan.appendChild(parseDOMElement(icon)[0]);
            iconSpan.addEventListener('click', function (event) {
                if (callback) {
                    callback.call(me, true);
                }
            });
            me.headerIcons[key] = iconSpan;
            header.querySelector('.' + position).appendChild(iconSpan);
        };
        // const removeHeaderIcon = function (key) {
        //     remove(me.headerIcons[key]);
        // };
        // const showHeaderIcon = function (key) {
        //     me.headerIcons[key].style.display = 'inline-block';
        // };
        // const hideHeaderIcon = function (key) {
        //     me.headerIcons[key].style.display = 'none';
        // };

        const content = document.createElement('div');
        content.classList.add('azWindowContent');
        [...node.children].forEach(el => {
            content.appendChild(el);
        });
        node.appendChild(content);

        const header = document.createElement('div');
        header.style['height'] = settings.headerHeight + 'px';
        header.classList.add('azWindowHeader');
        header.appendChild(parseDOMElement('<div class="left"><span class="icon"></span><span class="title"></span></div>')[0]);
        header.appendChild(parseDOMElement('<div class="center"></div>')[0]);
        header.appendChild(parseDOMElement('<div class="right"></div>')[0]);
        setHeaderIcon(settings.icon);
        setHeaderTitle(settings.title);
        // azui.InlineEdit(header.querySelector('.left span.title'));
        initHeader();
        // header.prependTo(node);
        node.insertBefore(header, node.firstChild);

        const mouseDownTouchStartEventListener = function (event) {
            // console.log(event.type);
            me.activate(true);
        };
        me.replaceEventListener('mousedown', 'mousedown', mouseDownTouchStartEventListener);

        if (isTouchDevice()) {
            me.replaceEventListener('touchstart', 'touchstart', mouseDownTouchStartEventListener);
        }

        let pb;

        azui.Resizable(node, {
            minHeight: settings.headerHeight * 2,
            minWidth: 240,
            hideHandles: true,
            start: function (event, ui) {
                pb = node.parentNode.getBoundingClientRect();
            },
            resize: function (event, ui) {
                if (isOutside(event.pageX || event.touches[0].pageX, event.pageY || event.touches[0].pageY, pb)) {
                    return false;
                }
            },
        });

        const snap = (initDiff, dir, coor0, coor1, gap = 0) => {
            if (overlap(initDiff, coor1) && Math.abs(initDiff[dir] + draggable[`mouseD${coor0}`]) < settings.snapDistance) {
                if (draggable[`_snapped${coor0}`]) {
                    if (Math.abs(draggable[`mouse${coor0}`] - draggable[`_mouseSnapped${coor0}`]) > settings.snapDistance * 2) {
                        draggable[`_snapped${coor0}`] = false;
                    } else {
                        draggable[`mouseD${coor0}`] = -initDiff[dir] + gap;
                    }
                } else {
                    draggable[`mouseD${coor0}`] = -initDiff[dir] + gap;
                    draggable[`_snapped${coor0}`] = true;
                    draggable[`_mouseSnapped${coor0}`] = draggable[`mouse${coor0}`];
                }
            }
        };

        const overlap = (initDiff, coor) => {
            let dirs;
            if (coor === 'Y') {
                dirs = ['top', 'bottom']
            } else if (coor === 'X') {
                dirs = ['left', 'right']
            }
            if (!dirs) {
                throw 'Invalid coordinate: ' + coor;
            }

            const d = draggable[`mouseD${coor}`];
            return (initDiff[dirs[0]] + d) * (initDiff[dirs[1]] + d) < 0;

        };

        const draggable = azui.Draggable(node, {
            handle: header,
            create: function (event, ui) {
                const target = event.target;
                pb = node.parentNode.getBoundingClientRect();
                if (matches(target, '.azHeaderIcon,.azHeaderIcon *') || matches(target, 'input')) {
                    return false; // don't drag when clicking on icons
                }
                // else if (matches(target, '.azWindowHeader,.azWindowHeader *')) {
                //     // get focus but prevent mobile view port from moving around
                //     if (event.type === 'touchstart') {
                //         // event.preventDefault();
                //     }
                // }
                draggable._initDiffParent = diffPosition(ui, ui.parentNode);
                // console.log(draggable._initDiffParent);

                draggable._initDiffSiblings = siblings(ui, '.azui').filter(o => {
                    const bcr = o.getBoundingClientRect();
                    return bcr.height > 0 && bcr.width > 0;
                }).map(o => {
                    return diffPositionOut(ui, o);
                });
                // console.log(draggable._initDiffSiblings);
            },
            drag: function (event, ui) {

                if (settings.snapDistance > 0) {
                    // const diffParent = diffPosition(ui, ui.parentNode);
                    snap(draggable._initDiffParent, 'top', 'Y', 'X');
                    snap(draggable._initDiffParent, 'bottom', 'Y', 'X');
                    snap(draggable._initDiffParent, 'left', 'X', 'Y');
                    snap(draggable._initDiffParent, 'right', 'X', 'Y');

                    draggable._initDiffSiblings.map(initDiffSibling => {
                        snap(initDiffSibling, 'top', 'Y', 'X', settings.snapGap);
                        snap(initDiffSibling, 'bottom', 'Y', 'X', -settings.snapGap);
                        snap(initDiffSibling, 'left', 'X', 'Y', settings.snapGap);
                        snap(initDiffSibling, 'right', 'X', 'Y', -settings.snapGap);
                    });
                }

                // console.log(dx, dy);

                if (isOutside(event.touches ? event.touches[0].pageX : event.pageX, event.touches ? event.touches[0].pageY : event.pageY, pb)) {
                    return false;
                }
            },
        });

        azui.DoubleClick(header, {
            onDoubleClick: function (event) {
                // if (!matches(event.target, 'div.azWindowHeader')) {
                // return;
                // }
                const state = me.docked.getAttribute('state');
                if (state === 'normal') {
                    me.maximize();
                } else {
                    me.restore();
                }
            }
        });

        node.style['left'] = me.docker.x + 'px';
        node.style['top'] = me.docker.y + 'px';
        node.style['height'] = settings.height + 'px';
        node.style['width'] = settings.width + 'px';
        node.style['z-index'] = me.docker.z;
        node.style['grid-template-rows'] = `${settings.headerHeight}px 1fr`;
        me.docker.x += settings.headerHeight;
        me.docker.y += settings.headerHeight;

        me.docked = me.docker.dock(node, settings);
        me.dockId = node.getAttribute('az-dock-ref');
        // console.log(me.docked, me.dockId);

        const cm = azui.ContextMenu(header, {
            items: me.docker.getContextMenuItems.call(me.docker, me.dockId, settings),
        });

        me.replaceEventListener('activated', 'activated', e => {
            me.activate(false);
        });
        me.replaceEventListener('inactivated', 'inactivated', e => {
            me.inactivate(false);
        });
        me.replaceEventListener('undocked', 'undocked', e => {
            me.close(false);
        });

        // me.replaceEventListener('minimized', 'minimized', e => {});
        settings.showMaximizeButton && me.replaceEventListener('maximized', 'maximized', e => {
            settings.showSlideButton && (me.headerIcons['slidedown'].style.display = 'none');
            settings.showSlideButton && (me.headerIcons['slideup'].style.display = 'none');
            me.headerIcons['maximize'].style.display = 'none';
            settings.showMinimizeButton && (me.headerIcons['minimize'].style.display = 'inline-block');
            me.headerIcons['restore'].style.display = 'inline-block';
        });
        (settings.showMaximizeButton || settings.showMinimizeButton) && me.replaceEventListener('normalized', 'normalized', e => {
            settings.showSlideButton && (me.headerIcons['slidedown'].style.display = 'none');
            settings.showSlideButton && (me.headerIcons['slideup'].style.display = 'inline-block');
            settings.showMaximizeButton && (me.headerIcons['maximize'].style.display = 'inline-block');
            settings.showMinimizeButton && (me.headerIcons['minimize'].style.display = 'inline-block');
            me.headerIcons['restore'].style.display = 'none';
        });
        settings.showSlideButton && me.replaceEventListener('slidup', 'slidup', e => {
            me.headerIcons['slideup'].style.display = 'none';
            me.headerIcons['slidedown'].style.display = 'inline-block';
            me.node.style.transition = 'all .25s ease-in';
            me.node.style.height = me.settings.headerHeight + 'px';
            setTimeout(() => {
                me.node.style.transition = '';
            }, 250);
        });
        settings.showSlideButton && me.replaceEventListener('sliddown', 'sliddown', e => {
            me.headerIcons['slideup'].style.display = 'inline-block';
            me.headerIcons['slidedown'].style.display = 'none';
        });
    }

    children() {
        const children = this.node.querySelectorAll('.azWindowContent>.azWindow');
        return [...children].map(el => {
            return azui.Window(el);
        });
    }

    activate(notify) {
        // two way notification
        const me = this;
        siblings(me.node, '.azWindow').forEach(el => {
            el.classList.remove('active');
            el.classList.add('inactive');
        });

        this.node.classList.remove('inactive');
        this.node.classList.add('active');

        me.node.style['z-index'] = ++me.docker.z;

        if (notify) {
            me.docker.activate(this.dockId, false);
        }
    }

    inactivate(notify) {
        // two way notification
        const me = this;
        this.node.classList.remove('active');
        this.node.classList.add('inactive');
        if (notify) {
            me.docker.inactivate(this.dockId, false);
        }
    }

    close(notify) {
        // two way notification
        const me = this;
        this.children().forEach(child => {
            child.docker.undock(child.dockId, true);
        });
        remove(this.node);
        if (notify) {
            me.docker.undock(this.dockId, false);
        }
    }

    slideup() {
        this.docker.slideup(this.dockId, true);
    }

    slidedown() {
        this.docker.slidedown(this.dockId, true);
    }

    minimize() {
        this.docker.minimize(this.dockId, true);
    }

    maximize() {
        this.docker.maximize(this.dockId, true);
    }

    restore() {
        this.docker.normalize(this.dockId, true);
    }
};