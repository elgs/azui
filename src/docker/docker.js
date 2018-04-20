import {
    Base
} from '../utilities/core.js';

azui.Docker = function (el, options) {
    return new Docker(el, options);
};

class Docker extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({}, options);

        const node = this.node;
        node.classList.add('azDocker');

        azui.Sortable(this.node, {
            placeholder: true,
        });
    }

    dock() {

    }

    undock() {

    }
}