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
        }, options);

        const node = this.node;
        const me = this;
        node.classList.add('azLayout');

        const northContent = resolveDOM(settings.north);
        const eastContent = resolveDOM(settings.east);
        const southContent = resolveDOM(settings.south);
        const westContent = resolveDOM(settings.west);
        const centerContent = resolveDOM(settings.center);

        let centerWidth, centerHeight;
        if (northContent) {
            const north = document.createElement('div');
            north.classList.add('azLayoutArea', 'azLayoutAreaNorth');
            me.node.appendChild(north);
            me.north = north;
            azui.Resizable(me.north, {
                handles: 's',
                create: function (e, h) {
                    centerHeight = getHeight(me.center);
                },
                resize: function (e, h, by) {
                    if (getHeight(me.north) <= 0) {
                        return;
                    }
                    by.dy = Math.min(by.dy, centerHeight);
                },
            });
            north.appendChild(northContent);
        }
        if (eastContent) {
            const east = document.createElement('div');
            east.classList.add('azLayoutArea', 'azLayoutAreaEast');
            me.node.appendChild(east);
            me.east = east;
            azui.Resizable(me.east, {
                handles: 'w',
                moveOnResize: false,
                create: function (e, h) {
                    centerWidth = getWidth(me.center);
                },
                resize: function (e, h, by) {
                    by.dx = Math.max(by.dx, -centerWidth);
                },
            });
            east.appendChild(eastContent);
        }
        if (southContent) {
            const south = document.createElement('div');
            south.classList.add('azLayoutArea', 'azLayoutAreaSouth');
            me.node.appendChild(south);
            me.south = south;
            azui.Resizable(me.south, {
                handles: 'n',
                moveOnResize: false,
                create: function (e, h) {
                    centerHeight = getHeight(me.center);
                },
                resize: function (e, h, by) {
                    if (getHeight(me.south) <= 0) {
                        return;
                    }
                    by.dy = Math.max(by.dy, -centerHeight);
                },
            });
            south.appendChild(southContent);
        }
        if (westContent) {
            const west = document.createElement('div');
            west.classList.add('azLayoutArea', 'azLayoutAreaWest');
            me.node.appendChild(west);
            me.west = west;
            azui.Resizable(me.west, {
                handles: 'e',
                create: function (e, h) {
                    centerWidth = getWidth(me.center);
                },
                resize: function (e, h, by) {
                    by.dx = Math.min(by.dx, centerWidth);
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