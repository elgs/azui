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

        const self = this;
        this.dragging = false;

        this.sortable = azui.Sortable(this.node, {
            placeholder: true,
            start: (e, data) => {
                // console.log('start dragging');
                self.dragging = true;
            },
            stop: (e, data) => {
                // console.log('stop dragging');
                self.dragging = false;
            }
        });
    }

    dock(el) {
        const self = this;
        const id = randGen(8, randGenConsts.LowerUpperDigit, '', '');
        const docked = document.createElement('div');
        docked.setAttribute('az-dock-id', id);
        this.sortable.add(docked);
        docked.addEventListener('mouseup', e => {
            if (!self.dragging) {
                self.toggle(id);
            }
        });
        el.setAttribute('az-dock-ref', id);
        el.dispatchEvent(new CustomEvent('docked'));
        return docked;
    }

    undock(dockId) {
        remove(this.node.querySelector(`[az-dock-id='${dockId}']`));

        const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
        dockedRef.dispatchEvent(new CustomEvent('undocked'));

        document.querySelector(`[az-dock-ref='${dockId}']`).removeAttribute('az-dock-ref');
    }

    activate(dockId) {
        const self = this;
        this.node.querySelectorAll('.azSortableItem').forEach(el => {
            if (!matches(el, 'dock-active')) {
                const otherDockId = el.getAttribute('az-dock-id');
                self.inactivate(otherDockId);
            }
        });

        const docked = this.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
        docked.classList.add('dock-active');

        const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
        dockedRef.dispatchEvent(new CustomEvent('activated'));
    }

    inactivate(dockId) {
        const docked = this.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
        docked.classList.remove('dock-active');

        const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
        dockedRef.dispatchEvent(new CustomEvent('inactivated'));
    }

    toggle(dockId) {
        const docked = this.node.querySelector(`[az-dock-id='${dockId}']`);
        if (matches(docked, '.dock-active')) {
            this.inactivate(dockId);
        } else {
            this.activate(dockId);
        }
    }
}