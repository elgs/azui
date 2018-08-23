import {
    azObj,
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
    setHeight,
    setWidth,
    siblings,
    swapElement,
    remove,
} from '../utilities/utilities.js';

azui.Sortable = function (el, options) {
    // return new Sortable(el, options);
    return azObj(Sortable, el, options);
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
            stop: function (event, data, self) {
                // console.log('stop', data);
            },
        }, options);

        this.settings = settings;

        const node = this.node;
        node.classList.add('azSortable');

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
                siblings(data.target).forEach(el => el.classList.remove('azSortableDropAfter', 'azSortableDropBefore'));
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
                siblings(selected).forEach(el => el.classList.remove('azSortableDropAfter', 'azSortableDropBefore'));
                selected.classList.remove('azSortableAllow');
                selected.classList.add('azSortableDeny');
                ph = null;
            }
        };

        const onDragStop = function (e, target, draggable) {
            // console.log(selected, target, ph);
            const data = {
                source: selected,
                target: ph,
                boundingClientRect: target.getBoundingClientRect(),
                escaped: draggable.escapeX || draggable.escapeY,
            };
            if (selected) {
                selected.classList.remove('azSortableSelected');
                selected.classList.remove('azSortableAllow');
                selected.classList.remove('azSortableDeny');
                if (ph) {
                    if (settings.placeholder) {
                        insertAfter(selected, ph);
                        remove(ph);
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
            // console.log(selected, target, ph);
            target.style.top = 0;
            target.style.left = 0;
            target.style.right = 0;
            target.style.bottom = 0;

            if (settings.stop(e, data, self) === false) {
                return false;
            }
        };

        if (settings.escapable) {
            azui.Droppable(node, {
                interestedDropEvents: azui.constants.dndEventConsts.pointer_in |
                    azui.constants.dndEventConsts.pointer_out,
                pointer_in: function (e) {
                    console.log(e);
                    // const draggable = azui.Draggable(e.detail.source);
                    // draggable.escapeX = false;
                    // draggable.escapeY = false;
                    // azui.Draggable(e.detail.source).setContainment(e.detail.target);
                },
                pointer_out: function (e) {
                    console.log(e);
                    // const draggable = azui.Draggable(selected);
                    // draggable.escapeX = true;
                    // draggable.escapeY = true;
                },
            });
        }

        this.dragConfig = {
            containment: node,
            resist: 10,
            create: onDragCreate,
            start: onDragStart,
            // drag: onDrag,
            stop: (event, ui, draggable) => {
                onDragStop(event, ui, draggable);
            },
        };

        this.dropConfig = {
            interestedDropEvents: azui.constants.dndEventConsts.target_center_in |
                azui.constants.dndEventConsts.target_center_out,
            target_center_in: function (e) {
                // console.log(e);
                onOverTargetCenter(e, e.detail);
            },
            target_center_out: function (e) {
                // console.log(e);
                onLeaveTargetCenter(e, e.detail.source);
            },

            // source_all_in: function (e) {
            //     console.log(e);
            // },
            // source_all_out: function (e) {
            //     console.log(e);
            // },
            // target_all_in: function (e) {
            //     console.log(e);
            // },
            // target_all_out: function (e) {
            //     console.log(e);
            // },
            // source_center_in: function (e) {
            //     console.log(e);
            // },
            // source_center_out: function (e) {
            //     console.log(e);
            // },
            // touch_in: function (e) {
            //     console.log(e);
            // },
            // touch_out: function (e) {
            //     console.log(e);
            // },
            // pointer_in: function (e) {
            //     console.log(e);
            // },
            // pointer_out: function (e) {
            //     console.log(e);
            // },
            // dragged: function (e) {
            //     console.log(e)
            // },
            // dropped: function (e) {
            //     console.log(e)
            // },
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
