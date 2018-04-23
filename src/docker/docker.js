import {
    Base
} from '../utilities/core.js';

import {
    randGen,
    randGenConsts,
    remove,
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
        const docked = document.createElement('div');
        docked.setAttribute('data-dock-id', id);
        this.sortable.add(docked);
        el.setAttribute('data-dock-ref', id);
        return id;
    }

    undock(dockId) {
        remove(this.node.querySelector(`[data-dock-id='${dockId}']`));
        document.querySelector(`[data-dock-ref='${dockId}']`).removeAttribute('data-dock-ref');
    }

    activate(dockId) {
        this.node.querySelectorAll('.azSortableItem').forEach(el => {
            el.classList.remove('dock-active');
        });
        const docked = this.node.querySelector(`[data-dock-id='${dockId}']`);
        docked.classList.add('dock-active');
    }

    inactivate(dockId) {
        const docked = this.node.querySelector(`[data-dock-id='${dockId}']`);
        docked.classList.remove('dock-active');
    }
}