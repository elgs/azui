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
                start: function (e, h) {
                    centerHeight = getHeight(self.center);
                },
                resize: function (e, h, by) {
                    if (getHeight(self.north) <= 0) {
                        return;
                    }
                    by.dy = Math.min(by.dy, centerHeight);
                    setHeight(self.center, centerHeight - by.dy);
                    setHeight(self.east, centerHeight - by.dy);
                    setHeight(self.west, centerHeight - by.dy);
                },
                collapse: function (e, ui, wh) {
                    centerHeight = getHeight(self.center);

                    setHeight(self.center, centerHeight + wh);
                    setHeight(self.east, centerHeight + wh);
                    setHeight(self.west, centerHeight + wh);
                    // console.log(this, e, ui, wh);
                },
            });
        }
        if (self.east) {
            self.east.classList.add('azLayoutArea', 'azLayoutAreaEast');
            azui.Resizable(self.east, {
                handles: 'w',
                moveOnResize: false,
                start: function (e, h) {
                    centerWidth = getWidth(self.center);
                    centerHeight = getHeight(self.center);
                    setHeight(self.center, centerHeight);
                    setHeight(self.east, centerHeight);
                    setHeight(self.west, centerHeight);
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
                start: function (e, h) {
                    centerHeight = getHeight(self.center);
                },
                resize: function (e, h, by) {
                    if (getHeight(self.south) <= 0) {
                        return;
                    }
                    by.dy = Math.max(by.dy, -centerHeight);
                    setHeight(self.center, centerHeight + by.dy);
                    setHeight(self.east, centerHeight + by.dy);
                    setHeight(self.west, centerHeight + by.dy);
                },
                collapse: function (e, ui, wh) {
                    centerHeight = getHeight(self.center);

                    setHeight(self.center, centerHeight + wh);
                    setHeight(self.east, centerHeight + wh);
                    setHeight(self.west, centerHeight + wh);
                    // console.log(this, e, ui, wh);
                },
            });
        }
        if (self.west) {
            self.west.classList.add('azLayoutArea', 'azLayoutAreaWest');
            azui.Resizable(self.west, {
                handles: 'e',
                start: function (e, h) {
                    centerWidth = getWidth(self.center);
                    centerHeight = getHeight(self.center);
                    setHeight(self.center, centerHeight);
                    setHeight(self.east, centerHeight);
                    setHeight(self.west, centerHeight);
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