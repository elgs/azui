global.azui = global.azui || {
    data: {},
    constants: {
        dndStateConsts: {
            touch: 1 << 0,
            pointer: 1 << 1,
            source_all: 1 << 2,
            target_all: 1 << 3,
            source_center: 1 << 4,
            target_center: 1 << 5,
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
            none: 0,
        }
    },
};

export const normalizeElement = function (el) {
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

export class Base {
    constructor(el) {
        this.node = normalizeElement(el);
    }

    on(eventName, eventHandler) {
        const self = this;
        if (eventName && eventHandler) {
            eventName.split(/\s+/).forEach(e => self.node.addEventListener(e, eventHandler));
        }
    }
    off(eventName, eventHandler) {
        const self = this;
        if (eventName && eventHandler) {
            eventName.split(/\s+/).forEach(e => self.node.removeEventListener(e, eventHandler));
        }
    }
};