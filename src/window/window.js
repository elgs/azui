import * as icons from '../_utilities/icons.js';
import { isOutside, isTouchDevice, matches, parseDOMElement, remove, siblings } from '../_utilities/utilities.js';
import { azObj, Base } from '../_core/core.js';

azui.Window = function (el, options, init) {
  return azObj(Window, el, options, init);
};

class Window extends Base {
  static className = 'Window';

  _init(options) {
    const settings = Object.assign(
      {
        //  @doc:settings:start
        width: 400, // @doc:width: Width of `window`.
        height: 300, // @doc:height: Height of `window`.
        headerHeight: 36, // @doc:headerHeight: Header height of `window`.
        icon: '', // @doc:icon: An icon place at the top left corner of the window and the docker bar. It supports unicode icons or svg strings.
        showMinimizeButton: true, // @doc:showMinimizeButton: Whether to show the minimize button or not.
        showMaximizeButton: true, // @doc:showMaximizeButton: Whether to show the maximize button or not.
        showCloseButton: true, // @doc:showCloseButton: Whether to show close button or not.
        showSlideButton: true, // @doc:showSlideButton: Whether to show slide button or not.
        showButtonInDocker: true, // @doc:showButtonInDocker: Whether to show button in docker or not.
        title: 'azUI', // @doc:title: Title of the window.
        snapToEdge: true // @doc:snapToEdge: Whether to snap to container or not when dragging cursor is close to the container border.
        //  @doc:settings:end
      },
      options
    );

    const me = this;
    const node = this.node;
    this.settings = settings;

    if (!settings.showMinimizeButton) {
      settings.showButtonInDocker = false;
    }

    node.style['position'] = 'absolute';

    const dockers = siblings(node, '.azDocker');
    if (dockers.length === 0) {
      const dockerElem = document.createElement('div');
      node.parentNode.appendChild(dockerElem);
      me.docker = azui.Docker(dockerElem, null, true);
    } else {
      const dockerElem = dockers[0];
      me.docker = azui.Docker(dockerElem, null, false);
    }

    this.headerIcons = {};

    const initHeader = function () {
      settings.showSlideButton && addHeaderIcon('slideup', icons.svgArrowUp, 'Hide', false, 'right', me.slideup);
      settings.showSlideButton && addHeaderIcon('slidedown', icons.svgArrowDown, 'Show', true, 'right', me.slidedown);
      settings.showMinimizeButton &&
        addHeaderIcon('minimize', icons.svgWindowMin, 'Minimize', false, 'right', me.minimize);
      (settings.showMinimizeButton || settings.showMaximizeButton) &&
        addHeaderIcon('restore', icons.svgWindowNormal, 'Restore', true, 'right', me.restore);
      settings.showMaximizeButton &&
        addHeaderIcon('maximize', icons.svgWindowMax, 'Maximize', false, 'right', me.maximize);
      settings.showCloseButton && addHeaderIcon('close', icons.svgClose, 'Close', false, 'right', me.close);
    };

    const setHeaderIcon = function (icon) {
      header.querySelector('.left span.icon').innerHTML = icon;
    };

    const setHeaderTitle = function (title) {
      header.querySelector('.left span.title').innerHTML = title;
    };

    const addHeaderIcon = function (key, icon, toolTip, hidden, position, callback) {
      const iconSpan = document.createElement('span');
      iconSpan.classList.add('azHeaderIcon');
      if (hidden) {
        iconSpan.style.display = 'none';
      }
      iconSpan.appendChild(parseDOMElement(icon)[0]);
      iconSpan.addEventListener('click', function (event) {
        if (callback) {
          callback.call(me);
        }
      });
      me.headerIcons[key] = iconSpan;
      header.querySelector('.' + position).appendChild(iconSpan);
    };
    // const removeHeaderIcon = function (key) {
    //     remove(me.headerIcons[key]);
    // };
    // const showHeaderIcon = function (key) {
    //     me.headerIcons[key].style.display = 'inline-block';
    // };
    // const hideHeaderIcon = function (key) {
    //     me.headerIcons[key].style.display = 'none';
    // };

    const content = document.createElement('div');
    content.classList.add('azWindowContent');
    Array.prototype.slice.call(node.children).map(el => {
      content.appendChild(el);
    });
    node.appendChild(content);

    const header = document.createElement('div');
    header.style['height'] = settings.headerHeight + 'px';
    header.classList.add('azWindowHeader');
    header.appendChild(
      parseDOMElement('<div class="left"><span class="icon"></span><span class="title"></span></div>')[0]
    );
    header.appendChild(parseDOMElement('<div class="center"></div>')[0]);
    header.appendChild(parseDOMElement('<div class="right"></div>')[0]);
    setHeaderIcon(settings.icon);
    setHeaderTitle(settings.title);
    // azui.InlineEdit(header.querySelector('.left span.title'));
    initHeader();
    // header.prependTo(node);
    node.insertBefore(header, node.firstChild);

    const mouseDownTouchStartEventListener = function (event) {
      // console.log(event.type);
      me.activate(true);
    };
    me.replaceEventListener('mousedown', 'mousedown', mouseDownTouchStartEventListener);

    if (isTouchDevice()) {
      me.replaceEventListener('touchstart', 'touchstart', mouseDownTouchStartEventListener);
    }

    let pb;

    azui.Resizable(node, {
      minHeight: settings.headerHeight * 2,
      minWidth: 240,
      hideHandles: true,
      start: function (event, ui) {
        pb = node.parentNode.getBoundingClientRect();
      },
      resize: function (event, ui) {
        if (isOutside(event.pageX || event.touches[0].pageX, event.pageY || event.touches[0].pageY, pb)) {
          return false;
        }
      }
    });

    let _top, _left, _bottom, _right, _width, _height;
    const createGhost = (pos, top, left, bottom, right, width, height) => {
      _top = top;
      _left = left;
      _bottom = bottom;
      _right = right;
      _width = width;
      _height = height;

      if (!me.ghost) {
        const styles = getComputedStyle(me.node);

        const ghost = document.createElement(`div`);
        ghost.style.position = 'absolute';
        ghost.style.left = styles.left;
        ghost.style.top = styles.top;
        ghost.style.height = styles.height;
        ghost.style.width = styles.width;
        ghost.style.border = '1px solid red';
        ghost.style['background-color'] = 'tomato';
        ghost.style.opacity = 0.2;
        ghost.style.margin = 0;
        ghost.style.padding = 0;
        ghost.style['z-index'] = Number.MAX_SAFE_INTEGER;
        ghost.style.transition = 'all .1s ease-in';

        node.parentNode.appendChild(ghost);
        me.ghost = ghost;
        me.ghostPos = pos;

        setTimeout(() => {
          ghost.style.left = left;
          ghost.style.top = top;
          ghost.style.right = right;
          ghost.style.bottom = bottom;
          ghost.style.height = height;
          ghost.style.width = width;
        });
      } else if (me.ghostPos !== pos) {
        removeGhost();
        createGhost(pos, top, left, bottom, right, width, height);
      }
    };

    const removeGhost = (app = false) => {
      if (me.ghost) {
        if (app) {
          // record ghost position
          me.docker.snap(me.dockId, true);
          me.node.style.left = _left;
          me.node.style.top = _top;
          me.node.style.right = _right;
          me.node.style.bottom = _bottom;
          me.node.style.height = _height;
          me.node.style.width = _width;
          me.ghost.remove();
          // resize window to ghost position
        } else {
          me.ghost.remove();
        }
        me.ghostPos = null;
        me.ghost = null;
      }
    };

    azui.Draggable(node, {
      handle: header,
      snapDistance: 8,
      create: function (event, ui) {
        const target = event.target;
        // console.log(target, event.currentTarget);
        pb = node.parentNode.getBoundingClientRect();
        if (
          isTouchDevice() &&
          matches(target, '.azWindowHeader,.azWindowHeader *:not(.azHeaderIcon,.azHeaderIcon *)')
        ) {
          // prevent title from being selected on context menu, the :not() select is to allow icons to be correctly touched.
          event.preventDefault();
        }
        if (matches(target, '.azHeaderIcon,.azHeaderIcon *') || matches(target, 'input')) {
          return false; // don't drag when clicking on icons
        }
      },
      start: function (event, ui) {
        me.docker.storeState(me.dockId);
      },
      drag: function (event, ui) {
        const cursorX = event.touches ? event.touches[0].pageX : event.pageX;
        const cursorY = event.touches ? event.touches[0].pageY : event.pageY;
        // console.log(cursorX, cursorY, pb);
        if (settings.snapToEdge) {
          const triggerDistanceCorner = 20;
          const triggerDistanceSide = 15;
          if (
            Math.abs(cursorX - pb.left) < triggerDistanceCorner &&
            Math.abs(cursorY - pb.top) < triggerDistanceCorner
          ) {
            // console.log('nw');
            createGhost('nw', 0, 0, '', '', '50%', '50%');
          } else if (
            Math.abs(cursorX - pb.left) < triggerDistanceCorner &&
            Math.abs(cursorY - pb.bottom) < triggerDistanceCorner
          ) {
            // console.log('sw');
            createGhost('sw', '', 0, 0, '', '50%', '50%');
          } else if (
            Math.abs(cursorX - pb.right) < triggerDistanceCorner &&
            Math.abs(cursorY - pb.bottom) < triggerDistanceCorner
          ) {
            // console.log('se');
            createGhost('se', '', '', 0, 0, '50%', '50%');
          } else if (
            Math.abs(cursorX - pb.right) < triggerDistanceCorner &&
            Math.abs(cursorY - pb.top) < triggerDistanceCorner
          ) {
            // console.log('ne');
            createGhost('ne', 0, '', '', 0, '50%', '50%');
          } else if (Math.abs(cursorX - pb.left) < triggerDistanceSide) {
            // console.log('w');
            createGhost('w', 0, 0, '', '', '50%', '100%');
          } else if (Math.abs(cursorY - pb.bottom) < triggerDistanceSide) {
            // console.log('s');
            createGhost('s', '', 0, 0, '', '100%', '50%');
          } else if (Math.abs(cursorX - pb.right) < triggerDistanceSide) {
            // console.log('e');
            createGhost('e', 0, '', '', 0, '50%', '100%');
          } else if (Math.abs(cursorY - pb.top) < triggerDistanceSide) {
            // console.log('n');
            createGhost('n', 0, 0, '', '', '100%', '50%');
          } else {
            removeGhost();
          }
          // prevent text selection on snap.
          event.preventDefault();
        }
        if (isOutside(cursorX, cursorY, pb)) {
          return false;
        }
      },
      stop: function (event, ui) {
        removeGhost(!!me.ghost);
      }
    });

    azui.DoubleClick(header, {
      onDoubleClick: function (event) {
        // console.log(event.target);
        if (matches(event.target, 'span.azHeaderIcon,span.azHeaderIcon *')) {
          return;
        }
        const state = me.docked.getAttribute('state');
        if (state === 'normal') {
          me.maximize();
        } else {
          console.log(me.node);
          me.restore();
        }
      }
    });

    node.style['left'] = me.docker.x + 'px';
    node.style['top'] = me.docker.y + 'px';
    node.style['height'] = settings.height + 'px';
    node.style['width'] = settings.width + 'px';
    node.style['z-index'] = me.docker.z;
    // node.style['grid-template-rows'] = `${settings.headerHeight}px 1fr`;
    me.docker.x += settings.headerHeight;
    me.docker.y += settings.headerHeight;

    me.docked = me.docker.dock(node, settings);
    me.dockId = node.getAttribute('az-dock-ref');
    // console.log(me.docked, me.dockId);

    const cm = azui.ContextMenu(header, {
      items: me.docker.getContextMenuItems.call(me.docker, me.dockId, settings)
    });

    me.replaceEventListener('activated', 'activated', e => {
      me.activate(false);
    });
    me.replaceEventListener('inactivated', 'inactivated', e => {
      me.inactivate(false);
    });
    me.replaceEventListener('undocked', 'undocked', e => {
      me.close(false);
    });

    // me.replaceEventListener('minimized', 'minimized', e => {});
    settings.showMaximizeButton &&
      me.replaceEventListener('maximized', 'maximized', e => {
        settings.showSlideButton && (me.headerIcons['slidedown'].style.display = 'none');
        settings.showSlideButton && (me.headerIcons['slideup'].style.display = 'none');
        me.headerIcons['maximize'].style.display = 'none';
        settings.showMinimizeButton && (me.headerIcons['minimize'].style.display = 'inline-block');
        me.headerIcons['restore'].style.display = 'inline-block';
      });
    (settings.showMaximizeButton || settings.showMinimizeButton) &&
      me.replaceEventListener('normalized', 'normalized', e => {
        settings.showSlideButton && (me.headerIcons['slidedown'].style.display = 'none');
        settings.showSlideButton && (me.headerIcons['slideup'].style.display = 'inline-block');
        settings.showMaximizeButton && (me.headerIcons['maximize'].style.display = 'inline-block');
        settings.showMinimizeButton && (me.headerIcons['minimize'].style.display = 'inline-block');
        me.headerIcons['restore'].style.display = 'none';
      });
    settings.showSlideButton &&
      me.replaceEventListener('slidup', 'slidup', e => {
        me.headerIcons['slideup'].style.display = 'none';
        me.headerIcons['slidedown'].style.display = 'inline-block';
        me.node.style.transition = 'all .25s ease-in';
        me.node.style.height = me.settings.headerHeight + 'px';
        setTimeout(() => {
          me.node.style.transition = '';
        }, 250);
      });
    settings.showSlideButton &&
      me.replaceEventListener('sliddown', 'sliddown', e => {
        me.headerIcons['slideup'].style.display = 'inline-block';
        me.headerIcons['slidedown'].style.display = 'none';
      });
  }

  // @doc:method:start
  children() {
    // @doc: Get child windows.
    // @doc:return: Returns an array of child windows with class '.azWindowContent>.azWindow'.
    // @doc:method:end
    const children = this.node.querySelectorAll('.azWindowContent>.azWindow');
    return [...children].map(el => {
      return azui.Window(el);
    });
  }

  // @doc:method:start
  activate(notify = false) {
    // @doc: Activate the window.
    // @doc:notify: Whether notify the docker or not.
    // @doc:method:end

    // two way notification
    const me = this;

    // @doc:event:start
    // @doc:beforeactivate: Fires before the window is activated.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('beforeactivate', {
        detail: {
          elem: me.node
        }
      })
    );

    siblings(me.node, '.azWindow').forEach(el => {
      el.classList.remove('active');
      el.classList.add('inactive');
    });

    this.node.classList.remove('inactive');
    this.node.classList.add('active');

    me.node.style['z-index'] = ++me.docker.z;

    if (notify) {
      me.docker.activate(this.dockId, false);
    }

    // @doc:event:start
    // @doc:afteractivate: Fires after the window is activated.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('afteractivate', {
        detail: {
          elem: me.node
        }
      })
    );
  }

  // @doc:method:start
  inactivate(notify = false) {
    // @doc: Inactivate the window.
    // @doc:notify: Whether notify the docker or not.
    // @doc:method:end
    // two way notification
    const me = this;

    // @doc:event:start
    // @doc:beforeinactivate: Fires before the window is inactivated.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('beforeinactivate', {
        detail: {
          elem: me.node
        }
      })
    );

    this.node.classList.remove('active');
    this.node.classList.add('inactive');
    if (notify) {
      me.docker.inactivate(this.dockId, false);
    }

    // @doc:event:start
    // @doc:afterinactivate: Fires after the window is inactivated.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('afterinactivate', {
        detail: {
          elem: me.node
        }
      })
    );
  }

  // @doc:method:start
  close(notify = false) {
    /* @doc: 
        Close the window. 
        <pre><code> 
        const abc = '123'; 
        const def = function(){};
        </code></pre>
        */
    // @doc:notify: Whether notify the docker or not.
    // @doc:method:end
    // two way notification
    const me = this;

    // @doc:event:start
    // @doc:beforeclose: Fires before the window is closed.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('beforeclose', {
        detail: {
          elem: me.node
        }
      })
    );

    this.children().forEach(child => {
      child.docker.undock(child.dockId, true);
    });
    remove(this.node);
    if (notify) {
      me.docker.undock(this.dockId, false);
    }

    // @doc:event:start
    // @doc:afterclose: Fires after the window is closed.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('afterclose', {
        detail: {
          elem: me.node
        }
      })
    );
  }

  // @doc:method:start
  slideup() {
    // @doc: Slide up the window.
    // @doc:method:end
    const me = this;

    // @doc:event:start
    // @doc:beforeslideup: Fires before the window is slid up.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('beforeslideup', {
        detail: {
          elem: me.node
        }
      })
    );
    this.docker.slideup(this.dockId, true);

    // @doc:event:start
    // @doc:afterslideup: Fires after the window is slid up.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('afterslideup', {
        detail: {
          elem: me.node
        }
      })
    );
  }

  // @doc:method:start
  slidedown() {
    // @doc: Slide down the window.
    // @doc:method:end
    const me = this;

    // @doc:event:start
    // @doc:beforeslidedown: Fires before the window is slid down.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('beforeslidedown', {
        detail: {
          elem: me.node
        }
      })
    );
    this.docker.slidedown(this.dockId, true);

    // @doc:event:start
    // @doc:afterslidedown: Fires after the window is slid down.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('afterslidedown', {
        detail: {
          elem: me.node
        }
      })
    );
  }

  // @doc:method:start
  minimize() {
    // @doc: Minimize the window.
    // @doc:method:end
    const me = this;

    // @doc:event:start
    // @doc:beforeminimize: Fires before the window is minimized.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('beforeminimize', {
        detail: {
          elem: me.node
        }
      })
    );
    this.docker.minimize(this.dockId, true);

    // @doc:event:start
    // @doc:afterminimize: Fires after the window is minimized.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('afterminimize', {
        detail: {
          elem: me.node
        }
      })
    );
  }

  // @doc:method:start
  maximize() {
    // @doc: Maximize the window.
    // @doc:method:end
    const me = this;

    // @doc:event:start
    // @doc:beforemaximize: Fires before the window is maximized.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('beforemaximize', {
        detail: {
          elem: me.node
        }
      })
    );
    this.docker.maximize(this.dockId, true);

    // @doc:event:start
    // @doc:aftermaximize: Fires after the window is maximized.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('aftermaximize', {
        detail: {
          elem: me.node
        }
      })
    );
  }

  // @doc:method:start
  restore() {
    // @doc: Restore the window.
    // @doc:method:end
    const me = this;

    // @doc:event:start
    // @doc:beforerestore: Fires before the window is restored.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('beforerestore', {
        detail: {
          elem: me.node
        }
      })
    );
    this.docker.normalize(this.dockId, true);

    // @doc:event:start
    // @doc:afterrestore: Fires after the window is restored.
    // @doc:elem: The DOM of the window, event.detail.elem.
    // @doc:event:end
    me.node.dispatchEvent(
      new CustomEvent('afterrestore', {
        detail: {
          elem: me.node
        }
      })
    );
  }
}
