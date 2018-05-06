import {
    Base
} from '../utilities/core.js';

import {
    randGen,
    randGenConsts,
    remove,
    matches,
    diffPosition,
} from '../utilities/utilities.js';

azui.Docker = function (el, options) {
    return new Docker(el, options);
};

class Docker extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({
            // height: 30,
            // width: 30,
        }, options);
        this.settings = settings;

        const node = this.node;
        node.classList.add('azDocker');
        node.style['z-index'] = Number.MAX_SAFE_INTEGER;

        const self = this;

        this.dragging = false;
        this.sortable = azui.Sortable(this.node, {
            placeholder: true,
            create: (e, target) => {
                e.preventDefault();
            },
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

    dock(el, icon, title) {
        const self = this;
        const id = randGen(8, randGenConsts.LowerUpperDigit, '', '');
        const docked = document.createElement('div');
        docked.setAttribute('az-dock-id', id);
        docked.setAttribute('state', 'normal');

        const iconSpan = document.createElement('span');
        iconSpan.classList.add('icon');
        iconSpan.innerHTML = icon;
        docked.appendChild(iconSpan);

        const titleSpan = document.createElement('span');
        titleSpan.classList.add('title');
        titleSpan.innerHTML = title;
        docked.appendChild(titleSpan);

        // docked.style.width = this.settings.width + 'px';
        // docked.style.height = this.settings.height + 'px';
        this.sortable.add(docked);
        docked.addEventListener('mouseup', e => {
            if (!self.dragging) {
                const docked = self.node.querySelector(`[az-dock-id='${id}']:not(.az-placeholder)`);
                // console.log(docked.getAttribute('state'));
                if (docked.getAttribute('state') === 'normal') {
                    if (self.isActive(id)) {
                        self.minimize(id);
                    }
                } else if (docked.getAttribute('state') === 'minimized') {
                    self.normalize(id);
                }
                self.activate(id);
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

    isActive(dockId) {
        const docked = this.node.querySelector(`[az-dock-id='${dockId}']`);
        return matches(docked, '.dock-active');
    }

    toggleActive(dockId) {
        if (this.isActive(dockId)) {
            this.inactivate(dockId);
        } else {
            this.activate(dockId);
        }
    }

    // maximize(dockId) {
    //     this.storeState(dockId);

    //     const docked = this.node.querySelector(`[az-dock-id='${dockId}']`);
    //     const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
    //     docked.setAttribute('state', 'maximized');

    //     dockedRef.style.transition = 'all .3s ease-in';
    //     dockedRef.style.left = 0;
    //     dockedRef.style.top = 0;
    //     dockedRef.style.height = '100%';
    //     dockedRef.style.width = '100%';
    //     setTimeout(() => {
    //         dockedRef.style.transition = '';
    //     }, 300);
    // }

    minimize(dockId) {
        this.storeState(dockId);

        const docked = this.node.querySelector(`[az-dock-id='${dockId}']`);
        const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
        docked.setAttribute('state', 'minimized');

        const diff = diffPosition(dockedRef, docked);

        const drStyles = getComputedStyle(dockedRef);
        const drTop = parseInt(drStyles["top"]);
        const drLeft = parseInt(drStyles["left"]);

        const dStyles = getComputedStyle(docked);

        dockedRef.style.transition = 'all .25s ease-in';
        dockedRef.style.left = drLeft - diff.left + 'px';
        dockedRef.style.top = drTop - diff.top + 'px';
        dockedRef.style.height = dStyles['height'];
        dockedRef.style.width = dStyles['width'];
        dockedRef.style.visibility = 'hidden';
        setTimeout(() => {
            dockedRef.style.transition = '';
        }, 250);
    }

    normalize(dockId) {
        const docked = this.node.querySelector(`[az-dock-id='${dockId}']`);
        const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
        docked.setAttribute('state', 'normal');

        dockedRef.style.transition = 'all .3s ease-in';
        dockedRef.style.left = docked.getAttribute('x') + 'px';
        dockedRef.style.top = docked.getAttribute('y') + 'px';
        dockedRef.style.height = docked.getAttribute('height') + 'px';
        dockedRef.style.width = docked.getAttribute('width') + 'px';
        dockedRef.style.visibility = 'visible';
        setTimeout(() => {
            dockedRef.style.transition = '';
        }, 300);
    }

    storeState(dockId) {
        const docked = this.node.querySelector(`[az-dock-id='${dockId}']`);
        const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);

        if (docked.getAttribute('state') !== 'normal') {
            return;
        }
        docked.setAttribute('height', dockedRef.clientHeight);
        docked.setAttribute('width', dockedRef.clientWidth);
        docked.setAttribute('x', dockedRef.offsetLeft);
        docked.setAttribute('y', dockedRef.offsetTop);
    }
}