import {
    Base
} from '../utilities/core.js';

import {
    randGen,
    randGenConsts,
    remove,
    matches,
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
        const self = this;
        const id = randGen(8, randGenConsts.LowerUpperDigit, '', '');
        const docked = document.createElement('div');
        docked.addEventListener('click', e => {
            self.toggle(id);
        });
        docked.setAttribute('data-dock-id', id);
        this.sortable.add(docked);
        el.setAttribute('data-dock-ref', id);
        el.dispatchEvent(new CustomEvent('docked'));
        return id;
    }

    undock(dockId) {
        remove(this.node.querySelector(`[data-dock-id='${dockId}']`));

        const dockedRef = document.querySelector(`[data-dock-ref='${dockId}']`);
        dockedRef.dispatchEvent(new CustomEvent('undocked'));

        document.querySelector(`[data-dock-ref='${dockId}']`).removeAttribute('data-dock-ref');
    }

    activate(dockId) {
        const self = this;
        this.node.querySelectorAll('.azSortableItem').forEach(el => {
            const otherDockId = el.getAttribute('data-dock-id');
            self.inactivate(otherDockId);
        });
        const docked = this.node.querySelector(`[data-dock-id='${dockId}']`);
        docked.classList.add('dock-active');

        const dockedRef = document.querySelector(`[data-dock-ref='${dockId}']`);
        dockedRef.dispatchEvent(new CustomEvent('activated'));
    }

    inactivate(dockId) {
        const docked = this.node.querySelector(`[data-dock-id='${dockId}']`);
        docked.classList.remove('dock-active');

        const dockedRef = document.querySelector(`[data-dock-ref='${dockId}']`);
        dockedRef.dispatchEvent(new CustomEvent('inactivated'));
    }

    toggle(dockId) {
        const docked = this.node.querySelector(`[data-dock-id='${dockId}']`);
        if (matches(docked, '.dock-active')) {
            this.inactivate(dockId);
        } else {
            this.activate(dockId);
        }
    }
}