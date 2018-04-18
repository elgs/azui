import {
    Base
} from '../utilities/core.js';

class DockBar extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({}, options);

        const node = this.node;
        node.classList.add('azDockBar');
    }
}