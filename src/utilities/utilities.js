export const randGenConsts = {};
randGenConsts.None = 0;
randGenConsts.Lower = 1 << 0;
randGenConsts.Upper = 1 << 1;
randGenConsts.Digit = 1 << 2;
randGenConsts.Punct = 1 << 3;

randGenConsts.LowerUpper = randGenConsts.Lower | randGenConsts.Upper;
randGenConsts.LowerDigit = randGenConsts.Lower | randGenConsts.Digit;
randGenConsts.UpperDigit = randGenConsts.Upper | randGenConsts.Digit;
randGenConsts.LowerUpperDigit = randGenConsts.LowerUpper | randGenConsts.Digit;
randGenConsts.All = randGenConsts.LowerUpperDigit | randGenConsts.Punct;

const lower = "abcdefghijklmnopqrstuvwxyz";
const upper = lower.toUpperCase();
const digit = "0123456789";
const punct = "~!@#$%^&*()_+-=";

export function randGen(size, set = randGenConsts.LowerUpperDigit, include = '', exclude = '') {
    let all = include;
    if ((set & randGenConsts.Lower) > 0) {
        all += lower;
    }

    if ((set & randGenConsts.Upper) > 0) {
        all += upper;
    }

    if ((set & randGenConsts.Digit) > 0) {
        all += digit;
    }
    if ((set & randGenConsts.Punct) > 0) {
        all += punct;
    }

    const lenAll = all.length;
    if (exclude.length >= lenAll) {
        throw ("Too much to exclude.");
    }
    let buf = '';
    for (let i = 0; i < size; ++i) {
        let b = all[Math.floor(Math.random() * lenAll)];
        if (exclude.includes(b)) {
            --i;
            continue;
        }
        buf += b;
    }
    return buf;
};

// const _show = function (s) {
//     console.log(s.top, s.right, s.bottom, s.left, s.x, s.y, s.width, s.height);
// };

export const isOutside = function (x, y, bcr) {
    // console.log(x, y, document.body.scrollLeft, document.body.scrollTop, document.documentElement.scrollLeft, document.documentElement.scrollTop);
    // _show(bcr);
    return x <= bcr.left + getDocScrollLeft() || x >= bcr.right + getDocScrollLeft() || y <= bcr.top + getDocScrollTop() || y >= bcr.bottom + getDocScrollTop();
};

export const isOutsideX = function (x, bcr) {
    return x <= bcr.left + getDocScrollLeft() || x >= bcr.right + getDocScrollLeft();
};

export const isOutsideY = function (y, bcr) {
    return y <= bcr.top + getDocScrollTop() || y >= bcr.bottom + getDocScrollTop();
};

export const getPositionState = function (source, target, event) {
    let ret = 0;
    const s = source.getBoundingClientRect();
    const t = target.getBoundingClientRect();

    if (s.bottom > t.top && s.right > t.left && s.top < t.bottom && s.left < t.right) {
        ret += azui.constants.dndStateConsts.touch;
    }

    const pointerX = event.pageX || event.touches[0].pageX;
    const pointerY = event.pageY || event.touches[0].pageY;
    if (!isOutside(pointerX, pointerY, t)) {
        ret += azui.constants.dndStateConsts.pointer;
    }

    if (s.top >= t.top && s.left >= t.left && s.bottom <= t.bottom && s.right <= t.right) {
        ret += azui.constants.dndStateConsts.source_all;
    }

    if (t.top >= s.top && t.left >= s.left && t.bottom <= s.bottom && t.right <= s.right) {
        ret += azui.constants.dndStateConsts.target_all;
    }

    const sx = getDocScrollLeft() + s.left + s.width / 2;
    const sy = getDocScrollTop() + s.top + s.height / 2;
    if (!isOutside(sx, sy, t)) {
        ret += azui.constants.dndStateConsts.source_center;
    }

    const tx = getDocScrollLeft() + t.left + t.width / 2;
    const ty = getDocScrollTop() + t.top + t.height / 2;
    if (!isOutside(tx, ty, s)) {
        ret += azui.constants.dndStateConsts.target_center;
    }
    return ret;
};

export const swapElement = function (e0, e1) {
    const temp = document.createElement('div');
    e0.parentNode.insertBefore(temp, e0.nextSibling);
    // $e0.before($temp);
    e1.parentNode.insertBefore(e0, e1.nextSibling);
    // $e1.before($e0);
    insertAfter(e1, temp);
    // temp.after($e1)
    temp.parentNode.removeChild(temp);
};

export const isTouchDevice = function () {
    // works on most browsers          // works on IE10/11 and Surface
    return 'ontouchstart' in window || navigator.maxTouchPoints;
};

export const getDocHeight = function () {
    return Math.max(
        Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
        Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
        Math.max(document.body.clientHeight, document.documentElement.clientHeight)
    );
};

export const getDocWidth = function () {
    return Math.max(
        Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
        Math.max(document.body.offsetWidth, document.documentElement.offsetWidth),
        Math.max(document.body.clientWidth, document.documentElement.clientWidth)
    );
};

export const getDocScrollLeft = function () {
    return Math.max(window.pageXOffset, document.documentElement.scrollLeft, document.body.scrollLeft);
}

export const getDocScrollTop = function () {
    return Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop);
}

export const textWidth = function (elem) {
    const s = parseDOMElement(`<span>${elem.innerHTML}</span>`)[0];
    s.style.visibility = 'hidden';
    insertAfter(s, elem);
    const width = getWidth(s);
    s.parentNode.removeChild(s);
    // console.log(width);
    return width;
};

export const elemSize = function (elem) {
    elem.style.visibility = 'hidden';
    document.body.appendChild(elem);
    const width = getWidth(elem);
    const height = getHeight(elem);
    document.body.removeChild(elem);
    elem.style.visibility = '';
    return {
        width,
        height
    };
};

export const calcMenuPosition = function (mx, my, mw, mh) {
    // mouse x, y, menu width, height
    const buf = 20;
    const m2p = 5;
    let x = 0;
    let y = 0;

    // const bw = getWidth(document.body);
    // const bh = getHeight(document.body);

    const bw = window.innerWidth;
    const bh = window.innerHeight;

    // console.log(mx, my, mw, mh, bw, bh, document.body.scrollTop, document.body.scrollLeft);
    if (mx + mw + buf < bw) {
        // console.log('enough on right');
        x = mx + m2p + getDocScrollLeft();
    } else if (mx > mw + buf) {
        // console.log('enough on left');
        x = mx - mw - m2p + getDocScrollLeft();
    }
    if (my + mh + buf < bh) {
        // console.log('enough on bottom');
        y = my + m2p + getDocScrollTop();
    } else if (my > mh + buf) {
        // console.log('enough on top');
        y = my - mh - m2p + getDocScrollTop();
    }
    return {
        x,
        y
    };
};

export const parseDOMElement = (domstring) => {
    return new DOMParser().parseFromString(domstring, 'text/html').body.childNodes;
};

// outer margin to outer margin
export const outerWidthTrue = function (el) {
    let width = el.offsetWidth;
    const style = getComputedStyle(el);
    width += parseInt(style.marginLeft) + parseInt(style.marginRight);
    return width;
};

export const outerHeightTrue = function (el) {
    let height = el.offsetHeight;
    const style = getComputedStyle(el);
    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
};

// inner padding to inner padding
export const getWidth = function (el) {
    let width = el.offsetWidth;
    const style = getComputedStyle(el);
    width -= (parseInt(style.paddingLeft) + parseInt(style.paddingRight) + parseInt(style.borderLeftWidth) + parseInt(style.borderRightWidth));
    return width;
};

export const getHeight = function (el) {
    let height = el.offsetHeight;
    const style = getComputedStyle(el);
    height -= (parseInt(style.paddingTop) + parseInt(style.paddingBottom) + parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth));
    return height;
};

// inner padding to inner padding
export const setWidth = function (el, w) {
    const style = getComputedStyle(el);
    if (style['box-sizing'] === 'border-box') {
        const borderLeft = parseInt(style["border-left-width"]);
        const borderRight = parseInt(style["border-right-width"]);
        const paddingLeft = parseInt(style["padding-left"]);
        const paddingRight = parseInt(style["padding-right"]);
        el.style.width = w + borderLeft + borderRight + paddingLeft + paddingRight + 'px';
    } else {
        el.style.width = w + 'px';
    }
};

export const setHeight = function (el, h) {
    const style = getComputedStyle(el);
    if (style['box-sizing'] === 'border-box') {
        const borderTop = parseInt(style["border-top-width"]);
        const borderBottom = parseInt(style["border-bottom-width"]);
        const paddingTop = parseInt(style["padding-top"]);
        const paddingBottom = parseInt(style["padding-bottom"]);
        // console.log(h, borderTop, borderBottom, paddingTop, paddingBottom);
        el.style.height = h + borderTop + borderBottom + paddingTop + paddingBottom + 'px';
    } else {
        el.style.height = h + 'px';
    }
};

// outer border to ourter border
export const setOuterWidth = function (el, w) {
    const style = getComputedStyle(el);
    if (style['box-sizing'] === 'border-box') {
        el.style.width = w + 'px';
    } else {
        const borderLeft = parseInt(style["border-left-width"]);
        const borderRight = parseInt(style["border-right-width"]);
        const paddingLeft = parseInt(style["padding-left"]);
        const paddingRight = parseInt(style["padding-right"]);
        el.style.width = w - borderLeft - borderRight - paddingLeft - paddingRight + 'px';
    }
};

export const setOuterHeight = function (el, h) {
    const style = getComputedStyle(el);
    if (style['box-sizing'] === 'border-box') {
        el.style.height = h + 'px';
    } else {
        const borderTop = parseInt(style["border-top-width"]);
        const borderBottom = parseInt(style["border-bottom-width"]);
        const paddingTop = parseInt(style["padding-top"]);
        const paddingBottom = parseInt(style["padding-bottom"]);
        el.style.height = h - borderTop - borderBottom - paddingTop - paddingBottom + 'px';
    }
};

export const insertAfter = function (newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
};

export const insertBefore = function (newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
};

export const siblings = function (el, selector) {
    if (selector) {
        return Array.prototype.filter.call(el.parentNode.children, function (child) {
            return matches(child, selector) && child !== el;
        });
    } else {
        return Array.prototype.filter.call(el.parentNode.children, function (child) {
            return child !== el;
        });
    }
};

export const index = function (node) {
    return Array.prototype.indexOf.call(node.parentNode.children, node);
};

export const matches = function (el, selector) {
    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
};

export const position = function (el) {
    const elStyles = getComputedStyle(el);
    const marginTop = parseInt(elStyles["margin-top"]);
    const marginLeft = parseInt(elStyles["margin-left"]);

    const elpStyles = getComputedStyle(el.parentNode);
    const pBorderTop = parseInt(elpStyles["border-top-width"]);
    const pBorderLeft = parseInt(elpStyles["border-left-width"]);

    const bcr = el.getBoundingClientRect();
    const pbcr = el.parentNode.getBoundingClientRect();

    const ret = {
        top: bcr.top - pbcr.top - pBorderTop - marginTop,
        left: bcr.left - pbcr.left - pBorderLeft - marginLeft,
    };
    return ret;
};

export const diffPosition = function (el0, el1) {
    const bcr0 = el0.getBoundingClientRect();
    const bcr1 = el1.getBoundingClientRect();

    const ret = {
        top: bcr0.top - bcr1.top,
        left: bcr0.left - bcr1.left,
    };
    return ret;
};

export const diffPositionInnerBorder = function (el0, el1) {
    const el0Styles = getComputedStyle(el0);
    const el0BorderTop = parseInt(el0Styles["border-top-width"]);
    const el0BorderLeft = parseInt(el0Styles["border-left-width"]);

    const el1pStyles = getComputedStyle(el1);
    const el1BorderTop = parseInt(el1pStyles["border-top-width"]);
    const el1BorderLeft = parseInt(el1pStyles["border-left-width"]);

    const bcr0 = el0.getBoundingClientRect();
    const bcr1 = el1.getBoundingClientRect();

    const ret = {
        top: bcr0.top + el0BorderTop - bcr1.top - el1BorderTop,
        left: bcr0.left + el0BorderLeft - bcr1.left - el1BorderLeft,
    };
    return ret;
};

export const remove = function (el) {
    el.parentNode.removeChild(el);
};

export const normalizeIcon = function (i) {
    if (typeof i === 'string') {
        return parseDOMElement(`<span>${i}</span>`)[0];
    } else if (typeof i === 'object') {
        const sp = document.createElement('span');
        sp.appendChild(i);
        return sp;
    } else if (typeof i === 'function') {
        return normalizeIcon(i());
    }
};

export const nextAll = (el, selector) => {
    const siblings = [];
    while (el = el.nextSibling) {
        if (el.nodeType === 1 && (!selector || matches(el, selector))) {
            siblings.push(el);
        }
    }
    return siblings;
};

export const prevAll = (el, selector) => {
    const siblings = [];
    while (el = el.previousSibling) {
        if (el.nodeType === 1 && (!selector || matches(el, selector))) {
            siblings.push(el);
        }
    }
    return siblings;
};

export const resolveDOM = dom => {
    if (dom instanceof Node) {
        return dom;
    } else if (typeof dom === 'string') {
        return document.querySelector(dom);
    } else if (typeof dom === 'function') {
        return resolveDOM(dom());
    }
};

export const empty = box => {
    while (box.lastChild) {
        box.removeChild(box.lastChild);
    }
};