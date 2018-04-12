import {
    Base
} from '../utilities/core.js';
import {
    swapElement,
    getPositionState,
    getDropTargets,
    dropTargetStates,
    dndStateConsts,
    randGen,
    randGenConsts,
    getWidth,
    getHeight,
    setWidth,
    setHeight,
    insertAfter,
    insertBefore,
    siblings,
    index,
    matches,
    position,
} from '../utilities/utilities.js';

azui.Sortable = function (el, options) {
    return new Sortable(el, options);
};

class Sortable extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({
            className: 'azSortableItem',
            placeholder: true,
            create: function (event, ui) {
                // console.log('create', ui);
            },
            start: function (event, ui) {
                // console.log('start', ui);
            },
            sort: function (event, ui) {
                // console.log('sort', ui);
            },
            stop: function (event, ui) {
                // console.log('stop', ui);
            },
        }, options);

        for (const node of this.nodeList) {
            const self = node;
            self.classList.add('azSortable');

            let dropTargetCenterStates = {};

            let selected;
            let ph;
            let z = 0;

            const onDragCreate = function (e, target) {
                if (settings.create(e, target) === false) {
                    return false;
                }
            };

            const onDragStart = function (e, target) {
                selected = target;
                if (settings.start(e, selected) === false) {
                    return false;
                }
                dropTargetCenterStates = {};

                // const mn = parseInt(selected.css('margin-top'));
                // const me = parseInt(selected.css('margin-right'));
                // const ms = parseInt(selected.css('margin-bottom'));
                // const mw = parseInt(selected.css('margin-left'));

                // const pn = parseInt(self.css('padding-top'));
                // const pe = parseInt(self.css('padding-right'));
                // const ps = parseInt(self.css('padding-bottom'));
                // const pw = parseInt(self.css('padding-left'));
                target.style['z-index'] = ++z;
                selected.classList.add('azSortableSelected');

                if (settings.placeholder) {
                    ph = target.cloneNode(false);
                    ph.style['visibility'] = 'hidden';

                    const w = getWidth(selected);
                    const h = getHeight(selected);
                    const offsetTop = position(selected).top;
                    const offsetLeft = position(selected).left;
                    // console.log(offsetTop, offsetLeft);
                    // ph.css('background-color', 'red');

                    target.style.position = 'absolute';
                    target.style.top = offsetTop + 'px';
                    target.style.left = offsetLeft + 'px';
                    target.style.right = 'auto';
                    target.style.bottom = 'auto';
                    setWidth(selected, w);
                    setHeight(selected, h);
                    // selected.after(ph);
                    insertAfter(ph, selected);
                } else {
                    selected.classList.add('azSortableDeny');
                }
            };

            const onDrag = function (e, target) {
                let currentState = false;
                let changed = false;
                const source = target;
                const dts = getDropTargets(dropKey).filter(dt => dt !== target);
                for (let dt of dts) {
                    const eventData = {
                        source,
                        target: dt
                    };
                    const dropId = dt.getAttribute('az-drop-id');
                    const oState = dropTargetCenterStates[dropId];
                    const state = getPositionState(target, dt);
                    // console.log(state);
                    const nState = state & dndStateConsts.target_center;
                    // console.log(oState, nState);
                    dropTargetCenterStates[dropId] = nState;
                    if (nState) {
                        currentState = true;
                    }
                    if (oState !== nState) {
                        changed = true;
                    }

                    if (oState !== nState || !currentState) {
                        if (nState) {
                            // console.log('target center in');
                            onOverTargetCenter(e, eventData);
                            return;
                        }
                    }
                }
                if (changed && !currentState) {
                    // console.log('target center out');
                    onLeaveTargetCenter(e, {
                        source,
                    });
                }
            };

            const onOverTargetCenter = function (e, data) {
                if (settings.sort(e, data) === false) {
                    return false;
                }
                if (settings.placeholder) {
                    swapElement(ph, data.target);
                } else {
                    siblings(data.target).forEach(el => el.classList.remove('azSortableDropAfter'));
                    siblings(data.target).forEach(el => el.classList.remove('azSortableDropBefore'));
                    data.target.classList.add(index(selected) < index(data.target) ? 'azSortableDropAfter' : 'azSortableDropBefore');
                    selected.classList.remove('azSortableDeny');
                    selected.classList.add('azSortableAllow');
                    ph = data.target;
                }
            };

            const onLeaveTargetCenter = function (e, data) {
                if (settings.sort(e, data) === false) {
                    return false;
                }
                if (!settings.placeholder) {
                    siblings(selected).forEach(el => el.classList.remove('azSortableDropAfter'));
                    siblings(selected).forEach(el => el.classList.remove('azSortableDropBefore'));
                    selected.classList.remove('azSortableAllow');
                    selected.classList.add('azSortableDeny');
                    ph = null;
                }
            };

            const onDragStop = function (e, target) {
                // console.log(selected, ph);
                setTimeout(() => {
                    if (settings.stop(e, {
                            source: selected,
                            target: ph
                        }) === false) {
                        return false;
                    }
                    if (selected) {
                        selected.classList.remove('azSortableSelected');
                        selected.classList.remove('azSortableAllow');
                        selected.classList.remove('azSortableDeny');
                        if (ph) {
                            if (settings.placeholder) {
                                // ph.after(selected);
                                insertAfter(selected, ph);
                                ph.parentNode.removeChild(ph);
                                target.style.position = 'relative';
                            } else {
                                ph.classList.remove('azSortableDropBefore');
                                ph.classList.remove('azSortableDropAfter');
                                if (index(selected) < index(ph)) {
                                    insertAfter(selected, ph);
                                    // ph.after(selected);
                                } else {
                                    insertBefore(selected, ph);
                                    // ph.before(selected);
                                }
                            }
                            ph = null;
                        }
                        selected = null;
                    }
                    target.style.top = 0;
                    target.style.left = 0;
                    target.style.right = 0;
                    target.style.bottom = 0;
                });
            };

            const dropKey = randGen(8, randGenConsts.LowerUpperDigit, '', '');

            const dragConfig = {
                containment: self,
                resist: 10,
                create: onDragCreate,
                start: onDragStart,
                drag: onDrag,
                stop: onDragStop,
                dropKey: dropKey
            };
            azui.Draggable(Array.prototype.filter.call(self.children, n => matches(n, '.' + settings.className)), dragConfig);

            const dropConfig = {
                key: dropKey
            };
            azui.Droppable(Array.prototype.filter.call(self.children, n => matches(n, '.' + settings.className)), dropConfig);

            self.addEventListener('add', function (e, elem) {
                elem.classList.add(settings.className);
                azui.Draggable(elem, dragConfig);
                azui.Droppable(elem, dropConfig);
            });
        }
    }
};