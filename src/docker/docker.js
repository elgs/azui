import {
    Base
} from '../utilities/core.js';

import {
    randGen,
    randGenConsts,
} from '../utilities/utilities.js';

azui.Docker = function (el, options) {
    return new Docker(el, options);
};

class Docker extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({}, options);

        const node = this.node;
        node.classList.add('azDocker');

        this.sortable = azui.Sortable(this.node, {
            placeholder: true,
        });
    }

    dock(el) {
        const id = randGen(8, randGenConsts.LowerUpperDigit, '', '');
        const icon = document.createElement('div');
        icon.innerHTML = 'w0';
        icon.setAttribute('dock-id', id);
        this.sortable.add(icon);
        el.setAttribute('dock-id', id);
    }

    undock(el) {

    }

    activate(el) {

    }

    inactivate(el) {

    }
}