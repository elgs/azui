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
    siblings
} from '../utilities/utilities.js';

azui.Window = function (el, options) {
    // return new Window(el, options);
    return azObj(Window, el, options);
};

class Window extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({
            width: 400,
            height: 300,
            headerHeight: 36,
            icon: icons.svgApps,
            title: 'Arizona',
        }, options);

        const self = this;
        const node = this.node;
        this.settings = settings;

        node.classList.add('azWindow');
        node.style['position'] = 'absolute';

        // this.windowId = randGen(8);
        // node.setAttribute('az-window-id', this.windowId);
        // registerObject(this.windowId, this);

        const dockers = siblings(node, '.azDocker');
        if (dockers.length === 0) {
            const dockerElem = document.createElement('div');
            node.parentNode.appendChild(dockerElem);
            this.docker = azui.Docker(dockerElem);
        } else {
            const dockerElem = dockers[0];
            // const dockerId = dockerElem.getAttribute('az-docker-id');
            // this.docker = getObject(dockerId);
            this.docker = azui.Docker(dockerElem);
        }

        this.headerIcons = {};

        const initHeader = function () {
            addHeaderIcon('slideup', icons.svgArrowUp, 'Hide', false, 'right', self.slideup);
            addHeaderIcon('slidedown', icons.svgArrowDown, 'Show', true, 'right', self.slidedown);
            addHeaderIcon('minimize', icons.svgWindowMin, 'Minimize', false, 'right', self.minimize);
            addHeaderIcon('restore', icons.svgWindowNormal, 'Restore', true, 'right', self.restore);
            addHeaderIcon('maximize', icons.svgWindowMax, 'Maximize', false, 'right', self.maximize);
            addHeaderIcon('close', icons.svgClose, 'Close', false, 'right', self.close);

            // settings.extIcons.map(icon => {
            //     addHeaderIcon(icon.key, icon.icon, icon.toolTip, icon.hidden, icon.position, icon.callback);
            // });
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
                    callback.call(self, true);
                }
            });
            self.headerIcons[key] = iconSpan;
            header.querySelector('.' + position).appendChild(iconSpan);
        };
        // const removeHeaderIcon = function (key) {
        //     remove(self.headerIcons[key]);
        // };
        // const showHeaderIcon = function (key) {
        //     self.headerIcons[key].style.display = 'inline-block';
        // };
        // const hideHeaderIcon = function (key) {
        //     self.headerIcons[key].style.display = 'none';
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
            self.activate(true);
        };
        node.addEventListener('mousedown', mouseDownTouchStartEventListener);
        node.addEventListener('touchstart', mouseDownTouchStartEventListener);

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
        azui.Draggable(node, {
            handle: header,
            create: function (event, ui) {
                const target = event.target;
                // pb = node.parentNode.getBoundingClientRect();
                if (matches(target, '.azHeaderIcon,.azHeaderIcon *') || matches(target, 'input')) {
                    return false; // don't drag when clicking on icons
                } else if (matches(target, '.azWindowHeader,.azWindowHeader *')) {
                    // get focus but prevent mobile view port from moving around
                    if (event.type === 'touchstart') {
                        event.preventDefault();
                    }
                }
            },
            drag: function (event, ui) {
                // if (isOutside(event.pageX || event.touches[0].pageX, event.pageY || event.touches[0].pageY, pb)) {
                // return false;
                // }
            },
        });

        azui.DoubleClick(header, {
            onDoubleClick: function (event) {
                if (!matches(event.target, 'div.azWindowHeader')) {
                    return;
                }
                const state = self.docked.getAttribute('state');
                if (state === 'normal') {
                    self.maximize();
                } else {
                    self.restore();
                }
            }
        });

        node.style['left'] = self.docker.x + 'px';
        node.style['top'] = self.docker.y + 'px';
        node.style['height'] = settings.height + 'px';
        node.style['width'] = settings.width + 'px';
        node.style['z-index'] = self.docker.z;
        node.style['grid-template-rows'] = `${settings.headerHeight}px 1fr`;
        self.docker.x += settings.headerHeight;
        self.docker.y += settings.headerHeight;

        this.docked = self.docker.dock(node, settings.icon, settings.title);
        this.dockId = node.getAttribute('az-dock-ref');
        // console.log(this.dockId);

        const cm = azui.ContextMenu(header, {
            items: self.docker.getContextMenuItems.call(self.docker, self.dockId),
        });

        node.addEventListener('activated', e => {
            self.activate(false);
        });
        node.addEventListener('inactivated', e => {
            self.inactivate(false);
        });
        node.addEventListener('undocked', e => {
            self.close(false);
        });

        node.addEventListener('minimized', e => {});
        node.addEventListener('maximized', e => {
            self.headerIcons['slidedown'].style.display = 'none';
            self.headerIcons['slideup'].style.display = 'none';
            self.headerIcons['maximize'].style.display = 'none';
            self.headerIcons['minimize'].style.display = 'inline-block';
            self.headerIcons['restore'].style.display = 'inline-block';
        });
        node.addEventListener('normalized', e => {
            self.headerIcons['slidedown'].style.display = 'none';
            self.headerIcons['slideup'].style.display = 'inline-block';
            self.headerIcons['maximize'].style.display = 'inline-block';
            self.headerIcons['minimize'].style.display = 'inline-block';
            self.headerIcons['restore'].style.display = 'none';
        });
        node.addEventListener('slidup', e => {
            self.headerIcons['slideup'].style.display = 'none';
            self.headerIcons['slidedown'].style.display = 'inline-block';
            self.node.style.transition = 'all .25s ease-in';
            self.node.style.height = self.settings.headerHeight + 'px';
            setTimeout(() => {
                self.node.style.transition = '';
            }, 250);
        });
        node.addEventListener('sliddown', e => {
            self.headerIcons['slideup'].style.display = 'inline-block';
            self.headerIcons['slidedown'].style.display = 'none';
        });
    }

    children() {
        const children = this.node.querySelectorAll('.azWindowContent>.azWindow');
        return [...children].map(el => {
            // const windowId = el.getAttribute('az-window-id');
            // return getObject(windowId);
            return azui.Window(el);
        });
    }

    activate(notify) {
        // two way notification
        const self = this;
        siblings(self.node, '.azWindow').forEach(el => {
            el.classList.remove('active');
            el.classList.add('inactive');
        });

        this.node.classList.remove('inactive');
        this.node.classList.add('active');

        self.node.style['z-index'] = ++self.docker.z;

        if (notify) {
            this.docker.activate(this.dockId, false);
        }
    }

    inactivate(notify) {
        // two way notification
        this.node.classList.remove('active');
        this.node.classList.add('inactive');
        if (notify) {
            this.docker.inactivate(this.dockId, false);
        }
    }

    close(notify) {
        // two way notification
        const self = this;
        this.children().forEach(child => {
            child.docker.undock(child.dockId, true);
        });
        remove(this.node);
        // console.log(getObject(this.windowId));
        // removeObject(this.windowId);
        // console.log(getObject(this.windowId));
        if (notify) {
            this.docker.undock(this.dockId, false);
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