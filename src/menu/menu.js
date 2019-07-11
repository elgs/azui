import { isTouchDevice, matches, nextElem, normalizeIcon, parseDOMElement, prevElem, randGen, resolveFunction } from '../_utilities/utilities.js';
import { azObj, Base } from '../_core/core.js';

azui.Menu = function (el, options, init) {
  return azObj(Menu, el, options, init);
};

class Menu extends Base {
  static className = 'Menu';

  _init(options) {
    const settings = Object.assign(
      {
        items: null,
        target: null
      },
      options
    );

    const me = this;
    const node = me.node;

    const createMenuItem = function (item) {
      if (!item) {
        const separator = parseDOMElement('<div>&nbsp;</div>')[0];
        separator.classList.add('azMenuSeparator');
        return separator;
      }

      const hidden = resolveFunction(item.hidden);
      if (hidden === true) {
        return null;
      }

      const menuItem = document.createElement('div');
      menuItem.setAttribute('menu-item-id', item.id || randGen(8));
      menuItem.classList.add('azMenuItem');
      const disabled = resolveFunction(item.disabled);
      if (disabled) {
        menuItem.classList.add('disabled');
      }

      const icon = item.icon || '';
      const iconDiv = normalizeIcon(icon);
      iconDiv.classList.add('icon');
      menuItem.appendChild(iconDiv);

      const title = item.title || '';
      const titleDiv = normalizeIcon(title);
      titleDiv.classList.add('title');
      menuItem.appendChild(titleDiv);
      // iconDiv.innerHTML = icon;
      // titleDiv.innerHTML = title;
      if (!disabled) {
        const select = e => {
          if (e.type === 'touchend') {
            // prevent mouseup from being triggered on touch device
            e.preventDefault();
            if (me.dragged) {
              me.dragged = false;
              return;
            }
          }
          if (me.activeMenuItem) {
            me.activeMenuItem.classList.remove('active');
          }
          menuItem.classList.add('active');
          me.activeMenuItem = menuItem;

          item.action.call(menuItem, e, settings.target || node);
        };
        if (isTouchDevice()) {
          menuItem.addEventListener('touchend', select);
          menuItem.addEventListener('touchmove', e => {
            me.dragged = true;
          });
        }
        menuItem.addEventListener('mouseup', select);
      }

      return menuItem;
    };

    const onKeyUp = e => {
      // console.log(e.keyCode);

      if (e.keyCode === 38) {
        // up
        if (me.activeMenuItem) {
          const prev = prevElem(me.activeMenuItem, ':not(.disabled).azMenuItem');
          if (prev) {
            me.activeMenuItem.classList.remove('active');
            me.activeMenuItem = prev;
            me.activeMenuItem.classList.add('active');
          }
        }
      } else if (e.keyCode === 40) {
        // down
        if (me.activeMenuItem) {
          const next = nextElem(me.activeMenuItem, ':not(.disabled).azMenuItem');
          if (next) {
            me.activeMenuItem.classList.remove('active');
            me.activeMenuItem = next;
            me.activeMenuItem.classList.add('active');
          }
        }
      } else if (e.keyCode === 13) {
        // enter
        me.activeMenuItem.dispatchEvent(new CustomEvent('mouseup'));
      }
    };

    node.setAttribute('tabindex', 0);
    node.addEventListener('keyup', onKeyUp);

    // $('<div>&nbsp;</div>').addClass('azMenuIconSeparator').appendTo($menu);

    const items = resolveFunction(settings.items);
    let lastItem = null;
    items.map((item, index) => {
      const menuItem = createMenuItem(item);
      lastItem = menuItem;
      let append = !!menuItem;
      if (append && matches(menuItem, '.azMenuSeparator') && !!lastItem) {
        append = false;
      }
      // console.log(menuItem, append);
      if (append) {
        node.appendChild(menuItem);
      }
    });
  }

  clearActive() {
    this.activeMenuItem && this.activeMenuItem.classList.remove('active');
  }

  activate(menuItemId) {
    const menuItem = this.node.querySelector('.azMenuItem[menu-item-id=' + menuItemId + ']');
    if (menuItem) {
      if (isTouchDevice()) {
        menuItem.dispatchEvent(new CustomEvent('touchend'));
      } else {
        menuItem.dispatchEvent(new CustomEvent('mouseup'));
      }
    }
  }
}
