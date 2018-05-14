import {
    Base
} from '../utilities/core.js';

import {
    isOutside,
    isTouchDevice,
    getDocWidth,
    getDocHeight,
    getDropTargets,
    getPositionState,
    dndStateConsts,
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

        const node = this.node;
        node.classList.add('azDraggable');

        let dropTargetStates = {};
        let position = getComputedStyle(node)['position'];
        if (position !== 'absolute' && position !== 'fixed') {
            node.style['position'] = 'relative';
        }
        position = getComputedStyle(node)['position'];

        // console.log(self.style['position'));
        let savedZIndex;

        let selected = null;
        let mouseX = 0;
        let mouseY = 0;
        let selfN = 0;
        let selfE = 0;
        let selfS = 0;
        let selfW = 0;
        let selfWidth = 0;
        let selfHeight = 0;
        // self n, e, s, w, parent n, e ,s, w, contaner n, e, s, w
        let scrN, scrE, scrS, scrW, pScrN, pScrE, pScrS, pScrW, cScrN, cScrE, cScrS, cScrW;
        let cbn = 0;
        let cbe = 0;
        let cbs = 0;
        let cbw = 0; // container borders
        let cpn = 0;
        let cpe = 0;
        let cps = 0;
        let cpw = 0; // container paddings
        let pbn = 0;
        let pbe = 0;
        let pbs = 0;
        let pbw = 0; // offset parent borders
        let ppn = 0;
        let ppe = 0;
        let pps = 0;
        let ppw = 0; // offset parent paddings
        let sbn = 0;
        let sbe = 0;
        let sbs = 0;
        let sbw = 0; // self borders
        let spn = 0;
        let spe = 0;
        let sps = 0;
        let spw = 0; // self padding
        let smn = 0;
        let sme = 0;
        let sms = 0;
        let smw = 0; // self margin
        let resisted = false;
        let started = false;

        const moveAbsoluteX = function (dx) {
            if (cScrW === undefined) {
                selected.style.right = 'auto';
                selected.style.left = (selfW + dx) + 'px';
            } else if (-dx > scrW - cScrW - cbw - cpw - smw) {
                // console.log('hit left wall');
                const di = cScrW + cbw + cpw - (pScrW + pbw + ppw);
                selected.style.right = 'auto';
                selected.style.left = ppw + di + 'px';
            } else if (dx > cScrE - scrE - cbe - cpe - sme) {
                // console.log('hit right wall');
                const di = cScrE - cbe - cpe - (pScrE - pbe - ppe);
                selected.style.left = 'auto';
                selected.style.right = ppe - di + 'px';
            } else {
                selected.style.right = 'auto';
                selected.style.left = (selfW + dx) + 'px';
            }
        };
        const moveAbsoluteY = function (dy) {
            if (cScrW === undefined) {
                selected.style.bottom = 'auto';
                selected.style.top = (selfN + dy) + 'px';
            } else if (-dy > scrN - cScrN - cbn - cpn - smn) {
                // console.log('hit ceiling');
                const di = cScrN + cbn + cpn - (pScrN + pbn + ppn);
                selected.style.bottom = 'auto';
                selected.style.top = ppn + di + 'px';
            } else if (dy > cScrS - scrS - cbs - cps - sms) {
                // console.log('hit floor');
                const di = cScrS - cbs - cps - (pScrS - pbs - pps);
                selected.style.top = 'auto';
                selected.style.bottom = pps - di + 'px';
            } else {
                selected.style.bottom = 'auto';
                selected.style.top = (selfN + dy) + 'px';
            }
        };

        const moveFixedX = function (dx) {
            if (cScrW === undefined) {
                selected.style.right = 'auto';
                selected.style.left = (selfW + dx) + 'px';
            } else if (-dx > scrW - cScrW - cbw - cpw - smw) {
                // console.log('hit left wall');
                selected.style.right = 'auto';
                selected.style.left = cScrW + cbw + cpw + 'px';
            } else if (dx > cScrE - scrE - cbe - cpe - sme) {
                // console.log('hit right wall');
                selected.style.right = 'auto';
                selected.style.left = cScrE - cbe - cpe - selfWidth - smw - sme + 'px';
            } else {
                selected.style.right = 'auto';
                selected.style.left = (selfW + dx) + 'px';
            }
        };
        const moveFixedY = function (dy) {
            if (cScrW === undefined) {
                selected.style.bottom = 'auto';
                selected.style.top = (selfN + dy) + 'px';
            } else if (-dy > scrN - cScrN - cbn - cpn - smn) {
                // console.log('hit ceiling');
                selected.style.bottom = 'auto';
                selected.style.top = cScrN + cbn + cpn + 'px';
            } else if (dy > cScrS - scrS - cbs - cps - sms) {
                // console.log('hit floor');
                selected.style.bottom = 'auto';
                selected.style.top = cScrS - cbs - cps - selfHeight - smn - sms + 'px';
            } else {
                selected.style.bottom = 'auto';
                selected.style.top = (selfN + dy) + 'px';
            }
        };

        const moveRelativeX = function (dx) {
            if (cScrW === undefined) {
                selected.style.right = 'auto';
                selected.style.left = (selfW + dx) + 'px';
            } else if (-dx > scrW - cScrW - cbw - cpw - smw) {
                // console.log('hit left wall');
                selected.style.right = 'auto';
                selected.style.left = -(scrW - cScrW - cbw - cpw - smw) + selfW + 'px';
            } else if (dx > cScrE - scrE - cbe - cpe - sme) {
                // console.log('hit right wall');
                selected.style.left = 'auto';
                selected.style.right = -(cScrE - scrE - cbe - cpe - sme) + selfE + 'px';
            } else {
                selected.style.right = 'auto';
                selected.style.left = (selfW + dx) + 'px';
            }
        };
        const moveRelativeY = function (dy) {
            if (cScrW === undefined) {
                selected.style.bottom = 'auto';
                selected.style.top = (selfN + dy) + 'px';
            } else if (-dy > scrN - cScrN - cbn - cpn - smn) {
                // console.log('hit ceiling');
                selected.style.bottom = 'auto';
                selected.style.top = -(scrN - cScrN - cbn - cpn - smn) + selfN + 'px';
            } else if (dy > cScrS - scrS - cbs - cps - sms) {
                // console.log('hit floor');
                selected.style.top = 'auto';
                selected.style.bottom = -(cScrS - scrS - cbs - cps - sms) + selfS + 'px';
                // console.log(cScrS, scrS, cbs, cps, sms, selfS);
            } else {
                selected.style.bottom = 'auto';
                selected.style.top = (selfN + dy) + 'px';
            }
        };

        const onmousemove = function (e) {
            // console.log(e.type, e.currentTarget, self);
            // console.log(e.currentTarget);
            if (!selected) {
                return;
            }
            if (!started) {
                if (settings.start(e, selected) === false) {
                    return false;
                }
                initDrag(e);
                started = true;

                if (settings.triggerDropEvents && settings.dropKey) {
                    const dts = getDropTargets(settings.dropKey);
                    dts.filter(dt => dt !== node).map(dt => {
                        // console.log(self, elem);
                        const dropId = dt.getAttribute('drop-id');
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

            if (settings.drag(e, selected) === false) {
                return false;
            }
            const nmx = e.clientX || e.touches[0].clientX;
            const nmy = e.clientY || e.touches[0].clientY;
            const dx = nmx - mouseX;
            const dy = nmy - mouseY;
            // console.log(dx, dy);
            if (!resisted && Math.abs(dx) < settings.resist && Math.abs(dy) < settings.resist) {
                return;
            }
            resisted = true;
            // console.log(dx, dy);

            if (settings.axis === 'x') {
                if (position === 'absolute') {
                    moveAbsoluteX(dx);
                } else if (position === 'relative') {
                    moveRelativeX(dx);
                } else if (position === 'fixed') {
                    moveFixedX(dx);
                }
            } else if (settings.axis === 'y') {
                if (position === 'absolute') {
                    moveAbsoluteY(dy);
                } else if (position === 'relative') {
                    moveRelativeY(dy);
                } else if (position === 'fixed') {
                    moveFixedY(dy);
                }
            } else {
                if (position === 'absolute') {
                    moveAbsoluteX(dx);
                    moveAbsoluteY(dy);
                } else if (position === 'relative') {
                    moveRelativeX(dx);
                    moveRelativeY(dy);
                } else if (position === 'fixed') {
                    moveFixedX(dx);
                    moveFixedY(dy);
                }

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
            // selected.style['background-color'] = 'red';
        };

        const onmouseup = function (e) {
            // console.log(e.type, e.target, self, selected);
            if (settings.stop(e, selected) === false) {
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

            // selected.style['background-color'] = 'white';
            selected = null;

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
                        cScrN = -document.documentElement.scrollLeft;
                        cScrW = -document.documentElement.scrollTop;
                        cScrS = getDocHeight();
                        cScrE = getDocWidth();
                        // console.log(cScrN, cScrW, cScrS, cScrE);
                    } else if (settings.containment === 'window') {
                        cScrN = 0;
                        cScrW = 0;
                        cScrS = window.innerHeight;
                        cScrE = window.innerWidth;
                        // console.log(cScrN, cScrW, cScrS, cScrE);
                    } else {
                        containment = document.querySelector(settings.containment);
                    }
                } else if (Array.isArray(settings.containment)) {
                    cScrW = settings.containment[0];
                    cScrN = settings.containment[1];
                    cScrE = settings.containment[2];
                    cScrS = settings.containment[3];
                } else if (typeof settings.containment === 'object') {
                    if (settings.containment instanceof NodeList) {
                        containment = settings.containment;
                    } else if (settings.containment instanceof Node) {
                        containment = [settings.containment];
                    }
                }

                if (containment && typeof containment === 'object') {
                    const containerStyles = getComputedStyle(containment);
                    cbn = parseInt(containerStyles["border-top-width"]);
                    cbe = parseInt(containerStyles["border-right-width"]);
                    cbs = parseInt(containerStyles["border-bottom-width"]);
                    cbw = parseInt(containerStyles["border-left-width"]);

                    const hb = containment.getBoundingClientRect();
                    cScrN = hb.top;
                    cScrE = hb.right;
                    cScrS = hb.bottom;
                    cScrW = hb.left;

                    cpn = parseInt(containerStyles["padding-top"]);
                    cpe = parseInt(containerStyles["padding-right"]);
                    cps = parseInt(containerStyles["padding-bottom"]);
                    cpw = parseInt(containerStyles["padding-left"]);
                    // console.log(cpn, cpe, cps, cpw);
                }
                sbn = parseInt(nodeStyles["border-top-width"]);
                sbe = parseInt(nodeStyles["border-right-width"]);
                sbs = parseInt(nodeStyles["border-bottom-width"]);
                sbw = parseInt(nodeStyles["border-left-width"]);

                spn = parseInt(nodeStyles["padding-top"]);
                spe = parseInt(nodeStyles["padding-right"]);
                sps = parseInt(nodeStyles["padding-bottom"]);
                spw = parseInt(nodeStyles["padding-left"]);
                // console.log(spn, spe, sps, spw);
            }

            const parent = node.offsetParent || document.body;
            const parentStyles = getComputedStyle(parent);

            // console.log(parent, self.offsetParent);
            const pb = parent.getBoundingClientRect();
            pScrN = pb.top;
            pScrE = pb.right;
            pScrS = pb.bottom;
            pScrW = pb.left;
            // console.log(pScrN, pScrE, pScrS, pScrW);

            pbn = parseInt(parentStyles["border-top-width"]);
            pbe = parseInt(parentStyles["border-right-width"]);
            pbs = parseInt(parentStyles["border-bottom-width"]);
            pbw = parseInt(parentStyles["border-left-width"]);
            // console.log(pbn, pbe, pbs, pbw);

            ppn = parseInt(parentStyles["padding-top"]);
            ppe = parseInt(parentStyles["padding-right"]);
            pps = parseInt(parentStyles["padding-bottom"]);
            ppw = parseInt(parentStyles["padding-left"]);
            // console.log(ppn, ppe, pps, ppw);

            smn = parseInt(nodeStyles["margin-top"]);
            sme = parseInt(nodeStyles["margin-right"]);
            sms = parseInt(nodeStyles["margin-bottom"]);
            smw = parseInt(nodeStyles["margin-left"]);
            // console.log(smn, sme, sms, smw);

            const selfbcr = selected.getBoundingClientRect();
            scrN = selfbcr.top;
            scrE = selfbcr.right;
            scrS = selfbcr.bottom;
            scrW = selfbcr.left;
            // console.log(scrN, scrE, scrS, scrW);

            // selfW = parseInt(getComputedStyle(self)['left'));
            // selfE = parseInt(getComputedStyle(self)['right'));
            // selfN = parseInt(getComputedStyle(self)['top'));
            // selfS = parseInt(getComputedStyle(self)['bottom'));
            // console.log(selfN, selfE, selfS, selfW);

            if (nodeStyles['position'] === 'relative') {
                selfW = parseInt(nodeStyles['left'] === 'auto' ? '0' : nodeStyles['left']);
                selfE = parseInt(nodeStyles['right'] === 'auto' ? '0' : nodeStyles['right']);
                selfN = parseInt(nodeStyles['top'] === 'auto' ? '0' : nodeStyles['top']);
                selfS = parseInt(nodeStyles['bottom'] === 'auto' ? '0' : nodeStyles['bottom']);
                // console.log(selfN, selfE, selfS, selfW, self.style['position'));
            } else if (nodeStyles['position'] === 'absolute') {
                selfW = scrW - pScrW - smw - pbw;
                selfN = scrN - pScrN - smn - pbn;
                selfE = -scrE + pScrE - sme - pbe;
                selfS = -scrS + pScrS - sms - pbs;
            } else if (nodeStyles['position'] === 'fixed') {
                selfW = scrW - smw;
                selfN = scrN - smn;
            }

            selfWidth = selfbcr.width;
            selfHeight = selfbcr.height;
            // console.log(selfWidth + ', ' + selfHeight);

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

            // only move the selected one, not any of it's ancestors.
            if (e.target.closest('.azDraggable') !== node) {
                return;
            }

            if (settings.create(e, node) === false) {
                return;
            }
            selected = node;

            mouseX = e.clientX || e.touches[0].clientX;
            mouseY = e.clientY || e.touches[0].clientY;
            if (settings.handle) {
                let handle = settings.handle;
                if (typeof settings.handle === 'string') {
                    handle = node.querySelector(settings.handle);
                }
                if (handle) {
                    const hb = handle.getBoundingClientRect();
                    if (isOutside(mouseX, mouseY, hb)) {
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
};