import {
    Base
} from '../utilities/core.js';

import {
    randGen,
    remove,
    matches,
    diffPosition,
    registerObject,
} from '../utilities/utilities.js';

import * as icons from '../utilities/icons.js';

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

        this.dockerId = randGen(8);
        node.setAttribute('az-docker-id', this.dockerId);
        registerObject(this.dockerId, this);

        this.x = 30;
        this.y = 30;
        this.z = 0;
        this.dragging = false;
        this.sortable = azui.Sortable(this.node, {
            placeholder: true,
            create: (e, target) => {
                if (e.type === 'touchstart') {
                    e.preventDefault();
                }
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

    dock(el, icon, title, notify) {
        const self = this;
        const id = randGen(8);
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

        const getCmItems = () => {
            const state = docked.getAttribute('state');
            return [{
                    icon: icons.svgClose,
                    title: 'Close',
                    action: function (e, target) {
                        self.undock(id, true);
                        return false;
                    }
                },
                null,
                {
                    icon: icons.svgWindowMin,
                    title: 'Minimize Window',
                    disabled: state === 'minimized',
                    action: function (e, target) {
                        self.minimize(id, true);
                        return false;
                    }
                },
                {
                    icon: icons.svgWindowNormal,
                    disabled: state === 'normal',
                    title: 'Restore Window',
                    action: function (e, target) {
                        self.normalize(id, true);
                        return false;
                    }
                },
                {
                    icon: icons.svgWindowMax,
                    title: 'Maximize Window',
                    disabled: state === 'maximized',
                    action: function (e, target) {
                        self.maximize(id, true);
                        return false;
                    }
                }
            ];
        };

        const cm = azui.ContextMenu(docked, {
            onTouchStart: function (e) {},
            onTouchEnd: function (e) {},
            items: getCmItems,
        });

        // docked.style.width = this.settings.width + 'px';
        // docked.style.height = this.settings.height + 'px';
        this.sortable.add(docked);

        const clicked = e => {
            if (!self.dragging) {
                const docked = self.node.querySelector(`[az-dock-id='${id}']:not(.az-placeholder)`);
                // console.log(docked.getAttribute('state'));
                if (docked.getAttribute('state') === 'normal') {
                    if (self.isActive(id)) {
                        self.minimize(id, true);
                    }
                } else if (docked.getAttribute('state') === 'minimized') {
                    self.normalize(id, true);
                }
                self.activate(id, true);
            }
        };

        docked.addEventListener('mouseup', e => {
            if (e.button === 2) {
                return;
            }
            clicked(e);
        });
        docked.addEventListener('touchend', e => {
            if (!cm.on) {
                clicked(e);
            }
        });
        el.setAttribute('az-dock-ref', id);
        if (notify) {
            el.dispatchEvent(new CustomEvent('docked'));
        }
        return docked;
    }

    undock(dockId, notify) {
        remove(this.node.querySelector(`[az-dock-id='${dockId}']`));

        const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
        if (dockedRef) {
            dockedRef.removeAttribute('az-dock-ref');
        }
        if (notify) {
            dockedRef.dispatchEvent(new CustomEvent('undocked'));
        }
    }

    activate(dockId, notify) {
        const self = this;
        this.node.querySelectorAll('.azSortableItem').forEach(el => {
            if (el.getAttribute('az-dock-id') !== dockId) {
                const otherDockId = el.getAttribute('az-dock-id');
                self.inactivate(otherDockId);
            }
        });

        const docked = this.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
        docked.classList.add('dock-active');

        const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
        if (notify) {
            dockedRef.dispatchEvent(new CustomEvent('activated'));
        }
    }

    inactivate(dockId, notify) {
        const docked = this.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
        docked.classList.remove('dock-active');

        const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
        if (notify) {
            dockedRef.dispatchEvent(new CustomEvent('inactivated'));
        }
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

    maximize(dockId, notify) {
        this.storeState(dockId);

        const docked = this.node.querySelector(`[az-dock-id='${dockId}']`);
        const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
        docked.setAttribute('state', 'maximized');

        dockedRef.style.transition = 'all .3s ease-in';
        dockedRef.style.left = 0;
        dockedRef.style.top = 0;
        dockedRef.style.height = '100%';
        dockedRef.style.width = '100%';
        dockedRef.style.visibility = 'visible';

        if (notify) {
            dockedRef.dispatchEvent(new CustomEvent('maximized'));
        }

        setTimeout(() => {
            dockedRef.style.transition = '';
        }, 300);
    }

    minimize(dockId, notify) {
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

        if (notify) {
            dockedRef.dispatchEvent(new CustomEvent('minimized'));
        }

        setTimeout(() => {
            dockedRef.style.transition = '';
        }, 250);
    }

    normalize(dockId, notify) {
        const docked = this.node.querySelector(`[az-dock-id='${dockId}']`);
        const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
        docked.setAttribute('state', 'normal');

        dockedRef.style.transition = 'all .25s ease-in';
        dockedRef.style.left = docked.getAttribute('x') + 'px';
        dockedRef.style.top = docked.getAttribute('y') + 'px';
        dockedRef.style.height = docked.getAttribute('height') + 'px';
        dockedRef.style.width = docked.getAttribute('width') + 'px';
        dockedRef.style.visibility = 'visible';

        if (notify) {
            dockedRef.dispatchEvent(new CustomEvent('normalized'));
        }

        setTimeout(() => {
            dockedRef.style.transition = '';
        }, 250);
    }

    slideup(dockId, notify) {
        const docked = this.node.querySelector(`[az-dock-id='${dockId}']`);
        const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);

        dockedRef.style.transition = 'all .25s ease-in';
        dockedRef.style.height = this.settings.headerHeight + 'px';

        if (notify) {
            dockedRef.dispatchEvent(new CustomEvent('slideup'));
        }

        setTimeout(() => {
            dockedRef.style.transition = '';
        }, 250);
    }

    slidedown(dockId, notify) {
        const docked = this.node.querySelector(`[az-dock-id='${dockId}']`);
        const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);

        dockedRef.style.transition = 'all .25s ease-in';
        dockedRef.style.height = docked.getAttribute('height') + 'px';

        if (notify) {
            dockedRef.dispatchEvent(new CustomEvent('slidedown'));
        }

        setTimeout(() => {
            dockedRef.style.transition = '';
        }, 250);
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