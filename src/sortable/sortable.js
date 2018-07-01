import {
    Base
} from '../utilities/core.js';
import {
    dndStateConsts,
    getDropTargets,
    getHeight,
    getPositionState,
    getWidth,
    index,
    insertAfter,
    insertBefore,
    matches,
    position,
    randGen,
    setHeight,
    setWidth,
    siblings,
    swapElement
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

        this.settings = settings;

        const node = this.node;
        node.classList.add('azSortable');

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

            target.style['z-index'] = ++z;
            selected.classList.add('azSortableSelected');

            if (settings.placeholder) {
                ph = target.cloneNode(false);
                ph.removeAttribute('id');
                ph.classList.add('az-placeholder');
                ph.style['visibility'] = 'hidden';

                const w = getWidth(selected);
                const h = getHeight(selected);
                const offsetTop = position(selected).top + node.scrollTop;
                const offsetLeft = position(selected).left + node.scrollLeft;
                // console.log(offsetLeft);
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
            if (settings.stop(e, {
                    source: selected,
                    target: ph
                }) === false) {
                return false;
            }
            setTimeout(() => {
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

        const dropKey = randGen(8);

        this.dragConfig = {
            containment: node,
            resist: 10,
            escape: true,
            create: onDragCreate,
            start: onDragStart,
            drag: onDrag,
            stop: onDragStop,
            dropKey: dropKey
        };

        this.dropConfig = {
            key: dropKey
        };
        const items = Array.prototype.filter.call(node.children, n => matches(n, '.' + settings.className));
        items.forEach(item => {
            azui.Draggable(item, this.dragConfig);
            azui.Droppable(item, this.dropConfig);
        });
    }

    add(elem) {
        this.node.appendChild(elem);
        elem.classList.add(this.settings.className);
        azui.Draggable(elem, this.dragConfig);
        azui.Droppable(elem, this.dropConfig);
    }
};