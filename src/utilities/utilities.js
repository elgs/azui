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
const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const digit = "0123456789";
const punct = "~!@#$%^&*()_+-=";

export function randGen(size, set, include, exclude) {
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
    // console.log(x, y);
    // _show(bcr);
    return x <= bcr.left || x >= bcr.right || y <= bcr.top || y >= bcr.bottom;
};


export const dndStateConsts = {
    touch: 1 << 0,
    source_all: 1 << 1,
    target_all: 1 << 2,
    source_center: 1 << 3,
    target_center: 1 << 4,
};

export const getPositionState = function (source, target) {
    let ret = 0;
    const s = source.getBoundingClientRect();
    const t = target.getBoundingClientRect();

    if (s.bottom > t.top && s.right > t.left && s.top < t.bottom && s.left < t.right) {
        ret += dndStateConsts.touch;
    }

    if (s.top >= t.top && s.left >= t.left && s.bottom <= t.bottom && s.right <= t.right) {
        ret += dndStateConsts.source_all;
    }

    if (t.top >= s.top && t.left >= s.left && t.bottom <= s.bottom && t.right <= s.right) {
        ret += dndStateConsts.target_all;
    }

    const sx = s.left + s.width / 2;
    const sy = s.top + s.height / 2;
    if (!isOutside(sx, sy, t)) {
        ret += dndStateConsts.source_center;
    }

    const tx = t.left + t.width / 2;
    const ty = t.top + t.height / 2;
    if (!isOutside(tx, ty, s)) {
        ret += dndStateConsts.target_center;
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

export const registerDropTarget = function (key, elem) {
    azui.data['azDropTargets'] = azui.data['azDropTargets'] || {};
    const dt = azui.data['azDropTargets'];

    if (elem) {
        dt[key] = dt[key] || [];
        dt[key].push(elem);
    }
};

export const getDropTargets = function (key) {
    const dt = azui.data['azDropTargets'];
    if (dt) {
        return dt[key] || [];
    }
    return [];
};

export const textWidth = function (elem) {
    const s = parseDOMElement(`<span>${elem.innerHTML}</span>`)[0];
    s.style.visibility = 'hidden';
    insertAfter(s, elem);
    const width = getWidth(s);
    s.parentNode.removeChild(s);
    // console.log(width);
    return width;
};

export const calcMenuPosition = function (mx, my, mw, mh) {
    // mouse x, y, menu width, height
    const buf = 20;
    let x = 0;
    let y = 0;
    const bw = getWidth(document.documentElement);
    const bh = getHeight(document.documentElement);
    if (mx + mw + buf < bw) {
        // enough on right
        x = mx + 1;
    } else if (mx > mw + buf) {
        // enough on left
        x = mx - mw - 1;
    }
    if (my + mh + buf < bh) {
        // enough on bottom
        y = my + 1;
    } else if (my > mh + buf) {
        // enough on top
        y = my - mh - 1;
    }
    return {
        x,
        y
    };
};

export const parseDOMElement = (domstring) => {
    return new DOMParser().parseFromString(domstring, 'text/html').body.childNodes;
};

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

export const setWidth = function (el, w) {
    if (getComputedStyle(el)['box-sizing'] === 'border-box') {
        const borderLeft = parseInt(getComputedStyle(el)["border-left-width"]);
        const borderRight = parseInt(getComputedStyle(el)["border-right-width"]);
        const paddingLeft = parseInt(getComputedStyle(el)["padding-left"]);
        const paddingRight = parseInt(getComputedStyle(el)["padding-right"]);
        el.style.width = w + borderLeft + borderRight + paddingLeft + paddingRight + 'px';
    } else {
        el.style.width = w + 'px';
    }
};

export const setHeight = function (el, h) {
    if (getComputedStyle(el)['box-sizing'] === 'border-box') {
        const borderTop = parseInt(getComputedStyle(el)["border-top-width"]);
        const borderBottom = parseInt(getComputedStyle(el)["border-bottom-width"]);
        const paddingTop = parseInt(getComputedStyle(el)["padding-top"]);
        const paddingBottom = parseInt(getComputedStyle(el)["padding-bottom"]);
        el.style.height = h + borderTop + borderBottom + paddingTop + paddingBottom + 'px';
    } else {
        el.style.height = h + 'px';
    }
};

export const setOuterWidth = function (el, w) {
    if (getComputedStyle(el)['box-sizing'] === 'border-box') {
        el.style.width = w + 'px';
    } else {
        const borderLeft = parseInt(getComputedStyle(el)["border-left-width"]);
        const borderRight = parseInt(getComputedStyle(el)["border-right-width"]);
        const paddingLeft = parseInt(getComputedStyle(el)["padding-left"]);
        const paddingRight = parseInt(getComputedStyle(el)["padding-right"]);
        el.style.width = w - borderLeft - borderRight - paddingLeft - paddingRight + 'px';
    }
};

export const setOuterHeight = function (el, w) {
    if (getComputedStyle(el)['box-sizing'] === 'border-box') {
        el.style.height = h + 'px';
    } else {
        const borderTop = parseInt(getComputedStyle(el)["border-top-width"]);
        const borderBottom = parseInt(getComputedStyle(el)["border-bottom-width"]);
        const paddingTop = parseInt(getComputedStyle(el)["padding-top"]);
        const paddingBottom = parseInt(getComputedStyle(el)["padding-bottom"]);
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
    let siblings = Array.prototype.filter.call(el.parentNode.children, function (child) {
        return child !== el;
    });
    if (selector) {
        siblings = Array.prototype.filter.call(el.parentNode.children, function (child) {
            return matches(child, selector);
        });
    }

    return siblings;
};

export const index = function (node) {
    return Array.prototype.indexOf.call(node.parentNode.childNodes, node);
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

export const remove = function (el) {
    el.parentNode.removeChild(el);
};

export const normalizeIcon = function (i) {
    if (typeof i === 'function') {
        i = i();
    }
    if (typeof i === 'string' || typeof i === 'number') {
        i = document.createTextNode(i);
    }
    return i;
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