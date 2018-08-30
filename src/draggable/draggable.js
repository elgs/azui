import {
    azObj,
    Base
} from '../utilities/core.js';
import {
    getDocHeight,
    getDocScrollLeft,
    getDocScrollTop,
    getDocWidth,
    getPositionState,
    isOutside,
    isTouchDevice
} from '../utilities/utilities.js';

azui.Draggable = function (el, options, init = true) {
    // return new Draggable(el, options);
    return azObj(Draggable, el, options, init);
};

class Draggable extends Base {
    // constructor(el, options) {
    //     super(el);
    azInit(options) {
        const me = this;
        const settings = Object.assign({
            handle: false,
            axis: false,
            containment: false,
            resist: false,
            opacity: false,
            // triggerDropEvents: false,
            create: function (event, ui, me) {
                // console.log('create', ui);
            },
            start: function (event, ui, me) {
                // console.log('start', ui);
            },
            drag: function (event, ui, me) {
                // console.log('drag', ui);
            },
            stop: function (event, ui, me) {
                // console.log('stop', ui);
            },
        }, options);

        const node = this.node;
        me.settings = settings;
        node.classList.add('azDraggable');

        const dropTargetStates = {};
        me.position = getComputedStyle(node)['position'];
        if (me.position !== 'absolute' && me.position !== 'fixed') {
            node.style['position'] = 'relative';
        }
        me.position = getComputedStyle(node)['position'];

        // console.log(me.style['position'));
        let savedZIndex;

        me.escapeX = false;
        me.escapeY = false;

        me.dropTargets = null;
        me.selected = null;
        let mouseX0 = 0;
        let mouseY0 = 0;
        me.containerBoundaries = null;
        me.mouseX = 0;
        me.mouseY = 0;
        me.meN = 0;
        me.meE = 0;
        me.meS = 0;
        me.meW = 0;
        me.meWidth = 0;
        me.meHeight = 0;
        // me n, e, s, w, parent n, e ,s, w, contaner n, e, s, w
        me.scrN = undefined;
        me.scrE = undefined;
        me.scrS = undefined;
        me.scrW = undefined;
        me.pScrN = undefined;
        me.pScrE = undefined;
        me.pScrS = undefined;
        me.pScrW = undefined;
        me.cScrN = undefined;
        me.cScrE = undefined;
        me.cScrS = undefined;
        me.cScrW = undefined;

        me.cbn = 0;
        me.cbe = 0;
        me.cbs = 0;
        me.cbw = 0; // container borders
        me.cpn = 0;
        me.cpe = 0;
        me.cps = 0;
        me.cpw = 0; // container paddings
        me.pbn = 0;
        me.pbe = 0;
        me.pbs = 0;
        me.pbw = 0; // offset parent borders
        me.ppn = 0;
        me.ppe = 0;
        me.pps = 0;
        me.ppw = 0; // offset parent paddings
        me.smn = 0;
        me.sme = 0;
        me.sms = 0;
        me.smw = 0; // me margin
        let resisted = false;
        let started = false;

        const onmousemove = function (e) {
            // console.log(e.type, e.currentTarget, me);
            // console.log(e.currentTarget);
            if (!me.selected) {
                return;
            }
            if (!started) {
                if (settings.start(e, me.selected, me) === false) {
                    return false;
                }
                // console.log(settings.containment);
                me.setContainment(settings.containment);
                // me.style['cursor', 'pointer');
                if (settings.opacity) {
                    node.style['opacity'] = settings.opacity;
                }
                started = true;

                const dts = me.dropTargets;
                dts.filter(dt => dt !== node).map(dt => {
                    // console.log(me, elem);
                    // const dropId = dt.getAttribute('drop-id');
                    const ps = getPositionState(node, dt, e);
                    // console.log(ps);
                    const interestedDropEvents = dt.getAttribute('az-interested-drop-events') * 1;
                    if (azui.constants.dndEventConsts.dragged & interestedDropEvents) {
                        dt.dispatchEvent(new CustomEvent('dragged', {
                            detail: {
                                source: node,
                                target: dt,
                                state: ps
                            }
                        }));
                    }
                });
            }

            if (settings.drag(e, me.selected, me) === false) {
                return false;
            }
            me.mouseX = e.pageX || e.touches[0].pageX;
            me.mouseY = e.pageY || e.touches[0].pageY;
            const dx = me.mouseX - mouseX0;
            const dy = me.mouseY - mouseY0;
            // console.log(dx, dy);
            if (!resisted && Math.abs(dx) < settings.resist && Math.abs(dy) < settings.resist) {
                return;
            }
            resisted = true;
            // console.log(dx, dy);

            // console.log(me.escapeX, me.escapeY);

            if (settings.axis === 'x') {
                me.moveX(dx);
            } else if (settings.axis === 'y') {
                me.moveY(dy);
            } else {
                me.moveX(dx);
                me.moveY(dy);
            }

            const dts = me.dropTargets;
            dts.filter(dt => dt !== node).map(dt => {
                // console.log(me, elem);
                const dropId = dt.getAttribute('az-obj-id-droppable');
                const interestedDropEvents = dt.getAttribute('az-interested-drop-events') * 1;
                const oldPs = dropTargetStates[dropId];
                const ps = getPositionState(node, dt, e);
                dropTargetStates[dropId] = ps;
                if (oldPs != undefined && oldPs !== ps) {
                    Object.keys(azui.constants.dndStateConsts).map(state => {
                        const nState = ps & azui.constants.dndStateConsts[state];
                        const oState = oldPs & azui.constants.dndStateConsts[state];
                        // console.log(nState, oState);
                        if (nState !== oState) {
                            const eventName = state + (!!nState ? '_in' : '_out');
                            if (azui.constants.dndEventConsts[eventName] & interestedDropEvents) {
                                dt.dispatchEvent(new CustomEvent(eventName, {
                                    detail: {
                                        source: node,
                                        target: dt,
                                        previousState: oldPs,
                                        state: ps
                                    }
                                }));
                            }
                        }
                    });
                }
            });
            // me.selected.style['background-color'] = 'red';
        };

        const onmouseup = function (e) {
            // console.log(e.type, e.target, me, me.selected);
            if (started && settings.stop(e, me.selected, me) === false) {
                return false;
            }
            started = false;
            resisted = false;
            node.style['z-index'] = savedZIndex;
            // console.log('up:', me.style['z-index']);

            // me.style['cursor', 'default');
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

            // me.selected.style['background-color'] = 'white';
            me.selected = null;

            const dts = me.dropTargets;
            dts.filter(dt => dt !== node).map(dt => {
                // console.log(me, elem);
                // const dropId = dt.getAttribute('drop-id');
                const ps = getPositionState(node, dt, e);
                // console.log(ps);
                const interestedDropEvents = dt.getAttribute('az-interested-drop-events') * 1;
                if (azui.constants.dndEventConsts.dropped & interestedDropEvents) {
                    dt.dispatchEvent(new CustomEvent('dropped', {
                        detail: {
                            source: node,
                            target: dt,
                            state: ps
                        }
                    }));
                }
            });
            me.dropTargets = null;
            // return false;
        };

        const onmousedown = function (e) {
            // console.log(e.type, e.target, me);
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

            // only move the me.selected one, not any of it's ancestors.
            if (e.target.closest('.azDraggable') !== node) {
                return;
            }

            if (settings.create(e, node, me) === false) {
                return;
            }
            me.selected = node;

            me.mouseX = mouseX0 = e.pageX || e.touches[0].pageX;
            me.mouseY = mouseY0 = e.pageY || e.touches[0].pageY;
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

            me.dropTargets = [...document.querySelectorAll('.azDropTarget')];
        };

        if (isTouchDevice()) {
            me.replaceEventListener('touchstart', 'touchstart', onmousedown);
        }
        me.replaceEventListener('mousedown', 'mousedown', onmousedown);
    }


    setContainment(containment) {
        const me = this;
        const node = this.node;
        const nodeStyles = getComputedStyle(node);

        let container;
        if (containment) {
            if (typeof containment === 'string') {
                if (containment === 'parent') {
                    container = node.parentNode;
                } else if (containment === 'document') {
                    // me.cScrN = -document.documentElement.scrollLeft;
                    // me.cScrW = -document.documentElement.scrollTop;
                    me.cScrN = -getDocScrollLeft();
                    me.cScrW = -getDocScrollTop();
                    me.cScrS = getDocHeight();
                    me.cScrE = getDocWidth();
                    // console.log(me.cScrN, me.cScrW, me.cScrS, me.cScrE);
                } else if (containment === 'window') {
                    me.cScrN = 0;
                    me.cScrW = 0;
                    me.cScrS = window.innerHeight;
                    me.cScrE = window.innerWidth;
                    // console.log(me.cScrN, me.cScrW, me.cScrS, me.cScrE);
                } else {
                    container = document.querySelector(containment);
                }
            } else if (Array.isArray(containment)) {
                me.cScrW = containment[0];
                me.cScrN = containment[1];
                me.cScrE = containment[2];
                me.cScrS = containment[3];
            } else if (typeof containment === 'object') {
                if (containment instanceof NodeList) {
                    container = containment[0];
                } else if (containment instanceof Node) {
                    container = containment;
                }
            }

            if (container && typeof container === 'object') {
                const containerStyles = getComputedStyle(container);
                me.cbn = parseInt(containerStyles["border-top-width"]);
                me.cbe = parseInt(containerStyles["border-right-width"]);
                me.cbs = parseInt(containerStyles["border-bottom-width"]);
                me.cbw = parseInt(containerStyles["border-left-width"]);

                const containerBoundaries = container.getBoundingClientRect();
                me.containerBoundaries = containerBoundaries;
                me.cScrN = containerBoundaries.top + getDocScrollTop();
                me.cScrE = containerBoundaries.right + getDocScrollLeft();
                me.cScrS = containerBoundaries.bottom + getDocScrollTop();
                me.cScrW = containerBoundaries.left + getDocScrollLeft();

                me.cpn = parseInt(containerStyles["padding-top"]);
                me.cpe = parseInt(containerStyles["padding-right"]);
                me.cps = parseInt(containerStyles["padding-bottom"]);
                me.cpw = parseInt(containerStyles["padding-left"]);
                // console.log(me.cpn, me.cpe, me.cps, me.cpw);
            }
        }

        const parent = node.offsetParent || document.body;
        // console.log(parent);
        const parentStyles = getComputedStyle(parent);
        const pp = parentStyles['position'];
        if (pp !== 'relative' && pp !== 'absolute' && pp !== 'fixed') {
            parent.style['position'] = 'relative';
        }

        // console.log(parent, me.offsetParent);
        const pb = parent.getBoundingClientRect();
        me.pScrN = pb.top + getDocScrollTop();
        me.pScrE = pb.right + getDocScrollLeft();
        me.pScrS = pb.bottom + getDocScrollTop();
        me.pScrW = pb.left + getDocScrollLeft();
        // console.log(me.pScrN, me.pScrE, me.pScrS, me.pScrW);

        me.pbn = parseInt(parentStyles["border-top-width"]);
        me.pbe = parseInt(parentStyles["border-right-width"]);
        me.pbs = parseInt(parentStyles["border-bottom-width"]);
        me.pbw = parseInt(parentStyles["border-left-width"]);
        // console.log(me.pbn, me.pbe, me.pbs, me.pbw);

        me.ppn = parseInt(parentStyles["padding-top"]);
        me.ppe = parseInt(parentStyles["padding-right"]);
        me.pps = parseInt(parentStyles["padding-bottom"]);
        me.ppw = parseInt(parentStyles["padding-left"]);
        // console.log(me.ppn, me.ppe, me.pps, me.ppw);

        me.smn = parseInt(nodeStyles["margin-top"]);
        me.sme = parseInt(nodeStyles["margin-right"]);
        me.sms = parseInt(nodeStyles["margin-bottom"]);
        me.smw = parseInt(nodeStyles["margin-left"]);
        // console.log(me.smn, me.sme, me.sms, me.smw);

        const mebcr = me.selected.getBoundingClientRect();
        me.scrN = mebcr.top + getDocScrollTop();
        me.scrE = mebcr.right + getDocScrollLeft();
        me.scrS = mebcr.bottom + getDocScrollTop();
        me.scrW = mebcr.left + getDocScrollLeft();
        // console.log(me.scrN, me.scrE, me.scrS, me.scrW);

        // me.meW = parseInt(getComputedStyle(me)['left'));
        // me.meE = parseInt(getComputedStyle(me)['right'));
        // me.meN = parseInt(getComputedStyle(me)['top'));
        // me.meS = parseInt(getComputedStyle(me)['bottom'));
        // console.log(me.meN, me.meE, me.meS, me.meW);

        if (nodeStyles['position'] === 'relative') {
            me.meW = parseInt(nodeStyles['left'] === 'auto' ? '0' : nodeStyles['left']);
            me.meE = parseInt(nodeStyles['right'] === 'auto' ? '0' : nodeStyles['right']);
            me.meN = parseInt(nodeStyles['top'] === 'auto' ? '0' : nodeStyles['top']);
            me.meS = parseInt(nodeStyles['bottom'] === 'auto' ? '0' : nodeStyles['bottom']);
            // console.log(me.meN, me.meE, me.meS, me.meW, me.style['position'));
        } else if (nodeStyles['position'] === 'absolute') {
            me.meW = me.scrW - me.pScrW - me.smw - me.pbw;
            me.meN = me.scrN - me.pScrN - me.smn - me.pbn;
            me.meE = -me.scrE + me.pScrE - me.sme - me.pbe;
            me.meS = -me.scrS + me.pScrS - me.sms - me.pbs;
        } else if (nodeStyles['position'] === 'fixed') {
            me.meW = me.scrW - me.smw - getDocScrollLeft();
            me.meN = me.scrN - me.smn - getDocScrollTop();
        }

        me.meWidth = mebcr.width;
        me.meHeight = mebcr.height;
        // console.log(me.meWidth + ', ' + me.meHeight);
    }

    moveX(by) {
        const me = this;
        if (me.position === 'absolute') {
            me.moveAbsoluteX(by);
        } else if (me.position === 'relative') {
            me.moveRelativeX(by);
        } else if (me.position === 'fixed') {
            me.moveFixedX(by);
        }
    }

    moveY(by) {
        const me = this;
        if (me.position === 'absolute') {
            me.moveAbsoluteY(by);
        } else if (me.position === 'relative') {
            me.moveRelativeY(by);
        } else if (me.position === 'fixed') {
            me.moveFixedY(by);
        }
    }

    moveAbsoluteX(dx) {
        const me = this;
        if (me.cScrW === undefined || me.escapeX) {
            me.selected.style.right = 'auto';
            me.selected.style.left = (me.meW + dx) + 'px';
        } else {
            if (-dx > me.scrW - me.cScrW - me.cbw - me.cpw - me.smw) {
                // console.log('hit left wall');
                const di = me.cScrW + me.cbw + me.cpw - (me.pScrW + me.pbw + me.ppw);
                me.selected.style.right = 'auto';
                me.selected.style.left = me.ppw + di + 'px';
            } else if (dx > me.cScrE - me.scrE - me.cbe - me.cpe - me.sme) {
                // console.log('hit right wall');
                const di = me.cScrE - me.cbe - me.cpe - (me.pScrE - me.pbe - me.ppe);
                me.selected.style.left = 'auto';
                me.selected.style.right = me.ppe - di + 'px';
            } else {
                me.selected.style.right = 'auto';
                me.selected.style.left = (me.meW + dx) + 'px';
            }
        }
    }

    moveAbsoluteY(dy) {
        const me = this;
        if (me.cScrW === undefined || me.escapeY) {
            me.selected.style.bottom = 'auto';
            me.selected.style.top = (me.meN + dy) + 'px';
        } else {
            if (-dy > me.scrN - me.cScrN - me.cbn - me.cpn - me.smn) {
                // console.log('hit ceiling');
                const di = me.cScrN + me.cbn + me.cpn - (me.pScrN + me.pbn + me.ppn);
                me.selected.style.bottom = 'auto';
                me.selected.style.top = me.ppn + di + 'px';
            } else if (dy > me.cScrS - me.scrS - me.cbs - me.cps - me.sms) {
                // console.log('hit floor');
                const di = me.cScrS - me.cbs - me.cps - (me.pScrS - me.pbs - me.pps);
                me.selected.style.top = 'auto';
                me.selected.style.bottom = me.pps - di + 'px';
            } else {
                me.selected.style.bottom = 'auto';
                me.selected.style.top = (me.meN + dy) + 'px';
            }
        }
    }

    moveFixedX(dx) {
        const me = this;
        if (me.cScrW === undefined || me.escapeX) {
            me.selected.style.right = 'auto';
            me.selected.style.left = (me.meW + dx) + 'px';
        } else {
            if (-dx > me.scrW - me.cScrW - me.cbw - me.cpw - me.smw) {
                // console.log('hit left wall');
                me.selected.style.right = 'auto';
                me.selected.style.left = me.cScrW + me.cbw + me.cpw + 'px';
            } else if (dx > me.cScrE - me.scrE - me.cbe - me.cpe - me.sme) {
                // console.log('hit right wall');
                me.selected.style.right = 'auto';
                me.selected.style.left = me.cScrE - me.cbe - me.cpe - me.meWidth - me.smw - me.sme + 'px';
            } else {
                me.selected.style.right = 'auto';
                me.selected.style.left = (me.meW + dx) + 'px';
            }
        }
    }

    moveFixedY(dy) {
        const me = this;
        if (me.cScrW === undefined || me.escapeY) {
            me.selected.style.bottom = 'auto';
            me.selected.style.top = (me.meN + dy) + 'px';
        } else {
            if (-dy > me.scrN - me.cScrN - me.cbn - me.cpn - me.smn) {
                // console.log('hit ceiling');
                me.selected.style.bottom = 'auto';
                me.selected.style.top = me.cScrN + me.cbn + me.cpn + 'px';
            } else if (dy > me.cScrS - me.scrS - me.cbs - me.cps - me.sms) {
                // console.log('hit floor');
                me.selected.style.bottom = 'auto';
                me.selected.style.top = me.cScrS - me.cbs - me.cps - me.meHeight - me.smn - me.sms + 'px';
            } else {
                me.selected.style.bottom = 'auto';
                me.selected.style.top = (me.meN + dy) + 'px';
            }
        }
    }

    moveRelativeX(dx) {
        const me = this;
        if (me.cScrW === undefined || me.escapeX) {
            me.selected.style.right = 'auto';
            me.selected.style.left = (me.meW + dx) + 'px';
        } else {
            if (-dx > me.scrW - me.cScrW - me.cbw - me.cpw - me.smw) {
                // console.log('hit left wall');
                me.selected.style.right = 'auto';
                me.selected.style.left = -(me.scrW - me.cScrW - me.cbw - me.cpw - me.smw) + me.meW + 'px';
            } else if (dx > me.cScrE - me.scrE - me.cbe - me.cpe - me.sme) {
                // console.log('hit right wall');
                me.selected.style.left = 'auto';
                me.selected.style.right = -(me.cScrE - me.scrE - me.cbe - me.cpe - me.sme) + me.meE + 'px';
            } else {
                me.selected.style.right = 'auto';
                me.selected.style.left = (me.meW + dx) + 'px';
            }
        }
    };
    moveRelativeY(dy) {
        const me = this;
        if (me.cScrW === undefined || me.escapeY) {
            me.selected.style.bottom = 'auto';
            me.selected.style.top = (me.meN + dy) + 'px';
        } else {
            if (-dy > me.scrN - me.cScrN - me.cbn - me.cpn - me.smn) {
                // console.log('hit ceiling');
                me.selected.style.bottom = 'auto';
                me.selected.style.top = -(me.scrN - me.cScrN - me.cbn - me.cpn - me.smn) + me.meN + 'px';
            } else if (dy > me.cScrS - me.scrS - me.cbs - me.cps - me.sms) {
                // console.log('hit floor');
                me.selected.style.top = 'auto';
                me.selected.style.bottom = -(me.cScrS - me.scrS - me.cbs - me.cps - me.sms) + me.meS + 'px';
                // console.log(me.cScrS, me.scrS, me.cbs, me.cps, me.sms, me.meS);
            } else {
                me.selected.style.bottom = 'auto';
                me.selected.style.top = (me.meN + dy) + 'px';
            }
        }
    }
}