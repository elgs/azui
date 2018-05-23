import {
    Base
} from '../utilities/core.js';

import {
    isTouchDevice,
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

        const self = this;
        const node = this.node;
        node.classList.add('azResizable');

        self.settings = settings;

        let position = getComputedStyle(node)['position'];
        if (position !== 'absolute' && position !== 'fixed') {
            position = 'relative';
            node.style['position'] = position;
        }

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
        const h = parseHandles();
        // console.log(h);

        const handleSize = isTouchDevice() ? settings.handleSize + 4 : settings.handleSize;
        let thisAspectRatio;
        let mx, my = 0; // position of this element, and mouse x, y coordinate

        const eh = {};
        const getCursor = d => {
            if (d === 'e' || d === 'w') {
                return 'ew-resize';
            }else if (d === 'n' || d === 's') {
                return 'ns-resize';
            }else if (d === 'ne' || d === 'sw') {
                return 'nesw-resize';
            }else if (d === 'se' || d === 'nw') {
                return 'nwse-resize';
            }
        };
        const createDraggingHandles = function () {
            Object.keys(h).map(d => {
                if (h[d]) {
                    const eld = document.createElement('div');
                    eld.classList.add('handle');
                    eld.style['position'] = 'absolute';
                    eld.style['z-index'] = Number.MAX_SAFE_INTEGER;
                    console.log(d);
                    eld.style['cursor'] = getCursor(d);
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

                if (position === 'relative') {
                    self.thisTop = parseInt(node.style.top || 0);
                    self.thisLeft = parseInt(node.style.left || 0);
                } else {
                    // child outer border to parent inner border
                    self.thisTop = node.offsetTop;
                    self.thisLeft = node.offsetLeft;
                }

                // outer border to outer border
                self.thisWidth = node.offsetWidth;
                self.thisHeight = node.offsetHeight;

                self.yToMax = settings.maxHeight - self.thisHeight;
                self.yToMin = self.thisHeight - settings.minHeight;
                self.xToMax = settings.maxWidth - self.thisWidth;
                self.xToMin = self.thisWidth - settings.minWidth;

                thisAspectRatio = (self.thisHeight * 1.0) / (self.thisWidth * 1.0);
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
                if (getOuterHeight(node) / getOuterWidth(node) > ar) {
                    setOuterWidth(node, getOuterHeight(node) / ar);
                } else if (getOuterHeight(node) / getOuterWidth(node) < ar) {
                    setOuterHeight(node, getOuterWidth(node) * ar);
                }
            };
            const checkAll = function () {
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

                    const dy = nmy - my;
                    self.moveN(dy);
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

                    const dx = nmx - mx;
                    self.moveE(dx);
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

                    const dy = nmy - my;
                    self.moveS(dy);
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

                    const dx = nmx - mx;
                    self.moveW(dx);
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

                    const dx = nmx - mx;
                    const dy = nmy - my;

                    self.moveN(dy);
                    self.moveE(dx);
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

                    const dx = nmx - mx;
                    const dy = nmy - my;

                    self.moveS(dy);
                    self.moveE(dx);
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

                    const dx = nmx - mx;
                    const dy = nmy - my;

                    self.moveS(dy);
                    self.moveW(dx);
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

                    const dx = nmx - mx;
                    const dy = nmy - my;

                    self.moveN(dy);
                    self.moveW(dx);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });
        };

        createDraggingHandles();
    }

    moveN(by) {
        const self = this;
        if (by > self.yToMin) {
            by = self.yToMin;
        } else if (-by > self.yToMax) {
            by = -self.yToMax;
        }
        self.node.style.top = (self.thisTop + by) + 'px';
        setOuterHeight(self.node, self.thisHeight - by);
    }
    moveE(by) {
        const self = this;
        if (by > self.xToMax) {
            by = self.xToMax;
        } else if (-by > self.xToMin) {
            by = -self.xToMin;
        }
        setOuterWidth(self.node, self.thisWidth + by);
    }
    moveS(by) {
        const self = this;
        if (by > self.yToMax) {
            by = self.yToMax;
        } else if (-by > self.yToMin) {
            by = -self.yToMin;
        }
        setOuterHeight(self.node, self.thisHeight + by);
    }
    moveW(by) {
        const self = this;
        if (-by > self.xToMax) {
            by = -self.xToMax;
        } else if (by > self.xToMin) {
            by = self.xToMin;
        }
        self.node.style.left = (self.thisLeft + by) + 'px';
        setOuterWidth(self.node, self.thisWidth - by);
    }
};