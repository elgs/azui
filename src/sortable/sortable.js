import { diffPositionInnerBorder, getDocScrollLeft, getDocScrollTop, getHeight, getWidth, index, insertAfter, insertBefore, matches, position, remove, setHeight, setWidth, siblings, swapElement } from '../_utilities/utilities.js';
import { azObj, Base, dndEvent } from '../_core/core.js';

azui.Sortable = function (el, options, init) {
  return azObj(Sortable, el, options, init);
};

class Sortable extends Base {
  static className = 'Sortable';

  _init(options) {
    const me = this;
    const settings = Object.assign(
      {
        placeholder: true,
        showPlaceHolder: false,
        detachable: false,
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
        add: function (event, data, me) {
          // console.log('add', data);
        }
      },
      options
    );

    this.settings = settings;

    const node = this.node;

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
        insertBefore(ph, selected);
      } else {
        selected.classList.add('azSortableDeny');
      }
    };

    const onOverTargetCenter = function (e) {
      // console.log('on over target center!');
      // console.log(e.target);
      const data = e.detail;
      if (!data.source.classList.contains('azSortableItem')) {
        return;
      }

      const draggable = azui.Draggable(data.source);
      if (draggable['pointer_in']) {
        delete draggable['pointer_in'];
        return;
      }
      if (settings.sort(e, data, me) === false) {
        return false;
      }
      if (settings.placeholder) {
        if (ph) {
          // console.log('ph:', ph);
          // console.log('target:', data.target);
          swapElement(ph, data.target);
        }
        // console.log(data.target);
      } else {
        siblings(data.target).forEach(el => el.classList.remove('azSortableDropAfter', 'azSortableDropBefore'));
        data.target.classList.add(
          index(selected) < index(data.target) ? 'azSortableDropAfter' : 'azSortableDropBefore'
        );
        selected.classList.remove('azSortableDeny');
        selected.classList.add('azSortableAllow');
        ph = data.target;
      }
    };

    const onLeaveTargetCenter = function (e) {
      // console.log('on leave target center!');
      const data = e.detail;
      if (!data.source.classList.contains('azSortableItem')) {
        return;
      }
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
      // console.log('on drag stop');
      const data = {
        source: selected,
        target: ph,
        boundingClientRect: target.getBoundingClientRect(),
        detached: draggable.detachedX || draggable.detachedY
      };
      delete draggable['pointer_in'];
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
      target.style.top = '';
      target.style.left = '';
      target.style.right = '';
      target.style.bottom = '';

      if (settings.stop(e, data, me) === false) {
        return false;
      }

      if (draggable.stopHook) {
        setTimeout(() => {
          draggable.stopHook();
          draggable.stopHook = null;
        });
      }
    };

    if (settings.detachable) {
      azui.Droppable(node, {
        interestedDropEvents: dndEvent.pointer_in | dndEvent.pointer_out,
        pointer_in: function (e) {
          // console.log('pointer in fired');
          const source = e.detail.source;
          if (!source.classList.contains('azSortableItem')) {
            return;
          }

          const draggable = azui.Draggable(source);
          const detachedContainer = draggable.detachedContainer;
          if (!detachedContainer) {
            return;
          }

          selected = source;
          const phs = siblings(source, '.az-placeholder');
          if (phs.length > 0) {
            ph = phs[0];
          }
          const ptrEvt = e.detail.originalEvent;
          const cursorX = ptrEvt.pageX || ptrEvt.touches[0].pageX;
          const cursorY = ptrEvt.pageY || ptrEvt.touches[0].pageY;

          source.style.visibility = 'hidden';
          me.add(source, cursorX, cursorY);

          if (ph) {
            const diffContainer = diffPositionInnerBorder(me.node, detachedContainer.node);
            // console.log(diffContainer);

            draggable.mouseX0 += diffContainer.left;
            draggable.mouseY0 += diffContainer.top;
            // console.log(draggable.mouseX0, draggable.mouseY0);

            insertBefore(ph, source);
          } else {
            // console.log(draggable.originalBpr);
            selected.style.top = '';
            selected.style.left = '';
            selected.style.right = '';
            selected.style.bottom = '';

            const bcr = selected.getBoundingClientRect();
            const bpr = {
              top: bcr.top + getDocScrollTop(),
              left: bcr.left + getDocScrollLeft()
            };

            const diffDraggable = {
              top: bpr.top - draggable.originalBpr.top,
              left: bpr.left - draggable.originalBpr.left
            };

            draggable.mouseX0 += diffDraggable.left;
            draggable.mouseY0 += diffDraggable.top;
            draggable.setContainment(me.node);
            // console.log(diffDraggable);
            // console.log(draggable.mouseX0, draggable.mouseY0);
            draggable.originalBpr = bpr;
          }

          draggable.detachedX = false;
          draggable.detachedY = false;

          draggable['pointer_in'] = true;

          draggable.stopHook = function () {
            if (ph) {
              if (!settings.placeholder) {
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

            // draggable and droppable need to be in the same sortable in order to share the same place holder, improvement?
            azui.Droppable(source, me.dropConfig, true);
            azui.Draggable(source, me.dragConfig, true);
          };

          setTimeout(() => {
            source.style.visibility = 'visible';
          });
        },
        pointer_out: function (e) {
          // console.log('pointer out fired');
          const source = e.detail.source;
          if (!source.classList.contains('azSortableItem')) {
            return;
          }
          // console.log(selected);
          const draggable = azui.Draggable(selected);
          draggable.detachedX = true;
          draggable.detachedY = true;

          draggable.detachedContainer = me;

          draggable.stopHook = null;
        }
      });
    }

    this.dragConfig = {
      containment: node,
      resist: 5,
      create: onDragCreate,
      start: onDragStart,
      stop: (event, ui, draggable) => {
        onDragStop(event, ui, draggable);
      }
    };

    this.dropConfig = {
      interestedDropEvents:
        dndEvent.target_center_in | dndEvent.target_center_out,
      target_center_in: function (e) {
        // console.log(e);
        onOverTargetCenter(e);
      },
      target_center_out: function (e) {
        // console.log(e);
        onLeaveTargetCenter(e);
      }

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
    const items = Array.prototype.filter.call(node.children, n => matches(n, '.azSortableItem:not(.az-placeholder)'));
    items.forEach(item => {
      azui.Draggable(item, me.dragConfig);
      azui.Droppable(item, me.dropConfig);
    });
  }

  add(elem, cursorX = Number.MAX_SAFE_INTEGER, cursorY = Number.MAX_SAFE_INTEGER) {
    const me = this;
    const node = me.node;
    const settings = me.settings;

    const items = Array.prototype.filter.call(node.children, n => matches(n, '.azSortableItem:not(.az-placeholder)'));

    let nearestItem = null;
    let direction = true;
    let distance = Number.MAX_SAFE_INTEGER;
    items.map(item => {
      // console.log(item);
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

    // console.log(nearestItem, direction);
    if (!nearestItem) {
      node.appendChild(elem);
    } else {
      if (direction) {
        insertAfter(elem, nearestItem);
      } else {
        insertBefore(elem, nearestItem);
      }
    }

    elem.classList.add('azSortableItem');

    // do nothing if initialized, initialize if not initialized.
    azui.Draggable(elem, this.dragConfig, false);
    azui.Droppable(elem, this.dropConfig, false);

    if (settings.add(null, elem, me) === false) {
      return false;
    }
  }
}
