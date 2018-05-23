import {
    Base
} from '../utilities/core.js';

import {
    resolveDOM,
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

        self.north && self.north.classList.add('azLayoutArea', 'azLayoutAreaNorth');
        self.east && self.east.classList.add('azLayoutArea', 'azLayoutAreaEast');
        self.south && self.south.classList.add('azLayoutArea', 'azLayoutAreaSouth');
        self.west && self.west.classList.add('azLayoutArea', 'azLayoutAreaWest');
        self.center && self.center.classList.add('azLayoutArea', 'azLayoutAreaCenter');

        // console.log(self.north, self.east, self.south, self.west, self.center);
    }
};