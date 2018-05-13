import {
    Base
} from '../utilities/core.js';

import {

} from '../utilities/utilities.js';

azui.Splitter = function (el, options) {
    return new Splitter(el, options);
};

class Splitter extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({

        }, options);

        const node = this.node;
        const self = this;
        node.classList.add('azSplitter');
    }
};