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

    static className = 'RightClick';

    azInit(options) {
        const settings = Object.assign({
            onRightClick: function (e) {},
        }, options);

        const me = this;
        const node = me.node;

        node.setAttribute('tabindex', 0);
        node.style.outline = 'none';

        me.replaceEventListener('contextmenu', 'contextmenu', settings.onRightClick);

        if (isTouchDevice()) {
            let timer;
            me.triggered = false;
            me.replaceEventListener('touchstart', 'touchstart', function (event) {
                'touchmove touchend touchcancel'.split(' ').forEach(e => me.replaceEventListener(e, e, function (event) {
                    clearTimeout(timer);
                    if (me.triggered) {
                        me.triggered = false;
                        // } else {
                        // event.target.dispatchEvent(new CustomEvent('click'));
                    }
                }));
                timer = setTimeout(function () {
                    me.triggered = true;
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