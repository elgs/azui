import {
    Base
} from '../utilities/core.js';
import {
    dndStateConsts,
    getDocHeight,
    getDocWidth,
    getDropTargets,
    getPositionState,
    isOutside,
    isOutsideX,
    isOutsideY,
    isTouchDevice
} from '../utilities/utilities.js';

azui.Draggable = function (el, options) {
    return new Draggable(el, options);
};

class Draggable extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({
            handle: false,
            axis: false,
            containment: false,
            escape: false,
            resist: false,
            opacity: false,
            dropKey: false,
            triggerDropEvents: false,
            create: function (event, ui) {
                // console.log('create', ui);
            },
            start: function (event, ui) {
                // console.log('start', ui);
            },
            drag: function (event, ui) {
                // console.log('drag', ui);
            },
            stop: function (event, ui) {
                // console.log('stop', ui);
            },
        }, options);

        const self = this;
        const node = this.node;
        node.classList.add('azDraggable');

        let dropTargetStates = {};
        self.position = getComputedStyle(node)['position'];
        if (self.position !== 'absolute' && self.position !== 'fixed') {
            node.style['position'] = 'relative';
        }
        self.position = getComputedStyle(node)['position'];

        // console.log(self.style['position'));
        let savedZIndex;

        self.escapeX = false;
        self.escapeY = false;
        if (settings.escape === 'x') {
            self.escapeX = true;
        }
        if (settings.escape === 'y') {
            self.escapeY = true;
        }
        if (settings.escape === true) {
            self.escapeX = true;
            self.escapeY = true;
        }

        self.selected = null;
        let mouseX0 = 0;
        let mouseY0 = 0;
        self.containerBoundaries = null;
        self.mouseX = 0;
        self.mouseY = 0;
        self.selfN = 0;
        self.selfE = 0;
        self.selfS = 0;
        self.selfW = 0;
        self.selfWidth = 0;
        self.selfHeight = 0;
        // self n, e, s, w, parent n, e ,s, w, contaner n, e, s, w
        self.scrN = undefined;
        self.scrE = undefined;
        self.scrS = undefined;
        self.scrW = undefined;
        self.pScrN = undefined;
        self.pScrE = undefined;
        self.pScrS = undefined;
        self.pScrW = undefined;
        self.cScrN = undefined;
        self.cScrE = undefined;
        self.cScrS = undefined;
        self.cScrW = undefined;

        self.cbn = 0;
        self.cbe = 0;
        self.cbs = 0;
        self.cbw = 0; // container borders
        self.cpn = 0;
        self.cpe = 0;
        self.cps = 0;
        self.cpw = 0; // container paddings
        self.pbn = 0;
        self.pbe = 0;
        self.pbs = 0;
        self.pbw = 0; // offset parent borders
        self.ppn = 0;
        self.ppe = 0;
        self.pps = 0;
        self.ppw = 0; // offset parent paddings
        self.smn = 0;
        self.sme = 0;
        self.sms = 0;
        self.smw = 0; // self margin
        let resisted = false;
        let started = false;

        const onmousemove = function (e) {
            // console.log(e.type, e.currentTarget, self);
            // console.log(e.currentTarget);
            if (!self.selected) {
                return;
            }
            if (!started) {
                if (settings.start(e, self.selected) === false) {
                    return false;
                }
                initDrag(e);
                started = true;

                if (settings.triggerDropEvents && settings.dropKey) {
                    const dts = getDropTargets(settings.dropKey);
                    dts.filter(dt => dt !== node).map(dt => {
                        // console.log(self, elem);
                        // const dropId = dt.getAttribute('drop-id');
                        const ps = getPositionState(node, dt);
                        // console.log(ps);

                        dt.dispatchEvent(new CustomEvent('dragged', {
                            detail: {
                                source: node,
                                target: dt,
                                state: ps
                            }
                        }));
                    });
                }
            }

            if (settings.drag(e, self.selected) === false) {
                return false;
            }
            self.mouseX = e.clientX || e.touches[0].clientX;
            self.mouseY = e.clientY || e.touches[0].clientY;
            const dx = self.mouseX - mouseX0;
            const dy = self.mouseY - mouseY0;
            // console.log(dx, dy);
            if (!resisted && Math.abs(dx) < settings.resist && Math.abs(dy) < settings.resist) {
                return;
            }
            resisted = true;
            // console.log(dx, dy);

            if (settings.axis === 'x') {
                self.moveX(dx);
            } else if (settings.axis === 'y') {
                self.moveY(dy);
            } else {
                self.moveX(dx);
                self.moveY(dy);
            }

            if (settings.triggerDropEvents && settings.dropKey) {
                const dts = getDropTargets(settings.dropKey);
                dts.filter(dt => dt !== node).map(dt => {
                    // console.log(self, elem);
                    const dropId = dt.getAttribute('az-drop-id');
                    const oldPs = dropTargetStates[dropId];
                    const ps = getPositionState(node, dt);
                    if (oldPs !== ps) {
                        Object.keys(dndStateConsts).map(state => {
                            const nState = ps & dndStateConsts[state];
                            const oState = oldPs & dndStateConsts[state];
                            if (nState !== oState) {
                                dt.dispatchEvent(new CustomEvent(state + (!!nState ? '_in' : '_out'), {
                                    detail: {
                                        source: node,
                                        target: dt,
                                        previousState: oldPs,
                                        state: ps
                                    }
                                }));
                            }
                        });
                        dropTargetStates[dropId] = ps;
                    }
                });
            }
            // self.selected.style['background-color'] = 'red';
        };

        const onmouseup = function (e) {
            // console.log(e.type, e.target, self, self.selected);
            if (started && settings.stop(e, self.selected) === false) {
                return false;
            }
            started = false;
            resisted = false;
            node.style['z-index'] = savedZIndex;
            // console.log('up:', self.style['z-index']);

            // self.style['cursor', 'default');
            if (settings.opacity) {
                node.style['opacity'] = 1;
            }

            if (isTouchDevice()) {
                document.removeEventListener('touchmove', onmousemove);
                document.removeEventListener('touchend', onmouseup);
                document.removeEventListener('touchcancel', onmouseup);
            }
            // else {
            document.removeEventListener('mousemove', onmousemove);
            document.removeEventListener('mouseup', onmouseup);
            document.removeEventListener('mouseleave', onmouseup);
            // }

            // self.selected.style['background-color'] = 'white';
            self.selected = null;

            if (settings.triggerDropEvents && settings.dropKey) {
                const dts = getDropTargets(settings.dropKey);
                dts.filter(dt => dt !== node).map(dt => {
                    // console.log(self, elem);
                    const dropId = dt.getAttribute('drop-id');
                    const ps = getPositionState(node, dt);
                    // console.log(ps);
                    dt.dispatchEvent(new CustomEvent('dropped', {
                        detail: {
                            source: node,
                            target: dt,
                            state: ps
                        }
                    }));
                });
            }
            // return false;
        };

        const initDrag = function (e) {
            const nodeStyles = getComputedStyle(node);
            if (settings.containment) {
                let containment;
                if (typeof settings.containment === 'string') {
                    if (settings.containment === 'parent') {
                        containment = node.parentNode;
                    } else if (settings.containment === 'document') {
                        self.cScrN = -document.documentElement.scrollLeft;
                        self.cScrW = -document.documentElement.scrollTop;
                        self.cScrS = getDocHeight();
                        self.cScrE = getDocWidth();
                        // console.log(self.cScrN, self.cScrW, self.cScrS, self.cScrE);
                    } else if (settings.containment === 'window') {
                        self.cScrN = 0;
                        self.cScrW = 0;
                        self.cScrS = window.innerHeight;
                        self.cScrE = window.innerWidth;
                        // console.log(self.cScrN, self.cScrW, self.cScrS, self.cScrE);
                    } else {
                        containment = document.querySelector(settings.containment);
                    }
                } else if (Array.isArray(settings.containment)) {
                    self.cScrW = settings.containment[0];
                    self.cScrN = settings.containment[1];
                    self.cScrE = settings.containment[2];
                    self.cScrS = settings.containment[3];
                } else if (typeof settings.containment === 'object') {
                    if (settings.containment instanceof NodeList) {
                        containment = settings.containment[0];
                    } else if (settings.containment instanceof Node) {
                        containment = settings.containment;
                    }
                }

                if (containment && typeof containment === 'object') {
                    const containerStyles = getComputedStyle(containment);
                    self.cbn = parseInt(containerStyles["border-top-width"]);
                    self.cbe = parseInt(containerStyles["border-right-width"]);
                    self.cbs = parseInt(containerStyles["border-bottom-width"]);
                    self.cbw = parseInt(containerStyles["border-left-width"]);

                    const containerBoundaries = containment.getBoundingClientRect();
                    self.containerBoundaries = containerBoundaries;
                    self.cScrN = containerBoundaries.top;
                    self.cScrE = containerBoundaries.right;
                    self.cScrS = containerBoundaries.bottom;
                    self.cScrW = containerBoundaries.left;

                    self.cpn = parseInt(containerStyles["padding-top"]);
                    self.cpe = parseInt(containerStyles["padding-right"]);
                    self.cps = parseInt(containerStyles["padding-bottom"]);
                    self.cpw = parseInt(containerStyles["padding-left"]);
                    // console.log(self.cpn, self.cpe, self.cps, self.cpw);
                }
            }

            const parent = node.offsetParent || document.body;
            const parentStyles = getComputedStyle(parent);
            const pp = parentStyles['position'];
            if (pp !== 'relative' && pp !== 'absolute' && pp !== 'fixed') {
                parent.style['position'] = 'relative';
            }

            // console.log(parent, self.offsetParent);
            const pb = parent.getBoundingClientRect();
            self.pScrN = pb.top;
            self.pScrE = pb.right;
            self.pScrS = pb.bottom;
            self.pScrW = pb.left;
            // console.log(self.pScrN, self.pScrE, self.pScrS, self.pScrW);

            self.pbn = parseInt(parentStyles["border-top-width"]);
            self.pbe = parseInt(parentStyles["border-right-width"]);
            self.pbs = parseInt(parentStyles["border-bottom-width"]);
            self.pbw = parseInt(parentStyles["border-left-width"]);
            // console.log(self.pbn, self.pbe, self.pbs, self.pbw);

            self.ppn = parseInt(parentStyles["padding-top"]);
            self.ppe = parseInt(parentStyles["padding-right"]);
            self.pps = parseInt(parentStyles["padding-bottom"]);
            self.ppw = parseInt(parentStyles["padding-left"]);
            // console.log(self.ppn, self.ppe, self.pps, self.ppw);

            self.smn = parseInt(nodeStyles["margin-top"]);
            self.sme = parseInt(nodeStyles["margin-right"]);
            self.sms = parseInt(nodeStyles["margin-bottom"]);
            self.smw = parseInt(nodeStyles["margin-left"]);
            // console.log(self.smn, self.sme, self.sms, self.smw);

            const selfbcr = self.selected.getBoundingClientRect();
            self.scrN = selfbcr.top;
            self.scrE = selfbcr.right;
            self.scrS = selfbcr.bottom;
            self.scrW = selfbcr.left;
            // console.log(self.scrN, self.scrE, self.scrS, self.scrW);

            // self.selfW = parseInt(getComputedStyle(self)['left'));
            // self.selfE = parseInt(getComputedStyle(self)['right'));
            // self.selfN = parseInt(getComputedStyle(self)['top'));
            // self.selfS = parseInt(getComputedStyle(self)['bottom'));
            // console.log(self.selfN, self.selfE, self.selfS, self.selfW);

            const pScrollLeft = parent.scrollLeft;
            const pScrollTop = parent.scrollTop;

            if (nodeStyles['position'] === 'relative') {
                self.selfW = parseInt(nodeStyles['left'] === 'auto' ? '0' : nodeStyles['left']) + pScrollLeft;
                self.selfE = parseInt(nodeStyles['right'] === 'auto' ? '0' : nodeStyles['right']) - pScrollLeft;
                self.selfN = parseInt(nodeStyles['top'] === 'auto' ? '0' : nodeStyles['top']) + pScrollTop;
                self.selfS = parseInt(nodeStyles['bottom'] === 'auto' ? '0' : nodeStyles['bottom']) - pScrollTop;
                // console.log(self.selfN, self.selfE, self.selfS, self.selfW, self.style['position'));
            } else if (nodeStyles['position'] === 'absolute') {
                self.selfW = self.scrW - self.pScrW - self.smw - self.pbw + pScrollLeft;
                self.selfN = self.scrN - self.pScrN - self.smn - self.pbn + pScrollTop;
                self.selfE = -self.scrE + self.pScrE - self.sme - self.pbe - pScrollLeft;
                self.selfS = -self.scrS + self.pScrS - self.sms - self.pbs - pScrollTop;
            } else if (nodeStyles['position'] === 'fixed') {
                self.selfW = self.scrW - self.smw + pScrollLeft;
                self.selfN = self.scrN - self.smn + pScrollTop;
            }

            self.selfWidth = selfbcr.width;
            self.selfHeight = selfbcr.height;
            // console.log(self.selfWidth + ', ' + self.selfHeight);

            // self.style['cursor', 'pointer');
            if (settings.opacity) {
                node.style['opacity'] = settings.opacity;
            }
        };

        const onmousedown = function (e) {
            // console.log(e.type, e.target, self);
            if (e.type === 'mousedown' && e.button !== 0) {
                return;
            }

            // the reson cannot do it is that scroll content on mobile device becomes not possible
            // client can use this in create() if needed.
            // if (e.type === 'touchstart') {
            //     e.preventDefault();
            // }

            // the reason not to use stopPropation is to allow other events to bubble through, like click to increase z-index.
            // e.stopPropagation(); // no no

            // only move the self.selected one, not any of it's ancestors.
            if (e.target.closest('.azDraggable') !== node) {
                return;
            }

            if (settings.create(e, node) === false) {
                return;
            }
            self.selected = node;

            self.mouseX = mouseX0 = e.clientX || e.touches[0].clientX;
            self.mouseY = mouseY0 = e.clientY || e.touches[0].clientY;
            if (settings.handle) {
                let handle = settings.handle;
                if (typeof settings.handle === 'string') {
                    handle = node.querySelector(settings.handle);
                }
                if (handle) {
                    const hb = handle.getBoundingClientRect();
                    if (isOutside(mouseX0, mouseY0, hb)) {
                        return;
                    }
                }
            }

            savedZIndex = getComputedStyle(node)['z-index'];
            // console.log('down:', savedZIndex);
            node.style['z-index'] = Number.MAX_SAFE_INTEGER;

            if (isTouchDevice()) {
                document.addEventListener('touchmove', onmousemove);
                document.addEventListener('touchend', onmouseup);
                document.addEventListener('touchcancel', onmouseup);
            }
            document.addEventListener('mousemove', onmousemove);
            document.addEventListener('mouseup', onmouseup);
            document.addEventListener('mouseleave', onmouseup);
        };

        if (isTouchDevice()) {
            node.addEventListener('touchstart', onmousedown);
        }
        node.addEventListener('mousedown', onmousedown);
    }

    moveX(by) {
        const self = this;
        if (self.position === 'absolute') {
            self.moveAbsoluteX(by);
        } else if (self.position === 'relative') {
            self.moveRelativeX(by);
        } else if (self.position === 'fixed') {
            self.moveFixedX(by);
        }
    }

    moveY(by) {
        const self = this;
        if (self.position === 'absolute') {
            self.moveAbsoluteY(by);
        } else if (self.position === 'relative') {
            self.moveRelativeY(by);
        } else if (self.position === 'fixed') {
            self.moveFixedY(by);
        }
    }

    moveAbsoluteX(dx) {
        const self = this;
        if (self.cScrW === undefined) {
            self.selected.style.right = 'auto';
            self.selected.style.left = (self.selfW + dx) + 'px';
        } else {
            if (self.escapeX && isOutsideX(self.mouseX, self.containerBoundaries)) {
                self.selected.style.right = 'auto';
                self.selected.style.left = (self.selfW + dx) + 'px';
            } else if (-dx > self.scrW - self.cScrW - self.cbw - self.cpw - self.smw) {
                // console.log('hit left wall');
                const di = self.cScrW + self.cbw + self.cpw - (self.pScrW + self.pbw + self.ppw);
                self.selected.style.right = 'auto';
                self.selected.style.left = self.ppw + di + 'px';
            } else if (dx > self.cScrE - self.scrE - self.cbe - self.cpe - self.sme) {
                // console.log('hit right wall');
                const di = self.cScrE - self.cbe - self.cpe - (self.pScrE - self.pbe - self.ppe);
                self.selected.style.left = 'auto';
                self.selected.style.right = self.ppe - di + 'px';
            } else {
                self.selected.style.right = 'auto';
                self.selected.style.left = (self.selfW + dx) + 'px';
            }
        }
    }

    moveAbsoluteY(dy) {
        const self = this;
        if (self.cScrW === undefined) {
            self.selected.style.bottom = 'auto';
            self.selected.style.top = (self.selfN + dy) + 'px';
        } else {
            if (self.escapeY && isOutsideY(self.mouseY, self.containerBoundaries)) {
                self.selected.style.bottom = 'auto';
                self.selected.style.top = (self.selfN + dy) + 'px';
            } else if (-dy > self.scrN - self.cScrN - self.cbn - self.cpn - self.smn) {
                // console.log('hit ceiling');
                const di = self.cScrN + self.cbn + self.cpn - (self.pScrN + self.pbn + self.ppn);
                self.selected.style.bottom = 'auto';
                self.selected.style.top = self.ppn + di + 'px';
            } else if (dy > self.cScrS - self.scrS - self.cbs - self.cps - self.sms) {
                // console.log('hit floor');
                const di = self.cScrS - self.cbs - self.cps - (self.pScrS - self.pbs - self.pps);
                self.selected.style.top = 'auto';
                self.selected.style.bottom = self.pps - di + 'px';
            } else {
                self.selected.style.bottom = 'auto';
                self.selected.style.top = (self.selfN + dy) + 'px';
            }
        }
    }

    moveFixedX(dx) {
        const self = this;
        if (self.cScrW === undefined) {
            self.selected.style.right = 'auto';
            self.selected.style.left = (self.selfW + dx) + 'px';
        } else {
            if (self.escapeX && isOutsideX(self.mouseX, self.containerBoundaries)) {
                self.selected.style.right = 'auto';
                self.selected.style.left = (self.selfW + dx) + 'px';
            } else if (-dx > self.scrW - self.cScrW - self.cbw - self.cpw - self.smw) {
                // console.log('hit left wall');
                self.selected.style.right = 'auto';
                self.selected.style.left = self.cScrW + self.cbw + self.cpw + 'px';
            } else if (dx > self.cScrE - self.scrE - self.cbe - self.cpe - self.sme) {
                // console.log('hit right wall');
                self.selected.style.right = 'auto';
                self.selected.style.left = self.cScrE - self.cbe - self.cpe - self.selfWidth - self.smw - self.sme + 'px';
            } else {
                self.selected.style.right = 'auto';
                self.selected.style.left = (self.selfW + dx) + 'px';
            }
        }
    }

    moveFixedY(dy) {
        const self = this;
        if (self.cScrW === undefined) {
            self.selected.style.bottom = 'auto';
            self.selected.style.top = (self.selfN + dy) + 'px';
        } else {
            if (self.escapeY && isOutsideY(self.mouseY, self.containerBoundaries)) {
                self.selected.style.bottom = 'auto';
                self.selected.style.top = (self.selfN + dy) + 'px';
            } else if (-dy > self.scrN - self.cScrN - self.cbn - self.cpn - self.smn) {
                // console.log('hit ceiling');
                self.selected.style.bottom = 'auto';
                self.selected.style.top = self.cScrN + self.cbn + self.cpn + 'px';
            } else if (dy > self.cScrS - self.scrS - self.cbs - self.cps - self.sms) {
                // console.log('hit floor');
                self.selected.style.bottom = 'auto';
                self.selected.style.top = self.cScrS - self.cbs - self.cps - self.selfHeight - self.smn - self.sms + 'px';
            } else {
                self.selected.style.bottom = 'auto';
                self.selected.style.top = (self.selfN + dy) + 'px';
            }
        }
    }

    moveRelativeX(dx) {
        const self = this;
        if (self.cScrW === undefined) {
            self.selected.style.right = 'auto';
            self.selected.style.left = (self.selfW + dx) + 'px';
        } else {
            if (self.escapeX && isOutsideX(self.mouseX, self.containerBoundaries)) {
                self.selected.style.right = 'auto';
                self.selected.style.left = (self.selfW + dx) + 'px';
            } else if (-dx > self.scrW - self.cScrW - self.cbw - self.cpw - self.smw) {
                // console.log('hit left wall');
                self.selected.style.right = 'auto';
                self.selected.style.left = -(self.scrW - self.cScrW - self.cbw - self.cpw - self.smw) + self.selfW + 'px';
            } else if (dx > self.cScrE - self.scrE - self.cbe - self.cpe - self.sme) {
                // console.log('hit right wall');
                self.selected.style.left = 'auto';
                self.selected.style.right = -(self.cScrE - self.scrE - self.cbe - self.cpe - self.sme) + self.selfE + 'px';
            } else {
                self.selected.style.right = 'auto';
                self.selected.style.left = (self.selfW + dx) + 'px';
            }
        }
    };
    moveRelativeY(dy) {
        const self = this;
        if (self.cScrW === undefined) {
            self.selected.style.bottom = 'auto';
            self.selected.style.top = (self.selfN + dy) + 'px';
        } else {
            if (self.escapeY && isOutsideY(self.mouseY, self.containerBoundaries)) {
                self.selected.style.bottom = 'auto';
                self.selected.style.top = (self.selfN + dy) + 'px';
            } else if (-dy > self.scrN - self.cScrN - self.cbn - self.cpn - self.smn) {
                // console.log('hit ceiling');
                self.selected.style.bottom = 'auto';
                self.selected.style.top = -(self.scrN - self.cScrN - self.cbn - self.cpn - self.smn) + self.selfN + 'px';
            } else if (dy > self.cScrS - self.scrS - self.cbs - self.cps - self.sms) {
                // console.log('hit floor');
                self.selected.style.top = 'auto';
                self.selected.style.bottom = -(self.cScrS - self.scrS - self.cbs - self.cps - self.sms) + self.selfS + 'px';
                // console.log(self.cScrS, self.scrS, self.cbs, self.cps, self.sms, self.selfS);
            } else {
                self.selected.style.bottom = 'auto';
                self.selected.style.top = (self.selfN + dy) + 'px';
            }
        }
    }
}