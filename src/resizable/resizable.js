import {
    Base
} from '../utilities/core.js';

import * as icons from '../utilities/icons.js';

import {
    isTouchDevice,
    setOuterWidth,
    setOuterHeight,
    normalizeIcon,
    getWidth,
    getHeight,
    setWidth,
    setHeight,
} from '../utilities/utilities.js';

azui.Resizable = function (el, options) {
    return new Resizable(el, options);
};

class Resizable extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({
            minWidth: 0,
            maxWidth: Number.MAX_SAFE_INTEGER,
            minHeight: 0,
            maxHeight: Number.MAX_SAFE_INTEGER,
            aspectRatio: false,
            handleSize: 6,
            handles: 'all', //n, e, s, w, ne, se, sw, nw, all
            moveOnResize: true,
            hideHandles: false,
            hideCollapseButton: false,
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
            collapse: function (event, ui, collapse) {
                console.log('collapse', ui);
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

        let thisAspectRatio;
        let mx, my = 0; // position of this element, and mouse x, y coordinate

        const eh = {};
        self.handles = eh;

        const getCursor = d => {
            if (d === 'e' || d === 'w') {
                return 'ew-resize';
            } else if (d === 'n' || d === 's') {
                return 'ns-resize';
            } else if (d === 'ne' || d === 'sw') {
                return 'nesw-resize';
            } else if (d === 'se' || d === 'nw') {
                return 'nwse-resize';
            }
        };
        const createDraggingHandles = function () {

            let inHandle = false;
            let inButton = false;

            const createCollapseButton = function (direction) {
                const collapseButton = document.createElement('div');
                collapseButton.addEventListener('mouseenter', function (e) {
                    inButton = true;
                    e.currentTarget.parentNode.classList.remove('active');
                    e.currentTarget.classList.add('active');
                });
                collapseButton.addEventListener('mouseleave', function (e) {
                    inButton = false;
                    e.currentTarget.classList.remove('active');
                    if (inHandle) {
                        e.currentTarget.parentNode.classList.add('active');
                    }
                });

                collapseButton.classList.add('collapseButton');

                if (direction === 'n' || direction === 's') {
                    collapseButton.classList.add('collapseButtonH');
                    collapseButton.addEventListener('click', function (e) {
                        self.collapseY();
                    });

                    const collapseIconDown = normalizeIcon(icons.svgTriangleDown);
                    collapseIconDown.classList.add('collapseIcon', 'collapseIconDown');
                    collapseButton.appendChild(collapseIconDown);

                    const collapseIconUp = normalizeIcon(icons.svgTriangleUp);
                    collapseIconUp.classList.add('collapseIcon', 'collapseIconUp');
                    collapseButton.appendChild(collapseIconUp);
                } else if (direction === 'w' || direction === 'e') {
                    collapseButton.classList.add('collapseButtonV');
                    collapseButton.addEventListener('click', function (e) {
                        self.collapseX();
                    });

                    const collapseIconRight = normalizeIcon(icons.svgTriangleRight);
                    collapseIconRight.classList.add('collapseIcon', 'collapseIconRight');
                    collapseButton.appendChild(collapseIconRight);

                    const collapseIconLeft = normalizeIcon(icons.svgTriangleLeft);
                    collapseIconLeft.classList.add('collapseIcon', 'collapseIconLeft');
                    collapseButton.appendChild(collapseIconLeft);
                }
                return collapseButton;
            };

            Object.keys(h).map(d => {
                if (h[d]) {
                    const eld = document.createElement('div');
                    eld.classList.add('handle');
                    eld.style['z-index'] = Number.MAX_SAFE_INTEGER;
                    eld.style['cursor'] = getCursor(d);
                    if (settings.hideHandles) {
                        eld.style['opacity'] = 0;
                    } else if (!settings.hideCollapseButton) {
                        if (d.length === 1) {
                            // exclude corner handles
                            const collapseButton = createCollapseButton(d);
                            eld.appendChild(collapseButton);
                        }
                        eld.addEventListener('mouseenter', function (e) {
                            inHandle = true;
                            const ct = e.currentTarget;
                            setTimeout(() => {
                                if (!inButton) {
                                    ct.classList.add('active');
                                }
                            });
                        });
                        eld.addEventListener('mouseleave', function (e) {
                            inHandle = false;
                            e.currentTarget.classList.remove('active');
                        });
                    }
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

            self._resetHandles();

            const onCreate = function (event, elem) {
                if (settings.create.call(node, event, elem) === false) {
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
                if (settings.start.call(node, event, elem) === false) {
                    return false;
                }

                const w = getWidth(self.node);
                const h = getHeight(self.node);
                // setWidth(self.node, w);
                // setHeight(self.node, h);

                if (h > 0) {
                    self.node.setAttribute('azCollapseHeight', h);
                }
                if (w > 0) {
                    self.node.setAttribute('azCollapseWidth', w);
                }

                elem.classList.add('active');
            };

            const onStop = function (event, elem) {
                if (settings.stop.call(node, event, elem) === false) {
                    return false;
                }
                elem.classList.remove('active');

                setTimeout(() => {
                    self._resetHandles();
                    self._resetCollapseIconStyle();
                });
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

                const w = getWidth(self.node);
                const h = getHeight(self.node);
                // console.log(w, h);
                if (w <= 10 || h <= 10) {
                    self.node.style.overflow = 'hidden';
                } else {
                    self.node.style.overflow = '';
                }
            };

            h.n && azui.Draggable(eh.n, {
                axis: 'y',
                create: onCreate,
                start: onStart,
                drag: function (event, elem) {
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;
                    const by = {
                        dy: nmy - my
                    };

                    if (settings.resize.call(node, event, eh.n, by) === false) {
                        return false;
                    }

                    self.moveN(by.dy);
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
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;

                    const by = {
                        dx: nmx - mx
                    };

                    if (settings.resize.call(node, event, eh.e, by) === false) {
                        return false;
                    }

                    self.moveE(by.dx);
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
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;

                    const by = {
                        dy: nmy - my
                    };

                    if (settings.resize.call(node, event, eh.s, by) === false) {
                        return false;
                    }

                    self.moveS(by.dy);
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
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;

                    const by = {
                        dx: nmx - mx
                    };

                    if (settings.resize.call(node, event, eh.w, by) === false) {
                        return false;
                    }

                    self.moveW(by.dx);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });

            h.ne && azui.Draggable(eh.ne, {
                create: onCreate,
                start: onStart,
                drag: function (event, elem) {
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;

                    const dx = nmx - mx;
                    const dy = nmy - my;

                    const by = {
                        dx,
                        dy
                    };

                    if (settings.resize.call(node, event, eh.ne, by) === false) {
                        return false;
                    }

                    self.moveN(by.dy);
                    self.moveE(by.dx);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });
            h.se && azui.Draggable(eh.se, {
                create: onCreate,
                start: onStart,
                drag: function (event, elem) {
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;

                    const dx = nmx - mx;
                    const dy = nmy - my;

                    const by = {
                        dx,
                        dy
                    };

                    if (settings.resize.call(node, event, eh.se, by) === false) {
                        return false;
                    }

                    self.moveS(by.dy);
                    self.moveE(by.dx);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });
            h.sw && azui.Draggable(eh.sw, {
                create: onCreate,
                start: onStart,
                drag: function (event, elem) {
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;

                    const dx = nmx - mx;
                    const dy = nmy - my;

                    const by = {
                        dx,
                        dy
                    };

                    if (settings.resize.call(node, event, eh.sw, by) === false) {
                        return false;
                    }

                    self.moveS(by.dy);
                    self.moveW(by.dx);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });
            h.nw && azui.Draggable(eh.nw, {
                create: onCreate,
                start: onStart,
                drag: function (event, elem) {
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;

                    const dx = nmx - mx;
                    const dy = nmy - my;

                    const by = {
                        dx,
                        dy
                    };

                    if (settings.resize.call(node, event, eh.nw, by) === false) {
                        return false;
                    }

                    self.moveN(by.dy);
                    self.moveW(by.dx);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });
        };

        createDraggingHandles();
        self._resetCollapseIconStyle();
    }

    moveN(by) {
        const self = this;
        if (by > self.yToMin) {
            by = self.yToMin;
        } else if (-by > self.yToMax) {
            by = -self.yToMax;
        }
        if (self.settings.moveOnResize) {
            self.node.style.top = (self.thisTop + by) + 'px';
        }
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
        if (self.settings.moveOnResize) {
            self.node.style.left = (self.thisLeft + by) + 'px';
        }
        setOuterWidth(self.node, self.thisWidth - by);
    }

    collapseX() {
        const self = this;
        const w = getWidth(self.node);
        const h = getHeight(self.node);
        setWidth(self.node, w);
        setHeight(self.node, h);

        if (w > 0) {
            self.node.setAttribute('azCollapseWidth', w);
            self.node.style.overflow = 'hidden';
            setWidth(self.node, 0);
        } else {
            const storedW = self.node.getAttribute('azCollapseWidth') * 1;
            if (!isNaN(storedW)) {
                self.node.style.overflow = '';
                setWidth(self.node, storedW);
            }
        }
    }

    collapseY() {
        const self = this;
        const w = getWidth(self.node);
        const h = getHeight(self.node);
        setWidth(self.node, w);
        setHeight(self.node, h);

        if (h > 0) {
            self.node.setAttribute('azCollapseHeight', h);
            self.node.style.overflow = 'hidden';
            setHeight(self.node, 0);
        } else {
            const storedH = self.node.getAttribute('azCollapseHeight') * 1;
            if (!isNaN(storedH)) {
                self.node.style.overflow = '';
                setHeight(self.node, storedH);
            }
        }
    }

    _resetCollapseIconStyle() {
        const self = this;
        if (self.hideCollapseButton) {
            return;
        }

        const w = getWidth(self.node);
        const h = getHeight(self.node);

        if (self.handles.n) {
            const up = self.handles.n.querySelector('span.collapseIconUp');
            const down = self.handles.n.querySelector('span.collapseIconDown');
            if (h > 0) {
                up.classList.add('azHide');
                down.classList.remove('azHide');
            } else {
                up.classList.remove('azHide');
                down.classList.add('azHide');
            }
        }
        if (self.handles.e) {
            const left = self.handles.e.querySelector('span.collapseIconLeft');
            const right = self.handles.e.querySelector('span.collapseIconRight');
            if (w > 0) {
                left.classList.remove('azHide');
                right.classList.add('azHide');
            } else {
                left.classList.add('azHide');
                right.classList.remove('azHide');
            }
        }
        if (self.handles.s) {
            const up = self.handles.s.querySelector('span.collapseIconUp');
            const down = self.handles.s.querySelector('span.collapseIconDown');
            if (h > 0) {
                up.classList.remove('azHide');
                down.classList.add('azHide');
            } else {
                up.classList.add('azHide');
                down.classList.remove('azHide');
            }
        }
        if (self.handles.w) {
            const left = self.handles.w.querySelector('span.collapseIconLeft');
            const right = self.handles.w.querySelector('span.collapseIconRight');
            if (w > 0) {
                left.classList.add('azHide');
                right.classList.remove('azHide');
            } else {
                left.classList.remove('azHide');
                right.classList.add('azHide');
            }
        }
    }

    _resetHandles() {
        const self = this;
        const handleSize = isTouchDevice() ? self.settings.handleSize + 4 : self.settings.handleSize;
        if (self.handles.n) {
            self.handles.n.style['top'] = 0;
            self.handles.n.style['bottom'] = '';
            self.handles.n.style['right'] = '';
            self.handles.n.style['left'] = 0;
            self.handles.n.style['height'] = handleSize + 'px';
            self.handles.n.style['width'] = '100%';
        }

        if (self.handles.e) {
            self.handles.e.style['right'] = 0;
            self.handles.e.style['left'] = '';
            self.handles.e.style['bottom'] = '';
            self.handles.e.style['top'] = 0;
            self.handles.e.style['width'] = handleSize + 'px';
            self.handles.e.style['height'] = '100%';
        }

        if (self.handles.s) {
            self.handles.s.style['bottom'] = 0;
            self.handles.s.style['top'] = '';
            self.handles.s.style['right'] = '';
            self.handles.s.style['left'] = 0;
            self.handles.s.style['height'] = handleSize + 'px';
            self.handles.s.style['width'] = '100%';
        }
        if (self.handles.w) {
            self.handles.w.style['left'] = 0;
            self.handles.w.style['right'] = '';
            self.handles.w.style['bottom'] = '';
            self.handles.w.style['top'] = 0;
            self.handles.w.style['width'] = handleSize + 'px';
            self.handles.w.style['height'] = '100%';
        }

        if (self.handles.ne) {
            self.handles.ne.style['left'] = '';
            self.handles.ne.style['right'] = 0;
            self.handles.ne.style['bottom'] = '';
            self.handles.ne.style['top'] = 0;
            self.handles.ne.style['width'] = handleSize + 'px';
            self.handles.ne.style['height'] = handleSize + 'px';
        }
        if (self.handles.se) {
            self.handles.se.style['left'] = '';
            self.handles.se.style['right'] = 0;
            self.handles.se.style['bottom'] = 0;
            self.handles.se.style['top'] = '';
            self.handles.se.style['width'] = handleSize + 'px';
            self.handles.se.style['height'] = handleSize + 'px';
        }
        if (self.handles.sw) {
            self.handles.sw.style['left'] = 0;
            self.handles.sw.style['right'] = '';
            self.handles.sw.style['bottom'] = 0;
            self.handles.sw.style['top'] = '';
            self.handles.sw.style['width'] = handleSize + 'px';
            self.handles.sw.style['height'] = handleSize + 'px';
        }
        if (self.handles.nw) {
            self.handles.nw.style['left'] = 0;
            self.handles.nw.style['right'] = '';
            self.handles.nw.style['bottom'] = '';
            self.handles.nw.style['top'] = 0;
            self.handles.nw.style['width'] = handleSize + 'px';
            self.handles.nw.style['height'] = handleSize + 'px';
        }
    }
};