import {
    Base
} from '../utilities/core.js';

import {
    isTouchDevice,
    getHeight,
    setHeight,
    getWidth,
    setWidth,
    setOuterWidth,
    setOuterHeight,
} from '../utilities/utilities.js';

azui.Resizable = function (el, options) {
    return new Resizable(el, options);
};

class Resizable extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({
            minWidth: 10,
            maxWidth: Number.MAX_SAFE_INTEGER,
            minHeight: 10,
            maxHeight: Number.MAX_SAFE_INTEGER,
            aspectRatio: false,
            handleSize: 10,
            handles: 'all', //n, e, s, w, ne, se, sw, nw, all
            // onDoubleClick: function (event) {
            //     // console.log(event.target);
            // },
            create: function (event, ui) {
                // console.log('create', ui);
            },
            start: function (event, ui) {
                // console.log('start', ui);
            },
            resize: function (event, ui) {
                // console.log('resize', ui);
            },
            stop: function (event, ui) {
                // console.log('stop', ui);
            },
        }, options);

        const parseHandles = function () {
            const h = {
                n: false,
                e: false,
                s: false,
                w: false,
                ne: false,
                se: false,
                sw: false,
                nw: false
            };
            const ah = settings.handles.split(',').map(item => item.trim());
            if (ah.includes('all')) {
                h.n = true;
                h.e = true;
                h.s = true;
                h.w = true;
                h.ne = true;
                h.se = true;
                h.sw = true;
                h.nw = true;
            } else {
                if (ah.includes('n')) {
                    h.n = true;
                }
                if (ah.includes('e')) {
                    h.e = true;
                }
                if (ah.includes('s')) {
                    h.s = true;
                }
                if (ah.includes('w')) {
                    h.w = true;
                }
                if (ah.includes('ne')) {
                    h.ne = true;
                }
                if (ah.includes('se')) {
                    h.se = true;
                }
                if (ah.includes('sw')) {
                    h.sw = true;
                }
                if (ah.includes('nw')) {
                    h.nw = true;
                }
            }

            return h;
        };

        const node = this.node;
        node.classList.add('azResizable');

        let position = getComputedStyle(node)['position'];
        if (position !== 'absolute' && position !== 'fixed') {
            node.style['position'] = 'relative';
        }

        const h = parseHandles();
        // console.log(h);

        const handleSize = isTouchDevice() ? settings.handleSize + 10 : settings.handleSize;
        let thisTop, thisLeft, thisWidth, thisHeight, thisAspectRatio;
        let prevTop, prevLeft, prevWidth, prevHeight;
        let mx, my = 0; // position of this element, and mouse x, y coordinate

        const eh = {};
        const createDraggingHandles = function () {
            Object.keys(h).map(d => {
                if (h[d]) {
                    const eld = document.createElement('div');
                    eld.classList.add('handle');
                    eld.style['position'] = 'absolute';
                    eld.style['z-index'] = Number.MAX_SAFE_INTEGER;
                    eld.style['cursor'] = `${d}-resize`;
                    node.appendChild(eld);
                    if (settings.onDoubleClick) {
                        azui.DoubleClick(eld, {
                            onDoubleClick: settings.onDoubleClick
                        });
                    }
                    eh[d] = eld;
                }
            });

            // console.log(eh);

            const resetHandles = function () {
                if (h.n) {
                    eh.n.style['top'] = -handleSize / 2 + 'px';
                    eh.n.style['bottom'] = '';
                    eh.n.style['right'] = '';
                    eh.n.style['left'] = 0;
                    eh.n.style['height'] = handleSize + 'px';
                    eh.n.style['width'] = '100%';
                }

                if (h.e) {
                    eh.e.style['right'] = -handleSize / 2 + 'px';
                    eh.e.style['left'] = '';
                    eh.e.style['bottom'] = '';
                    eh.e.style['top'] = 0;
                    eh.e.style['width'] = handleSize + 'px';
                    eh.e.style['height'] = '100%';
                }

                if (h.s) {
                    eh.s.style['bottom'] = -handleSize / 2 + 'px';
                    eh.s.style['top'] = '';
                    eh.s.style['right'] = '';
                    eh.s.style['left'] = 0;
                    eh.s.style['height'] = handleSize + 'px';
                    eh.s.style['width'] = '100%';
                }
                if (h.w) {
                    eh.w.style['left'] = -handleSize / 2 + 'px';
                    eh.w.style['right'] = '';
                    eh.w.style['bottom'] = '';
                    eh.w.style['top'] = 0;
                    eh.w.style['width'] = handleSize + 'px';
                    eh.w.style['height'] = '100%';
                }

                if (h.ne) {
                    eh.ne.style['left'] = '';
                    eh.ne.style['right'] = -handleSize / 2 + 'px';
                    eh.ne.style['bottom'] = '';
                    eh.ne.style['top'] = -handleSize / 2 + 'px';
                    eh.ne.style['width'] = handleSize + 'px';
                    eh.ne.style['height'] = handleSize + 'px';
                }
                if (h.se) {
                    eh.se.style['left'] = '';
                    eh.se.style['right'] = -handleSize / 2 + 'px';
                    eh.se.style['bottom'] = -handleSize / 2 + 'px';
                    eh.se.style['top'] = '';
                    eh.se.style['width'] = handleSize + 'px';
                    eh.se.style['height'] = handleSize + 'px';
                }
                if (h.sw) {
                    eh.sw.style['left'] = -handleSize / 2 + 'px';
                    eh.sw.style['right'] = '';
                    eh.sw.style['bottom'] = -handleSize / 2 + 'px';
                    eh.sw.style['top'] = '';
                    eh.sw.style['width'] = handleSize + 'px';
                    eh.sw.style['height'] = handleSize + 'px';
                }
                if (h.nw) {
                    eh.nw.style['left'] = -handleSize / 2 + 'px';
                    eh.nw.style['right'] = '';
                    eh.nw.style['bottom'] = '';
                    eh.nw.style['top'] = -handleSize / 2 + 'px';
                    eh.nw.style['width'] = handleSize + 'px';
                    eh.nw.style['height'] = handleSize + 'px';
                }
            };

            resetHandles();

            const onCreate = function (event, elem) {
                if (settings.create.call(node, event, node) === false) {
                    return false;
                }
                mx = event.clientX || event.touches[0].clientX;
                my = event.clientY || event.touches[0].clientY;

                let position = getComputedStyle(node)['position'];
                if (position === 'relative') {
                    const top = parseInt(node.style.top || 0);
                    const left = parseInt(node.style.left || 0);
                    thisTop = top;
                    thisLeft = left;
                    prevTop = top;
                    prevLeft = left;
                } else {
                    thisTop = node.offsetTop;
                    thisLeft = node.offsetLeft;
                    prevTop = node.offsetTop;
                    prevLeft = node.offsetLeft;
                }


                thisWidth = getWidth(node);
                thisHeight = getHeight(node);
                thisAspectRatio = (thisHeight * 1.0) / (thisWidth * 1.0);
                event.preventDefault(); // prevent text from selecting and mobile screen view port from moving around.
            };

            const onStart = function (event, elem) {
                if (settings.start.call(node, event, node) === false) {
                    return false;
                }
            };

            const onStop = function (event, elem) {
                if (settings.stop.call(node, event, node) === false) {
                    return false;
                }
                resetHandles();
            }

            const checkMinWidth = function () {
                if (node.offsetWidth < settings.minWidth) {
                    node.style.left = prevLeft;
                    setOuterWidth(node, settings.minWidth);
                }
            };
            const checkMaxWidth = function () {
                if (node.offsetWidth > settings.maxWidth) {
                    node.style.left = prevLeft;
                    setOuterWidth(node, settings.maxWidth);
                }
            };
            const checkMinHeight = function () {
                if (node.offsetHeight < settings.minHeight) {
                    node.style.top = prevTop;
                    setOuterHeight(node, settings.minHeight);
                }
            };
            const checkMaxHeight = function () {
                if (node.offsetHeight > settings.maxHeight) {
                    node.style.top = prevTop;
                    setOuterHeight(node, settings.maxHeight);
                }
            };
            const checkAspectRatio = function () {
                if (!settings.aspectRatio) {
                    return;
                }
                let ar;
                if (settings.aspectRatio === true) {
                    ar = thisAspectRatio;
                } else if (typeof settings.aspectRatio === 'number') {
                    ar = settings.aspectRatio;
                } else {
                    return;
                }
                if (getHeight(node) / getWidth(node) > ar) {
                    setWidth(node, getHeight(node) / ar);
                } else if (getHeight(node) / getWidth(node) < ar) {
                    setHeight(node, getWidth(node) * ar);
                }
            };
            const checkAll = function () {
                checkMinWidth();
                checkMaxWidth();
                checkMinHeight();
                checkMaxHeight();
                checkAspectRatio();
            };

            h.n && azui.Draggable(eh.n, {
                axis: 'y',
                create: onCreate,
                start: onStart,
                drag: function (event, elem) {
                    if (settings.resize.call(node, event, node) === false) {
                        return false;
                    }
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;
                    prevTop = node.style.top;
                    node.style.top = (thisTop + nmy - my) + 'px';
                    setHeight(node, thisHeight - nmy + my);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });
            h.e && azui.Draggable(eh.e, {
                axis: 'x',
                create: onCreate,
                start: onStart,
                drag: function (event, elem) {
                    if (settings.resize.call(node, event, node) === false) {
                        return false;
                    }
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;
                    setWidth(node, thisWidth + nmx - mx);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });
            h.s && azui.Draggable(eh.s, {
                axis: 'y',
                create: onCreate,
                start: onStart,
                drag: function (event, elem) {
                    if (settings.resize.call(node, event, node) === false) {
                        return false;
                    }
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;
                    prevHeight = getHeight(node);
                    setHeight(node, thisHeight + nmy - my);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });
            h.w && azui.Draggable(eh.w, {
                axis: 'x',
                create: onCreate,
                start: onStart,
                drag: function (event, elem) {
                    if (settings.resize.call(node, event, node) === false) {
                        return false;
                    }
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;
                    prevLeft = node.style.left;
                    node.style.left = (thisLeft + nmx - mx) + 'px';
                    prevWidth = getWidth(node);
                    setWidth(node, thisWidth - nmx + mx);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });

            h.ne && azui.Draggable(eh.ne, {
                create: onCreate,
                start: onStart,
                drag: function (event, elem) {
                    if (settings.resize.call(node, event, node) === false) {
                        return false;
                    }
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;
                    prevTop = node.style.top;
                    node.style.top = (thisTop + nmy - my) + 'px';
                    prevHeight = getHeight(node);
                    prevWidth = getWidth(node);
                    setHeight(node, thisHeight - nmy + my);
                    setWidth(node, thisWidth + nmx - mx);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });
            h.se && azui.Draggable(eh.se, {
                create: onCreate,
                start: onStart,
                drag: function (event, elem) {
                    if (settings.resize.call(node, event, node) === false) {
                        return false;
                    }
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;
                    prevHeight = getHeight(node);
                    prevWidth = getWidth(node);
                    setHeight(node, thisHeight + nmy - my);
                    setWidth(node, thisWidth + nmx - mx);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });
            h.sw && azui.Draggable(eh.sw, {
                create: onCreate,
                start: onStart,
                drag: function (event, elem) {
                    if (settings.resize.call(node, event, node) === false) {
                        return false;
                    }
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;
                    prevHeight = getHeight(node);
                    prevWidth = getWidth(node);
                    setHeight(node, thisHeight + nmy - my);
                    prevLeft = node.style.left;
                    node.style.left = (thisLeft + nmx - mx) + 'px';
                    setWidth(node, thisWidth - nmx + mx);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });
            h.nw && azui.Draggable(eh.nw, {
                create: onCreate,
                start: onStart,
                drag: function (event, elem) {
                    if (settings.resize.call(node, event, node) === false) {
                        return false;
                    }
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;
                    prevLeft = node.style.left;
                    node.style.left = (thisLeft + nmx - mx) + 'px';
                    prevHeight = getHeight(node);
                    prevWidth = getWidth(node);
                    setWidth(node, thisWidth - nmx + mx);
                    prevTop = node.style.top;
                    node.style.top = (thisTop + nmy - my) + 'px';
                    setHeight(node, thisHeight - nmy + my);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });
        };

        createDraggingHandles();
    }
};