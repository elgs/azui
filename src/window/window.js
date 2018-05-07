import {
    Base
} from '../utilities/core.js';

import {
    isOutside,
    remove,
    normalizeIcon,
    parseDOMElement,
    matches,
    position,
} from '../utilities/utilities.js';

import * as icons from '../utilities/icons.js';

azui.Window = function (el, options) {
    return new Window(el, options);
};

class Window extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({
            width: 400,
            height: 300,
            headerHeight: 30,
            icon: icons.svgApps,
            title: 'Arizona',
            docker: false,
            slideup: function (event, widget) {},
            slidedown: function (event, widget) {},
            minimize: function (event, widget) {},
            maximize: function (event, widget) {},
            restore: function (event, widget) {},
            close: function (event, widget) {},
            // add: function (event, widget) {
            //     const newWindow = document.createElement('div');
            //     widget.querySelector('.azWindowContent').appendChild(newWindow);
            //     azui.Window(newWindow, {
            //         width: '240px',
            //         height: '180px',
            //     });
            // },
            // extIcons: [{
            //     key: 'add',
            //     icon: '+',
            //     toolTip: 'Add',
            //     hidden: true,
            //     position: 'center',
            // }]
        }, options);

        const self = this;
        const node = this.node;
        node.classList.add('azWindow');

        node.style['position'] = 'absolute';

        // stored states
        const ss = {
            state: 'normal',
        };

        const storeStates = function () {
            if (ss.state !== 'normal') {
                return;
            }
            ss.height = node.clientHeight;
            ss.width = node.clientWidth;
            ss.x = node.offsetLeft;
            ss.y = node.offsetTop;
        };

        const slideup = function () {
            // console.log('hidden');
            hideHeaderIcon('slideup');
            showHeaderIcon('slidedown');
            storeStates();
            // console.log(ss);
            ss.state = 'hidden';
            node.style.transition = 'all .2s ease-in';
            node.style.height = settings.headerHeight + 'px';
            setTimeout(() => {
                node.style.transition = '';
            }, 200);
        };
        const slidedown = function () {
            // console.log('shown');
            ss.state = 'normal';
            hideHeaderIcon('slidedown');
            showHeaderIcon('slideup');
            // console.log(ss);
            node.style.transition = 'all .2s ease-in';
            node.style.height = ss.height + 'px';
            setTimeout(() => {
                node.style.transition = '';
            }, 200);
        };
        const minimize = function () {
            // console.log(node.parentNode);
            hideHeaderIcon('slidedown');
            hideHeaderIcon('slideup');
            showHeaderIcon('maximize');
            hideHeaderIcon('minimize');
            showHeaderIcon('restore');
            storeStates();
            ss.state = 'minimized';
            node.style.transition = 'all 2s ease-in';
            node.style.bottom = 0;
            node.style.left = 0;
            node.style.height = settings.headerHeight + 'px';
            node.style.width = '240px';
            node.style.top = '';
            setTimeout(() => {
                node.style.transition = '';
            }, 2000);
            // console.log('minimized');
        };
        const maximize = function () {
            hideHeaderIcon('slidedown');
            hideHeaderIcon('slideup');
            hideHeaderIcon('maximize');
            showHeaderIcon('minimize');
            showHeaderIcon('restore');
            storeStates();
            ss.state = 'maximized';

            node.style.transition = 'all .2s ease-in';
            node.style.left = 0;
            node.style.top = 0;
            node.style.bottom = '';
            node.style.height = '100%';
            node.style.width = '100%';
            setTimeout(() => {
                node.style.transition = '';
            }, 200);
            // console.log('maximized');
        };
        const restore = function () {
            ss.state = 'normal';
            hideHeaderIcon('slidedown');
            showHeaderIcon('slideup');
            showHeaderIcon('maximize');
            showHeaderIcon('minimize');
            hideHeaderIcon('restore');

            node.style.top = position(node).top + 'px';
            node.style.transition = 'all 2s ease-in';
            setTimeout(() => {
                node.style.left = ss.x + 'px';
                node.style.top = ss.y + 'px';
                node.style.bottom = '';
                node.style.height = ss.height + 'px';
                node.style.width = ss.width + 'px';
                setTimeout(() => {
                    node.style.transition = '';
                }, 2000);
            });
            // console.log('restored');
        };
        const close = function () {
            // console.log('closed');
            ss.state = 'closed';
            remove(node);
        };

        const initHeader = function () {
            // ↓↑_▫□×
            addHeaderIcon('slideup', icons.svgArrowUp, 'Hide', false, 'right', slideup);
            addHeaderIcon('slidedown', icons.svgArrowDown, 'Show', true, 'right', slidedown);
            addHeaderIcon('minimize', icons.svgWindowMin, 'Minimize', false, 'right', minimize);
            addHeaderIcon('restore', icons.svgWindowNormal, 'Restore', true, 'right', restore);
            addHeaderIcon('maximize', icons.svgWindowMax, 'Maximize', false, 'right', maximize);
            addHeaderIcon('close', icons.svgClose, 'Close', false, 'right', close);

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
                if (settings[key].call(node, event, node) !== false && callback) {
                    callback.call(node);
                }
            });
            headerIcons[key] = iconSpan;
            header.querySelector('.' + position).appendChild(iconSpan);
        };
        const removeHeaderIcon = function (key) {
            remove(headerIcons[key]);
        };
        const showHeaderIcon = function (key) {
            headerIcons[key].style.display = 'inline-block';
        };
        const hideHeaderIcon = function (key) {
            headerIcons[key].style.display = 'none';
        };

        const increaseZ = function (win) {
            _z = win.parentNode.getAttribute('_azWindowZ') * 1;
            win.style['z-index'] = ++_z;
            win.parentNode.setAttribute('_azWindowZ', _z);
        };

        const headerIcons = {};

        let _x = settings.x || node.parentNode.getAttribute('_azWindowX') * 1 || settings.headerHeight;
        let _y = settings.y || node.parentNode.getAttribute('_azWindowY') * 1 || settings.headerHeight;
        let _z = node.parentNode.getAttribute('_azWindowZ') * 1 || 0;

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
        azui.InlineEdit(header.querySelector('.left span.title'));
        initHeader();
        // header.prependTo(node);
        node.insertBefore(header, node.firstChild);

        const mouseDownTouchStartEventListener = function (event) {
            increaseZ(node);
        };
        node.addEventListener('mousedown', mouseDownTouchStartEventListener);
        node.addEventListener('touchstart', mouseDownTouchStartEventListener);

        let pb;

        azui.Resizable(node, {
            minHeight: settings.headerHeight * 2,
            minWidth: 240,
            start: function (event, ui) {
                pb = node.parentNode.getBoundingClientRect();
            },
            resize: function (event, ui) {
                if (isOutside(event.clientX || event.touches[0].clientX, event.clientY || event.touches[0].clientY, pb)) {
                    return false;
                }
            },
        });
        azui.Draggable(node, {
            handle: header,
            create: function (event, ui) {
                const target = event.target;
                pb = node.parentNode.getBoundingClientRect();
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
                if (isOutside(event.clientX || event.touches[0].clientX, event.clientY || event.touches[0].clientY, pb)) {
                    return false;
                }
            },
        });

        azui.DoubleClick(header, {
            onDoubleClick: function (event) {
                if (!matches(event.target, 'div.azWindowHeader')) {
                    return;
                }
                if (ss.state === 'normal') {
                    maximize();
                } else {
                    restore();
                }
            }
        });

        node.style['left'] = _x + 'px';
        node.style['top'] = _y + 'px';
        node.style['height'] = settings.height + 'px';
        node.style['width'] = settings.width + 'px';
        node.style['z-index'] = _z;
        node.style['grid-template-rows'] = `${settings.headerHeight}px 1fr`;
        node.parentNode.setAttribute('_azWindowX', _x * 1 + settings.headerHeight);
        node.parentNode.setAttribute('_azWindowY', _y * 1 + settings.headerHeight);
        node.parentNode.setAttribute('_azWindowZ', _z + 1);

        if (settings.docker) {
            const activated = function (e) {
                // console.log(e.target, 'activated');
                e.target.classList.add('active');
            };

            const inactivated = function (e) {
                // console.log(e.target, 'inactivated');
                e.target.classList.remove('active');
            };

            const d0 = settings.docker.dock(node, settings.icon, settings.title);

            node.addEventListener('activated', activated);
            node.addEventListener('inactivated', inactivated);
        }
    }
};