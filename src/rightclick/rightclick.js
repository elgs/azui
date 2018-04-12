import {
    Base
} from '../utilities/core.js';

azui.RightClick = function (el, options) {
    return new RightClick(el, options);
};

class RightClick extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({
            onRightClick: function (e) {},
            onTouchStart: function (e) {},
            onTouchEnd: function (e) {},
        }, options);

        for (const node of this.nodeList) {
            const self = node;

            let timer;
            let triggered = false;
            self.addEventListener('contextmenu', settings.onRightClick);
            'touchmove touchend touchcancel'.split(' ').forEach(e => self.addEventListener(e, function (e) {
                settings.onTouchEnd(e);
                clearTimeout(timer);
                if (triggered) {
                    triggered = false;
                } else {
                    e.target.dispatchEvent(new CustomEvent('click'));
                }
            }));
            self.addEventListener('touchstart', function (e) {
                // blurFocusDetector(e);
                settings.onTouchStart(e);
                timer = setTimeout(function () {
                    triggered = true;
                    if (self === document || self === window || self.parentNode) {
                        // don't call if self is removed.
                        settings.onRightClick(e);
                    }
                }, 500);
                e.preventDefault(); // prevent browser default behavior;
            });
            // self.addEventListener('remove', function (e) {
            //     if (timer) {
            //         clearTimeout(timer);
            //     }
            // });
        }
    }
};