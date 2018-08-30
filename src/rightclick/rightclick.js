import {
    azObj,
    Base
} from '../utilities/core.js';
import {
    isTouchDevice
} from '../utilities/utilities.js';

azui.RightClick = function (el, options, init) {
    return azObj(RightClick, el, options, init);
};

class RightClick extends Base {
    azInit(options) {
        const settings = Object.assign({
            onRightClick: function (e) {},
            onTouchStart: function (e) {},
            onTouchEnd: function (e) {},
        }, options);

        const me = this;
        const node = me.node;

        let timer;
        let triggered = false;
        me.replaceEventListener('contextmenu', 'contextmenu', settings.onRightClick);

        if (isTouchDevice()) {
            'touchmove touchend touchcancel'.split(' ').forEach(e => me.replaceEventListener(e, e, function (event) {
                settings.onTouchEnd(event);
                clearTimeout(timer);
                if (triggered) {
                    triggered = false;
                } else {
                    event.target.dispatchEvent(new CustomEvent('click'));
                }
            }));
            me.replaceEventListener('touchstart', 'touchstart', function (event) {
                // blurFocusDetector(e);
                settings.onTouchStart(event);
                timer = setTimeout(function () {
                    triggered = true;
                    if (node === document || node === window || node.parentNode) {
                        // don't call if me is removed.
                        settings.onRightClick(event);
                    }
                }, 500);
                event.preventDefault(); // prevent browser default behavior;
            });
        }
    }
};