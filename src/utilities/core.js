global.azui = global.azui || {
    data: {}
};

export class Base {
    constructor(el) {
        if (typeof el === 'string') {
            this.node = document.querySelector(el);
        } else if (el instanceof Node) {
            this.node = el;
        } else if ((el instanceof NodeList || Array.isArray(el)) && el.length > 0) {
            this.node = el[0];
        } else {
            throw `${el} cannot be targeted.`;
        }
    };
};