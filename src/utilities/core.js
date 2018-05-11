global.azui = global.azui || {
    data: {}
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