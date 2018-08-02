import {
    Base
} from '../utilities/core.js';
import {
    getHeight,
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
        const self = this;
        const settings = Object.assign({
            className: 'azSortableItem',
            placeholder: true,
            escapable: false,
            create: function (event, ui, self) {
                // console.log('create', ui);
            },
            start: function (event, ui, self) {
                // console.log('start', ui);
            },
            sort: function (event, data, self) {
                // console.log('sort', data);
            },
            escape: function (event, ui, self) {
                // console.log('escape', ui);
            },
            capture: function (event, ui, self) {
                // console.log('capture', ui);
            },
            stop: function (event, data, self) {
                // console.log('stop', data);
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
            if (settings.create(e, target, self) === false) {
                return false;
            }
        };

        const onDragStart = function (e, target) {
            selected = target;
            if (settings.start(e, selected, self) === false) {
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

        const onOverTargetCenter = function (e, data) {
            if (settings.sort(e, data, self) === false) {
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
            if (settings.sort(e, data, self) === false) {
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

        const onDragStop = function (e, target, escaped) {
            // console.log(selected, ph);
            const data = {
                source: selected,
                target: ph,
                boundingClientRect: target.getBoundingClientRect(),
                escaped: escaped,
            };
            if (selected) {
                selected.classList.remove('azSortableSelected');
                selected.classList.remove('azSortableAllow');
                selected.classList.remove('azSortableDeny');
                if (ph) {
                    if (settings.placeholder) {
                        insertAfter(selected, ph);
                        ph.parentNode.removeChild(ph);
                        target.style.position = 'relative';
                    } else {
                        ph.classList.remove('azSortableDropBefore');
                        ph.classList.remove('azSortableDropAfter');
                        if (index(selected) < index(ph)) {
                            insertAfter(selected, ph);
                        } else {
                            insertBefore(selected, ph);
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

            if (settings.stop(e, data, self) === false) {
                return false;
            }
        };

        const dropKey = randGen(8);

        this.dragConfig = {
            containment: node,
            resist: 10,
            escapable: settings.escapable,
            escape: settings.escape,
            capture: settings.capture,
            create: onDragCreate,
            start: onDragStart,
            // drag: onDrag,
            stop: (event, ui, draggable) => {
                onDragStop(event, ui, draggable.escaped);
            },
            dropKey: dropKey,
            triggerDropEvents: true,
        };

        this.dropConfig = {
            key: dropKey,
            target_center_in: function (e) {
                // console.log('target_center_in', e);
                onOverTargetCenter(e, e.detail);
            },
            target_center_out: function (e) {
                // console.log('target_center_out', e);
                onLeaveTargetCenter(e, e.detail.source);
            },
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