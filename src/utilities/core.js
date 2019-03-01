import { randGen } from './utilities.js';

global.azui = global.azui || {
  // data: {},
  objCache: {},
  constants: {
    dndStateConsts: {
      touch: 1 << 0,
      pointer: 1 << 1,
      source_all: 1 << 2,
      target_all: 1 << 3,
      source_center: 1 << 4,
      target_center: 1 << 5
    },
    dndEventConsts: {
      touch_in: 1 << 0,
      pointer_in: 1 << 1,
      source_all_in: 1 << 2,
      target_all_in: 1 << 3,
      source_center_in: 1 << 4,
      target_center_in: 1 << 5,
      touch_out: 1 << 6,
      pointer_out: 1 << 7,
      source_all_out: 1 << 8,
      target_all_out: 1 << 9,
      source_center_out: 1 << 10,
      target_center_out: 1 << 11,
      dragged: 1 << 12,
      dropped: 1 << 13,
      all: (1 << 14) - 1,
      none: 0
    }
  },
  cursor: {
    x: undefined,
    y: undefined
  }
};

let wait = false;
document.addEventListener('mousemove', e => {
  if (!wait) {
    azui.cursor.x = e.clientX;
    azui.cursor.y = e.clientY;
    wait = true;
    setTimeout(() => {
      wait = false;
    }, 50);
  }
});

const normalizeElement = function(el) {
  if (typeof el === 'string') {
    return document.querySelector(el);
  } else if (el instanceof Node) {
    return el;
  } else if ((el instanceof NodeList || Array.isArray(el)) && el.length > 0) {
    return el[0];
  } else {
    throw `${el} cannot be targeted.`;
  }
};

export const azObj = function(cls, el, options, init) {
  const node = normalizeElement(el);
  node.classList.add('azui', 'az' + cls.className);
  let objId = node.getAttribute('az-obj-id-' + cls.className.toLowerCase());
  if (objId) {
    const obj = azui.objCache[objId];
    if (obj) {
      init && obj._init(options);
      return obj;
    }
  }
  const obj = new cls();
  obj.node = node;
  objId = randGen(8);
  obj.node.setAttribute('az-obj-id-' + cls.className.toLowerCase(), objId);
  obj._init(options);
  azui.objCache[objId] = obj;
  return obj;
};

export class Base {
  constructor() {
    const me = this;
    me.eventListeners = {};
  }

  replaceEventListener(eventId, eventName, eventHandler) {
    const me = this;
    const oldHandler = me.eventListeners[eventId];
    me.node.removeEventListener(eventName, oldHandler);
    me.eventListeners[eventId] = eventHandler;
    me.node.addEventListener(eventName, eventHandler);
  }

  // on(eventName, eventHandler) {
  //     const me = this;
  //     if (eventName && eventHandler) {
  //         eventName.split(/\s+/).forEach(e => me.node.addEventListener(e, eventHandler));
  //     }
  // }
  // off(eventName, eventHandler) {
  //     const me = this;
  //     if (eventName && eventHandler) {
  //         eventName.split(/\s+/).forEach(e => me.node.removeEventListener(e, eventHandler));
  //     }
  // }
}
