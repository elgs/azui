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
    remove,
    setHeight,
    setWidth,
    siblings,
    swapElement,
    getDocScrollLeft,
    getDocScrollTop,
    diffPositionInnerBorder
} from '../utilities/utilities.js';

azui.Sortable = function (el, options, init) {
    return azObj(Sortable, el, options, init);
};

class Sortable extends Base {
    azInit(options) {
        const me = this;
        const settings = Object.assign({
            className: 'azSortableItem',
            placeholder: true,
            showPlaceHolder: false,
            escapable: false,
            align: 'x', // or y
            create: function (event, ui, me) {
                // console.log('create', ui);
            },
            start: function (event, ui, me) {
                // console.log('start', ui);
            },
            sort: function (event, data, me) {
                // console.log('sort', data);
            },
            stop: function (event, data, me) {
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
            if (settings.create(e, target, me) === false) {
                return false;
            }
        };

        const onDragStart = function (e, target) {
            selected = target;
            if (settings.start(e, selected, me) === false) {
                return false;
            }

            target.style['z-index'] = ++z;
            selected.classList.add('azSortableSelected');

            if (settings.placeholder) {
                ph = target.cloneNode(false);
                ph.removeAttribute('id');
                ph.classList.add('az-placeholder');
                if (!settings.showPlaceHolder) {
                    ph.style['visibility'] = 'hidden';
                }

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
            if (settings.sort(e, data, me) === false) {
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
            if (settings.sort(e, data, me) === false) {
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
                        insertBefore(selected, ph);
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

            if (draggable.stopHook) {
                setTimeout(() => {
                    draggable.stopHook();
                });
            }

            if (settings.stop(e, data, me) === false) {
                return false;
            }
        };

        if (settings.escapable) {
            azui.Droppable(node, {
                interestedDropEvents: azui.constants.dndEventConsts.pointer_in |
                    azui.constants.dndEventConsts.pointer_out,
                pointer_in: function (e) {
                    const source = e.detail.source;
                    const phs = siblings(source, '.az-placeholder');
                    if (phs.length > 0) {
                        ph = phs[0];
                    }
                    const ptrEvt = e.detail.originalEvent;
                    const cursorX = ptrEvt.pageX || ptrEvt.touches[0].pageX;
                    const cursorY = ptrEvt.pageY || ptrEvt.touches[0].pageY;

                    source.style.visibility = 'hidden';
                    me.add(source, cursorX, cursorY);

                    const draggable = azui.Draggable(source);

                    insertAfter(ph, source);

                    const detachedContainer = draggable.detachedContainer;
                    const diffContainer = diffPositionInnerBorder(detachedContainer.node, me.node);

                    draggable.mouseX0 -= diffContainer.left;
                    draggable.mouseY0 -= diffContainer.top;
                    draggable.escapeX = false;
                    draggable.escapeY = false;

                    // draggable and droppable need to be in the same sortable in order to share the same place holder, improvement?
                    azui.Droppable(source, me.dropConfig, true);

                    draggable.stopHook = function () {
                        azui.Draggable(source, me.dragConfig, true);
                    }

                    setTimeout(() => {
                        source.style.visibility = 'visible';
                    });
                    selected = source;
                },
                pointer_out: function (e) {
                    // console.log(selected);
                    const draggable = azui.Draggable(selected);
                    draggable.escapeX = true;
                    draggable.escapeY = true;

                    draggable.detachedContainer = me;

                    draggable.stopHook = null;
                },
            });
        }

        this.dragConfig = {
            containment: node,
            resist: 5,
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
        const items = Array.prototype.filter.call(node.children, n => matches(n, '.' + settings.className + ':not(.az-placeholder)'));
        items.forEach(item => {
            azui.Draggable(item, this.dragConfig);
            azui.Droppable(item, this.dropConfig);
        });
    }

    add(elem, cursorX = Number.MAX_SAFE_INTEGER, cursorY = Number.MAX_SAFE_INTEGER) {
        const me = this;
        const node = me.node;
        const settings = me.settings;

        const items = Array.prototype.filter.call(node.children, n => matches(n, '.' + settings.className + ':not(.az-placeholder'));

        let nearestItem = null;
        let direction = true;
        let distance = Number.MAX_SAFE_INTEGER;
        items.map(item => {
            const bcr = item.getBoundingClientRect();
            const x = bcr.left + getDocScrollLeft() + bcr.width / 2;
            const y = bcr.top + getDocScrollTop() + bcr.height / 2;
            const dx = cursorX - x;
            const dy = cursorY - y;
            const d = dx * dx + dy * dy;
            if (d < distance) {
                distance = d;
                nearestItem = item;

                if (settings.align === 'x') {
                    direction = dx >= 0;
                } else if (settings.align === 'y') {
                    direction = dy >= 0;
                }
            }
        });

        if (!nearestItem) {
            this.node.appendChild(elem);
        } else {
            if (direction) {
                insertAfter(elem, nearestItem);
            } else {
                insertBefore(elem, nearestItem);
            }
        }

        elem.classList.add(this.settings.className);

        // do nothing if initialized, initialize if not initialized.
        azui.Draggable(elem, this.dragConfig, false);
        azui.Droppable(elem, this.dropConfig, false);
    }
};