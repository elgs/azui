import {
    azObj,
    Base
} from '../utilities/core.js';
import * as icons from '../utilities/icons.js';
import {
    getHeight,
    getWidth,
    isTouchDevice,
    normalizeIcon,
    setHeight,
    setOuterHeight,
    setOuterWidth,
    setWidth
} from '../utilities/utilities.js';

azui.Resizable = function (el, options, init) {
    return azObj(Resizable, el, options, init);
};

class Resizable extends Base {

    static className = 'Resizable';

    azInit(options) {
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
            collapse: function (event, ui, wh) {
                // console.log(this, event, ui, wh);
            },
        }, options);

        const me = this;
        const node = this.node;
        node.classList.add('azResizable');

        me.settings = settings;

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
        me.handles = eh;

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
                        me.collapseY(e, collapseButton);
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
                        me.collapseX(e, collapseButton);
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

            me._resetHandles();

            const onCreate = function (event, elem) {
                if (settings.create.call(node, event, elem) === false) {
                    return false;
                }
                mx = event.clientX || event.touches[0].clientX;
                my = event.clientY || event.touches[0].clientY;

                if (position === 'relative') {
                    me.thisTop = parseInt(node.style.top || 0);
                    me.thisLeft = parseInt(node.style.left || 0);
                } else {
                    // child outer border to parent inner border
                    me.thisTop = node.offsetTop;
                    me.thisLeft = node.offsetLeft;
                }

                // outer border to outer border
                me.thisWidth = node.offsetWidth;
                me.thisHeight = node.offsetHeight;

                me.yToMax = settings.maxHeight - me.thisHeight;
                me.yToMin = me.thisHeight - settings.minHeight;
                me.xToMax = settings.maxWidth - me.thisWidth;
                me.xToMin = me.thisWidth - settings.minWidth;

                thisAspectRatio = (me.thisHeight * 1.0) / (me.thisWidth * 1.0);
                event.preventDefault(); // prevent text from selecting and mobile screen view port from moving around.
                // console.log('create');
            };

            const onStart = function (event, elem) {
                if (settings.start.call(node, event, elem) === false) {
                    return false;
                }

                const w = getWidth(me.node);
                const h = getHeight(me.node);
                // setWidth(me.node, w);
                // setHeight(me.node, h);

                if (h > 0) {
                    me.node.setAttribute('azCollapseHeight', h);
                }
                if (w > 0) {
                    me.node.setAttribute('azCollapseWidth', w);
                }

                elem.classList.add('active');
            };

            const onStop = function (event, elem) {
                if (settings.stop.call(node, event, elem) === false) {
                    return false;
                }
                elem.classList.remove('active');

                setTimeout(() => {
                    me._resetHandles();
                    me._resetCollapseIconStyle();
                });
                // console.log('stop');
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
                    const nmx = event.clientX || event.touches[0].clientX;
                    const nmy = event.clientY || event.touches[0].clientY;
                    const by = {
                        dy: nmy - my
                    };

                    if (settings.resize.call(node, event, eh.n, by) === false) {
                        return false;
                    }

                    me.moveN(by.dy);
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

                    me.moveE(by.dx);
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

                    me.moveS(by.dy);
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

                    me.moveW(by.dx);
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

                    me.moveN(by.dy);
                    me.moveE(by.dx);
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

                    me.moveS(by.dy);
                    me.moveE(by.dx);
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

                    me.moveS(by.dy);
                    me.moveW(by.dx);
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

                    me.moveN(by.dy);
                    me.moveW(by.dx);
                    checkAll();
                    return false;
                },
                stop: onStop,
            });
        };

        createDraggingHandles();
        me._resetCollapseIconStyle();
    }

    moveN(by) {
        const me = this;
        if (by > me.yToMin) {
            by = me.yToMin;
        } else if (-by > me.yToMax) {
            by = -me.yToMax;
        }
        if (me.settings.moveOnResize) {
            me.node.style.top = (me.thisTop + by) + 'px';
        }
        setOuterHeight(me.node, me.thisHeight - by);
    }
    moveE(by) {
        const me = this;
        if (by > me.xToMax) {
            by = me.xToMax;
        } else if (-by > me.xToMin) {
            by = -me.xToMin;
        }
        setOuterWidth(me.node, me.thisWidth + by);
    }
    moveS(by) {
        const me = this;
        if (by > me.yToMax) {
            by = me.yToMax;
        } else if (-by > me.yToMin) {
            by = -me.yToMin;
        }
        setOuterHeight(me.node, me.thisHeight + by);
    }
    moveW(by) {
        const me = this;
        if (-by > me.xToMax) {
            by = -me.xToMax;
        } else if (by > me.xToMin) {
            by = me.xToMin;
        }
        if (me.settings.moveOnResize) {
            me.node.style.left = (me.thisLeft + by) + 'px';
        }
        setOuterWidth(me.node, me.thisWidth - by);
    }

    collapseX(event, ui) {
        const me = this;
        const w = getWidth(me.node);
        setWidth(me.node, w);

        if (w > 0) {
            me.node.setAttribute('azCollapseWidth', w);
            setWidth(me.node, 0);
            me.settings.collapse.call(me.node, event, ui, w);
        } else {
            const storedW = me.node.getAttribute('azCollapseWidth') * 1;
            setWidth(me.node, storedW);
            me.settings.collapse.call(me.node, event, ui, -storedW);
        }

        me._resetCollapseIconStyle();
    }

    collapseY(event, ui) {
        const me = this;
        const h = getHeight(me.node);
        setHeight(me.node, h);

        if (h > 0) {
            me.node.setAttribute('azCollapseHeight', h);
            setHeight(me.node, 0);
            me.settings.collapse.call(me.node, event, ui, h);
        } else {
            const storedH = me.node.getAttribute('azCollapseHeight') * 1;
            setHeight(me.node, storedH);
            me.settings.collapse.call(me.node, event, ui, -storedH);
        }

        me._resetCollapseIconStyle();
    }

    _resetCollapseIconStyle() {
        const me = this;
        if (me.settings.hideHandles || me.settings.hideCollapseButton) {
            return;
        }

        const w = getWidth(me.node);
        const h = getHeight(me.node);

        if (me.handles.n) {
            const up = me.handles.n.querySelector('span.collapseIconUp');
            const down = me.handles.n.querySelector('span.collapseIconDown');
            if (h > 0) {
                up.classList.add('azHide');
                down.classList.remove('azHide');
            } else {
                up.classList.remove('azHide');
                down.classList.add('azHide');
            }
        }
        if (me.handles.e) {
            const left = me.handles.e.querySelector('span.collapseIconLeft');
            const right = me.handles.e.querySelector('span.collapseIconRight');
            if (w > 0) {
                left.classList.remove('azHide');
                right.classList.add('azHide');
            } else {
                left.classList.add('azHide');
                right.classList.remove('azHide');
            }
        }
        if (me.handles.s) {
            const up = me.handles.s.querySelector('span.collapseIconUp');
            const down = me.handles.s.querySelector('span.collapseIconDown');
            if (h > 0) {
                up.classList.remove('azHide');
                down.classList.add('azHide');
            } else {
                up.classList.add('azHide');
                down.classList.remove('azHide');
            }
        }
        if (me.handles.w) {
            const left = me.handles.w.querySelector('span.collapseIconLeft');
            const right = me.handles.w.querySelector('span.collapseIconRight');
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
        const me = this;
        const handleSize = isTouchDevice() ? me.settings.handleSize + 4 : me.settings.handleSize;
        if (me.handles.n) {
            me.handles.n.style['top'] = 0;
            me.handles.n.style['bottom'] = '';
            me.handles.n.style['right'] = '';
            me.handles.n.style['left'] = 0;
            me.handles.n.style['height'] = handleSize + 'px';
            me.handles.n.style['width'] = '100%';
        }

        if (me.handles.e) {
            me.handles.e.style['right'] = 0;
            me.handles.e.style['left'] = '';
            me.handles.e.style['bottom'] = '';
            me.handles.e.style['top'] = 0;
            me.handles.e.style['width'] = handleSize + 'px';
            me.handles.e.style['height'] = '100%';
        }

        if (me.handles.s) {
            me.handles.s.style['bottom'] = 0;
            me.handles.s.style['top'] = '';
            me.handles.s.style['right'] = '';
            me.handles.s.style['left'] = 0;
            me.handles.s.style['height'] = handleSize + 'px';
            me.handles.s.style['width'] = '100%';
        }
        if (me.handles.w) {
            me.handles.w.style['left'] = 0;
            me.handles.w.style['right'] = '';
            me.handles.w.style['bottom'] = '';
            me.handles.w.style['top'] = 0;
            me.handles.w.style['width'] = handleSize + 'px';
            me.handles.w.style['height'] = '100%';
        }

        if (me.handles.ne) {
            me.handles.ne.style['left'] = '';
            me.handles.ne.style['right'] = 0;
            me.handles.ne.style['bottom'] = '';
            me.handles.ne.style['top'] = 0;
            me.handles.ne.style['width'] = handleSize + 'px';
            me.handles.ne.style['height'] = handleSize + 'px';
        }
        if (me.handles.se) {
            me.handles.se.style['left'] = '';
            me.handles.se.style['right'] = 0;
            me.handles.se.style['bottom'] = 0;
            me.handles.se.style['top'] = '';
            me.handles.se.style['width'] = handleSize + 'px';
            me.handles.se.style['height'] = handleSize + 'px';
        }
        if (me.handles.sw) {
            me.handles.sw.style['left'] = 0;
            me.handles.sw.style['right'] = '';
            me.handles.sw.style['bottom'] = 0;
            me.handles.sw.style['top'] = '';
            me.handles.sw.style['width'] = handleSize + 'px';
            me.handles.sw.style['height'] = handleSize + 'px';
        }
        if (me.handles.nw) {
            me.handles.nw.style['left'] = 0;
            me.handles.nw.style['right'] = '';
            me.handles.nw.style['bottom'] = '';
            me.handles.nw.style['top'] = 0;
            me.handles.nw.style['width'] = handleSize + 'px';
            me.handles.nw.style['height'] = handleSize + 'px';
        }
    }
};