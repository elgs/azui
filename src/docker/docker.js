import { azObj, Base } from '../_core/core.js';
import * as icons from '../_utilities/icons.js';
import { diffPosition, matches, randGen, remove, isTouchDevice } from '../_utilities/utilities.js';

azui.Docker = function (el, options, init) {
  return azObj(Docker, el, options, init);
};

class Docker extends Base {
  static className = 'Docker';

  _init(options) {
    const settings = Object.assign(
      {
        // height: 30,
        // width: 30,
      },
      options
    );
    this.settings = settings;

    const node = this.node;
    node.style['z-index'] = Number.MAX_SAFE_INTEGER - 1000;

    const me = this;

    // this.dockerId = randGen(8);
    // node.setAttribute('az-docker-id', this.dockerId);
    // registerObject(this.dockerId, this);

    me.winSettingsCache = {};

    this.x = 30;
    this.y = 30;
    this.z = 0;
    this.sortable = azui.Sortable(this.node, {
      // placeholder: true,
      create: (e, target) => {
        if (e.type === 'touchstart') {
          // prevent text from being selected on context menu.
          e.preventDefault();
        }
      },
      sort: (e, data) => {
        // console.log('start dragging');
        me.sorted = true;
      },
      stop: (e, data) => {
        // console.log('stop dragging');
        me.sorted = false;
      }
    });
  }

  getContextMenuItems(dockId, winSettings) {
    const me = this;
    return function () {
      // console.log(dockId);
      // console.log(me.node);
      const docked = me.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
      // console.log(docked);
      const state = docked.getAttribute('state');
      return [
        {
          icon: icons.svgClose,
          title: 'Close',
          hidden: !winSettings.showCloseButton,
          action: function (e, target) {
            me.undock(dockId, true);
            return false;
          }
        },
        null,
        {
          icon: icons.svgWindowMin,
          title: 'Minimize Window',
          hidden: !winSettings.showMinimizeButton,
          disabled: state === 'minimized',
          action: function (e, target) {
            me.minimize(dockId, true);
            return false;
          }
        },
        {
          icon: icons.svgWindowNormal,
          disabled: state === 'normal',
          title: 'Restore Window',
          hidden: !winSettings.showMaximizeButton && !winSettings.showMinimizeButton,
          action: function (e, target) {
            me.normalize(dockId, true);
            return false;
          }
        },
        {
          icon: icons.svgWindowMax,
          title: 'Maximize Window',
          hidden: !winSettings.showMaximizeButton,
          disabled: state === 'maximized',
          action: function (e, target) {
            me.maximize(dockId, true);
            return false;
          }
        },
        null,
        {
          icon: icons.svgArrowUp,
          title: 'Slide Up',
          hidden: !winSettings.showSlideButton,
          disabled: state !== 'normal',
          action: function (e, target) {
            me.slideup(dockId, true);
            return false;
          }
        },
        {
          icon: icons.svgArrowDown,
          title: 'Slide Down',
          hidden: !winSettings.showSlideButton,
          disabled: state !== 'slidup',
          action: function (e, target) {
            me.slidedown(dockId, true);
            return false;
          }
        }
      ];
    };
  }

  dock(el, winSettings, notify) {
    if (typeof winSettings === 'string') {
      winSettings = {
        title: winSettings,
        showButtonInDocker: true
      };
    }

    const me = this;
    const id = randGen(8);
    me.winSettingsCache[id] = winSettings;
    const docked = document.createElement('div');
    docked.setAttribute('az-dock-id', id);
    docked.setAttribute('state', 'normal');
    if (!winSettings.showButtonInDocker) {
      docked.style['display'] = 'none';
    }

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('icon');
    iconSpan.innerHTML = winSettings.icon || '';
    docked.appendChild(iconSpan);

    const titleSpan = document.createElement('span');
    titleSpan.classList.add('title');
    titleSpan.innerHTML = winSettings.title;
    docked.appendChild(titleSpan);

    const cm = azui.ContextMenu(docked, {
      items: me.getContextMenuItems.call(me, id, winSettings)
    });

    // docked.style.width = this.settings.width + 'px';
    // docked.style.height = this.settings.height + 'px';
    this.sortable.add(docked);

    const clicked = e => {
      if (e.type === 'touchend') {
        // prevent mouseup from being triggered on touch devices.
        e.preventDefault();
        if (cm.rightClick.triggered) {
          return;
        }
      }
      if (e.button === 2 || cm.on || me.sorted) {
        return;
      }
      const docked = me.node.querySelector(`[az-dock-id='${id}']:not(.az-placeholder)`);
      // console.log(docked.getAttribute('state'));
      if (docked.getAttribute('state') === 'normal') {
        if (me.isActive(id)) {
          me.minimize(id, true);
        }
      } else if (docked.getAttribute('state') === 'minimized') {
        me.normalize(id, true);
      }
      me.activate(id, true);
    };

    docked.addEventListener('mouseup', clicked);
    if (isTouchDevice()) {
      docked.addEventListener('touchend', clicked);
    }
    el.setAttribute('az-dock-ref', id);
    if (notify) {
      el.dispatchEvent(new CustomEvent('docked'));
    }
    return docked;
  }

  undock(dockId, notify) {
    // docker, window two way notify
    remove(this.node.querySelector(`[az-dock-id='${dockId}']`));

    const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
    if (dockedRef) {
      dockedRef.removeAttribute('az-dock-ref');
    }
    if (notify) {
      dockedRef.dispatchEvent(new CustomEvent('undocked'));
    }
  }

  activate(dockId, notify) {
    // docker, window two way notify
    const me = this;
    this.node.querySelectorAll('.azSortableItem').forEach(el => {
      if (el.getAttribute('az-dock-id') !== dockId) {
        const otherDockId = el.getAttribute('az-dock-id');
        me.inactivate(otherDockId);
      }
    });

    const docked = this.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
    docked.classList.add('dock-active');

    const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
    if (notify) {
      dockedRef.dispatchEvent(new CustomEvent('activated'));
    }
  }

  inactivate(dockId, notify) {
    // docker, window two way notify
    const docked = this.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
    docked.classList.remove('dock-active');

    const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
    if (notify) {
      dockedRef.dispatchEvent(new CustomEvent('inactivated'));
    }
  }

  isActive(dockId) {
    const docked = this.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
    return matches(docked, '.dock-active');
  }

  toggleActive(dockId) {
    if (this.isActive(dockId)) {
      this.inactivate(dockId);
    } else {
      this.activate(dockId);
    }
  }

  maximize(dockId, notify) {
    const me = this;
    // always docker notifies window
    this.storeState(dockId);

    const docked = this.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
    const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
    docked.setAttribute('state', 'maximized');
    if (!me.winSettingsCache[dockId].showButtonInDocker) {
      docked.style['display'] = 'none';
    }

    dockedRef.style.transition = 'all .25s ease-in';
    dockedRef.style.left = 0;
    dockedRef.style.top = 0;
    dockedRef.style.height = '100%';
    dockedRef.style.width = '100%';
    dockedRef.style.visibility = 'visible';

    if (notify) {
      dockedRef.dispatchEvent(new CustomEvent('maximized'));
    }

    setTimeout(() => {
      dockedRef.style.transition = '';
    }, 250);
  }

  minimize(dockId, notify) {
    // always docker notifies window
    this.storeState(dockId);

    const docked = this.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
    const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
    docked.setAttribute('state', 'minimized');
    docked.style['display'] = '';

    const diff = diffPosition(dockedRef, docked);

    const drStyles = getComputedStyle(dockedRef);
    const drTop = parseInt(drStyles['top']);
    const drLeft = parseInt(drStyles['left']);

    const dStyles = getComputedStyle(docked);

    dockedRef.style.transition = 'all .25s ease-in';
    dockedRef.style.left = drLeft - diff.left + 'px';
    dockedRef.style.top = drTop - diff.top + 'px';
    dockedRef.style.height = dStyles['height'];
    dockedRef.style.width = dStyles['width'];
    dockedRef.style.visibility = 'hidden';

    if (notify) {
      dockedRef.dispatchEvent(new CustomEvent('minimized'));
    }

    setTimeout(() => {
      dockedRef.style.transition = '';
    }, 250);
  }

  normalize(dockId, notify) {
    const me = this;
    // always docker notifies window
    const docked = this.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
    const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
    docked.setAttribute('state', 'normal');
    if (!me.winSettingsCache[dockId].showButtonInDocker) {
      docked.style['display'] = 'none';
    }

    const dockedRefStyle = getComputedStyle(dockedRef);
    dockedRef.style.top = dockedRefStyle.top;
    dockedRef.style.left = dockedRefStyle.left;
    dockedRef.style.right = '';
    dockedRef.style.bottom = '';
    setTimeout(() => {
      dockedRef.style.transition = 'all .25s ease-in';
      dockedRef.style.left = docked.getAttribute('x') + 'px';
      dockedRef.style.top = docked.getAttribute('y') + 'px';
      dockedRef.style.height = docked.getAttribute('height') + 'px';
      dockedRef.style.width = docked.getAttribute('width') + 'px';
      dockedRef.style.visibility = 'visible';

      if (notify) {
        dockedRef.dispatchEvent(new CustomEvent('normalized'));
      }

      setTimeout(() => {
        dockedRef.style.transition = '';
      }, 250);
    });
  }

  slideup(dockId, notify) {
    // always docker notifies window
    this.storeState(dockId);
    const docked = this.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
    const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
    docked.setAttribute('state', 'slidup');

    if (notify) {
      dockedRef.dispatchEvent(new CustomEvent('slidup'));
    }
  }

  slidedown(dockId, notify) {
    // always docker notifies window
    const docked = this.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
    const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
    docked.setAttribute('state', 'normal');

    dockedRef.style.transition = 'all .25s ease-in';
    dockedRef.style.height = docked.getAttribute('height') + 'px';

    if (notify) {
      dockedRef.dispatchEvent(new CustomEvent('sliddown'));
    }

    setTimeout(() => {
      dockedRef.style.transition = '';
    }, 250);
  }

  snap(dockId, notify) {
    // always docker notifies window

    const docked = this.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
    const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);
    docked.setAttribute('state', 'maximized');

    if (notify) {
      dockedRef.dispatchEvent(new CustomEvent('maximized'));
    }
  }

  storeState(dockId) {
    const docked = this.node.querySelector(`[az-dock-id='${dockId}']:not(.az-placeholder)`);
    const dockedRef = document.querySelector(`[az-dock-ref='${dockId}']`);

    if (docked.getAttribute('state') !== 'normal') {
      return;
    }
    docked.setAttribute('height', dockedRef.clientHeight);
    docked.setAttribute('width', dockedRef.clientWidth);
    docked.setAttribute('x', dockedRef.offsetLeft);
    docked.setAttribute('y', dockedRef.offsetTop);
  }
}
