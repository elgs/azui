import { azObj, Base } from '../_core/core.js';
import { getHeight, getWidth, resolveDOM, isTouchDevice } from '../_utilities/utilities.js';

azui.Layout = function (el, options, init) {
  return azObj(Layout, el, options, init);
};

class Layout extends Base {
  static className = 'Layout';

  _init(options) {
    const settings = Object.assign(
      {
        north: 'azLayoutNorth',
        east: 'azLayoutEast',
        south: 'azLayoutSouth',
        west: 'azLayoutWest',
        center: 'azLayoutCenter',
        northHeight: '50px',
        southHeight: '50px',
        westWidth: '100px',
        eastWidth: '100px',
        hideCollapseButton: true
      },
      options
    );

    const node = this.node;
    const me = this;

    const handleSize = isTouchDevice() ? 8 : 4;

    const northContent = resolveDOM(node, '*>.' + settings.north);
    const eastContent = resolveDOM(node, '*>.' + settings.east);
    const southContent = resolveDOM(node, '*>.' + settings.south);
    const westContent = resolveDOM(node, '*>.' + settings.west);
    const centerContent = resolveDOM(node, '*>.' + settings.center);

    let centerWidth, centerHeight;
    if (northContent) {
      const north = document.createElement('div');
      north.classList.add('azLayoutArea', 'azLayoutAreaNorth');
      north.style.height = settings.northHeight;
      me.node.appendChild(north);
      me.north = north;
      azui.Resizable(me.north, {
        handles: 's',
        handleSize,
        hideCollapseButton: settings.hideCollapseButton,
        create: function (e, h) {
          centerHeight = getHeight(me.center);
          centerContent.querySelectorAll('iframe').forEach(iframe => {
            iframe && (iframe.style['pointer-events'] = 'none');
          });
        },
        resize: function (e, h, by) {
          by.dy = Math.min(by.dy, centerHeight);
        },
        stop: function (e, el) {
          centerContent.querySelectorAll('iframe').forEach(iframe => {
            iframe && (iframe.style['pointer-events'] = '');
          });
        },
        collapse: function (e, el) {
          centerContent.querySelectorAll('iframe').forEach(iframe => {
            iframe && (iframe.style['pointer-events'] = '');
          });
        }
      });
      north.appendChild(northContent);
      me.northContent = northContent;
    }
    if (eastContent) {
      const east = document.createElement('div');
      east.classList.add('azLayoutArea', 'azLayoutAreaEast');
      east.style.width = settings.eastWidth;
      me.node.appendChild(east);
      me.east = east;
      azui.Resizable(me.east, {
        handles: 'w',
        handleSize,
        hideCollapseButton: settings.hideCollapseButton,
        moveOnResize: false,
        create: function (e, h) {
          centerWidth = getWidth(me.center);
          node.querySelectorAll('iframe').forEach(iframe => {
            iframe && (iframe.style['pointer-events'] = 'none');
          });
        },
        resize: function (e, h, by) {
          by.dx = Math.max(by.dx, -centerWidth);
        },
        stop: function (e, el) {
          node.querySelectorAll('iframe').forEach(iframe => {
            iframe && (iframe.style['pointer-events'] = '');
          });
        },
        collapse: function (e, el) {
          node.querySelectorAll('iframe').forEach(iframe => {
            iframe && (iframe.style['pointer-events'] = '');
          });
        }
      });
      east.appendChild(eastContent);
      me.eastContent = eastContent;
    }
    if (southContent) {
      const south = document.createElement('div');
      south.classList.add('azLayoutArea', 'azLayoutAreaSouth');
      south.style.height = settings.southHeight;
      me.node.appendChild(south);
      me.south = south;
      azui.Resizable(me.south, {
        handles: 'n',
        handleSize,
        hideCollapseButton: settings.hideCollapseButton,
        moveOnResize: false,
        create: function (e, h) {
          centerHeight = getHeight(me.center);
          node.querySelectorAll('iframe').forEach(iframe => {
            iframe && (iframe.style['pointer-events'] = 'none');
          });
        },
        resize: function (e, h, by) {
          by.dy = Math.max(by.dy, -centerHeight);
        },
        stop: function (e, el) {
          node.querySelectorAll('iframe').forEach(iframe => {
            iframe && (iframe.style['pointer-events'] = '');
          });
        },
        collapse: function (e, el) {
          node.querySelectorAll('iframe').forEach(iframe => {
            iframe && (iframe.style['pointer-events'] = '');
          });
        }
      });
      south.appendChild(southContent);
      me.southContent = southContent;
    }
    if (westContent) {
      const west = document.createElement('div');
      west.classList.add('azLayoutArea', 'azLayoutAreaWest');
      west.style.width = settings.westWidth;
      me.node.appendChild(west);
      me.west = west;
      azui.Resizable(me.west, {
        handles: 'e',
        handleSize,
        hideCollapseButton: settings.hideCollapseButton,
        create: function (e, h) {
          centerWidth = getWidth(me.center);
          node.querySelectorAll('iframe').forEach(iframe => {
            iframe && (iframe.style['pointer-events'] = 'none');
          });
        },
        resize: function (e, h, by) {
          by.dx = Math.min(by.dx, centerWidth);
        },
        stop: function (e, el) {
          node.querySelectorAll('iframe').forEach(iframe => {
            iframe && (iframe.style['pointer-events'] = '');
          });
        },
        collapse: function (e, el) {
          node.querySelectorAll('iframe').forEach(iframe => {
            iframe && (iframe.style['pointer-events'] = '');
          });
        }
      });
      west.appendChild(westContent);
      me.westContent = westContent;
    }
    if (centerContent) {
      const center = document.createElement('div');
      center.classList.add('azLayoutArea', 'azLayoutAreaCenter');
      me.node.appendChild(center);
      me.center = center;
      center.appendChild(centerContent);
      me.centerContent = centerContent;
    }

    // console.log(me.north, me.east, me.south, me.west, me.center);
  }
}
