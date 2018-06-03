import {
    Base
} from '../utilities/core.js';

import {
    resolveDOM,
    getHeight,
    getWidth,
    setHeight,
} from '../utilities/utilities.js';

azui.Layout = function (el, options) {
    return new Layout(el, options);
};

class Layout extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({
            north: '.azLayoutNorth',
            east: '.azLayoutEast',
            south: '.azLayoutSouth',
            west: '.azLayoutWest',
            center: '.azLayoutCenter',
        }, options);

        const node = this.node;
        const self = this;
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
            self.node.appendChild(north);
            self.north = north;
            azui.Resizable(self.north, {
                handles: 's',
                create: function (e, h) {
                    centerHeight = getHeight(self.center);
                },
                resize: function (e, h, by) {
                    if (getHeight(self.north) <= 0) {
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
            self.node.appendChild(east);
            self.east = east;
            azui.Resizable(self.east, {
                handles: 'w',
                moveOnResize: false,
                create: function (e, h) {
                    centerWidth = getWidth(self.center);
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
            self.node.appendChild(south);
            self.south = south;
            azui.Resizable(self.south, {
                handles: 'n',
                moveOnResize: false,
                create: function (e, h) {
                    centerHeight = getHeight(self.center);
                },
                resize: function (e, h, by) {
                    if (getHeight(self.south) <= 0) {
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
            self.node.appendChild(west);
            self.west = west;
            azui.Resizable(self.west, {
                handles: 'e',
                create: function (e, h) {
                    centerWidth = getWidth(self.center);
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
            self.node.appendChild(center);
            self.center = center;
            center.appendChild(centerContent);
        }

        // console.log(self.north, self.east, self.south, self.west, self.center);
    }
};