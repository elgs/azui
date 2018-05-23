import {
    Base
} from '../utilities/core.js';

import {

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
            center: undefined,
        }, options);

        const node = this.node;
        const self = this;
        node.classList.add('azLayout');
    }
};