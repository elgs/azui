import {
    azObj,
    Base
} from '../utilities/core.js';
import {
    getHeight,
    getWidth,
    resolveDOM
} from '../utilities/utilities.js';

azui.Layout = function (el, options, init) {
    return azObj(Layout, el, options, init);
};

class Layout extends Base {

    static className = 'Layout';

    azInit(options) {
        const settings = Object.assign({
            north: '.azLayoutNorth',
            east: '.azLayoutEast',
            south: '.azLayoutSouth',
            west: '.azLayoutWest',
            center: '.azLayoutCenter',
            northHeight: '50px',
            southHeight: '50px',
            westWidth: '100px',
            eastWidth: '100px',
            hideCollapseButton: true,
        }, options);

        const node = this.node;
        const me = this;

        const northContent = resolveDOM(settings.north);
        const eastContent = resolveDOM(settings.east);
        const southContent = resolveDOM(settings.south);
        const westContent = resolveDOM(settings.west);
        const centerContent = resolveDOM(settings.center);

        let centerWidth, centerHeight;
        if (northContent) {
            const north = document.createElement('div');
            north.classList.add('azLayoutArea', 'azLayoutAreaNorth');
            north.style.height = settings.northHeight;
            me.node.appendChild(north);
            me.north = north;
            azui.Resizable(me.north, {
                handles: 's',
                hideCollapseButton: settings.hideCollapseButton,
                create: function (e, h) {
                    centerHeight = getHeight(me.center);
                    centerContent.querySelector('iframe').style['pointer-events'] = 'none';
                },
                resize: function (e, h, by) {
                    by.dy = Math.min(by.dy, centerHeight);
                },
                stop: function (e, el) {
                    centerContent.querySelector('iframe').style['pointer-events'] = '';
                },
            });
            north.appendChild(northContent);
        }
        if (eastContent) {
            const east = document.createElement('div');
            east.classList.add('azLayoutArea', 'azLayoutAreaEast');
            east.style.width = settings.eastWidth;
            me.node.appendChild(east);
            me.east = east;
            azui.Resizable(me.east, {
                handles: 'w',
                hideCollapseButton: settings.hideCollapseButton,
                moveOnResize: false,
                create: function (e, h) {
                    centerWidth = getWidth(me.center);
                    centerContent.querySelector('iframe').style['pointer-events'] = 'none';
                },
                resize: function (e, h, by) {
                    by.dx = Math.max(by.dx, -centerWidth);
                },
                stop: function (e, el) {
                    centerContent.querySelector('iframe').style['pointer-events'] = '';
                },
            });
            east.appendChild(eastContent);
        }
        if (southContent) {
            const south = document.createElement('div');
            south.classList.add('azLayoutArea', 'azLayoutAreaSouth');
            south.style.height = settings.southHeight;
            me.node.appendChild(south);
            me.south = south;
            azui.Resizable(me.south, {
                handles: 'n',
                hideCollapseButton: settings.hideCollapseButton,
                moveOnResize: false,
                create: function (e, h) {
                    centerHeight = getHeight(me.center);
                    centerContent.querySelector('iframe').style['pointer-events'] = 'none';
                },
                resize: function (e, h, by) {
                    by.dy = Math.max(by.dy, -centerHeight);
                },
                stop: function (e, el) {
                    centerContent.querySelector('iframe').style['pointer-events'] = '';
                },
            });
            south.appendChild(southContent);
        }
        if (westContent) {
            const west = document.createElement('div');
            west.classList.add('azLayoutArea', 'azLayoutAreaWest');
            west.style.width = settings.westWidth;
            me.node.appendChild(west);
            me.west = west;
            azui.Resizable(me.west, {
                handles: 'e',
                hideCollapseButton: settings.hideCollapseButton,
                create: function (e, h) {
                    centerWidth = getWidth(me.center);
                    centerContent.querySelector('iframe').style['pointer-events'] = 'none';
                },
                resize: function (e, h, by) {
                    by.dx = Math.min(by.dx, centerWidth);
                },
                stop: function (e, el) {
                    centerContent.querySelector('iframe').style['pointer-events'] = '';
                },
            });
            west.appendChild(westContent);
        }
        if (centerContent) {
            const center = document.createElement('div');
            center.classList.add('azLayoutArea', 'azLayoutAreaCenter');
            me.node.appendChild(center);
            me.center = center;
            center.appendChild(centerContent);
        }

        // console.log(me.north, me.east, me.south, me.west, me.center);
    }
};