global.azui = global.azui || {
    data: {}
};

export class Base {
    constructor(el) {
        if (typeof el === 'string') {
            this.nodeList = document.querySelectorAll(el);
        } else if (el instanceof Node) {
            this.nodeList = [el];
        } else if (el instanceof NodeList || Array.isArray(el)) {
            this.nodeList = el;
        } else {
            throw `${el} cannot be targeted.`;
        }
    };
};