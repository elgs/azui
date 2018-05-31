import {
    Base
} from '../utilities/core.js';

import {
    resolveDOM,
    getHeight,
} from '../utilities/utilities.js';

azui.Layout = function (el, options) {
    return new Layout(el, options);
};

class Layout extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({
            north: undefined,
            east: undefined,
            south: undefined,
            west: undefined,
            center: undefined, // must
        }, options);

        const node = this.node;
        const self = this;
        node.classList.add('azLayout');

        self.north = resolveDOM(settings.north);
        self.east = resolveDOM(settings.east);
        self.south = resolveDOM(settings.south);
        self.west = resolveDOM(settings.west);
        self.center = resolveDOM(settings.center);

        let centerWidth, centerHeight;
        if (self.north) {
            self.north.classList.add('azLayoutArea', 'azLayoutAreaNorth');
            azui.Resizable(self.north, {
                handles: 's',
                handleDirection: 'in',
                start: function (e, h) {
                    centerHeight = parseInt(getComputedStyle(self.center).height);
                },
                resize: function (e, h, by) {
                    if (getHeight(self.north) <= 0) {
                        return;
                    }
                    by.dy = Math.min(by.dy, centerHeight);
                    self.center.style.height = centerHeight - by.dy + 'px';
                    self.west.style.height = centerHeight - by.dy + 'px';
                    self.east.style.height = centerHeight - by.dy + 'px';
                },
            });
        }
        if (self.east) {
            self.east.classList.add('azLayoutArea', 'azLayoutAreaEast');
            azui.Resizable(self.east, {
                handles: 'w',
                moveOnResize: false,
                handleDirection: 'in',
                start: function (e, h) {
                    centerWidth = parseInt(getComputedStyle(self.center).width);
                    centerHeight = parseInt(getComputedStyle(self.center).height);
                    self.east.style.height = centerHeight + 'px';
                },
                resize: function (e, h, by) {
                    by.dx = Math.max(by.dx, -centerWidth);
                },
            });
        }
        if (self.south) {
            self.south.classList.add('azLayoutArea', 'azLayoutAreaSouth');
            azui.Resizable(self.south, {
                handles: 'n',
                moveOnResize: false,
                handleDirection: 'in',
                start: function (e, h) {
                    centerHeight = parseInt(getComputedStyle(self.center).height);
                },
                resize: function (e, h, by) {
                    if (getHeight(self.south) <= 0) {
                        return;
                    }
                    by.dy = Math.max(by.dy, -centerHeight);
                    self.center.style.height = centerHeight + by.dy + 'px';
                    self.west.style.height = centerHeight + by.dy + 'px';
                    self.east.style.height = centerHeight + by.dy + 'px';
                },
            });
        }
        if (self.west) {
            self.west.classList.add('azLayoutArea', 'azLayoutAreaWest');
            azui.Resizable(self.west, {
                handles: 'e',
                handleDirection: 'in',
                start: function (e, h) {
                    centerWidth = parseInt(getComputedStyle(self.center).width);
                    centerHeight = parseInt(getComputedStyle(self.center).height);
                    self.west.style.height = centerHeight + 'px';
                },
                resize: function (e, h, by) {
                    by.dx = Math.min(by.dx, centerWidth);
                },
            });
        }
        if (self.center) {
            self.center.classList.add('azLayoutArea', 'azLayoutAreaCenter');
        }

        // console.log(self.north, self.east, self.south, self.west, self.center);
    }
};