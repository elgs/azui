import {
    azObj,
    Base
} from '../utilities/core.js';

azui.RightClick = function (el, options, init = true) {
    // return new RightClick(el, options);
    return azObj(RightClick, el, options, init);
};

class RightClick extends Base {
    azInit(options) {
        const settings = Object.assign({
            onRightClick: function (e) {},
            onTouchStart: function (e) {},
            onTouchEnd: function (e) {},
        }, options);

        const node = this.node;

        let timer;
        let triggered = false;
        node.addEventListener('contextmenu', settings.onRightClick);
        'touchmove touchend touchcancel'.split(' ').forEach(e => node.addEventListener(e, function (e) {
            settings.onTouchEnd(e);
            clearTimeout(timer);
            if (triggered) {
                triggered = false;
            } else {
                e.target.dispatchEvent(new CustomEvent('click'));
            }
        }));
        node.addEventListener('touchstart', function (e) {
            // blurFocusDetector(e);
            settings.onTouchStart(e);
            timer = setTimeout(function () {
                triggered = true;
                if (node === document || node === window || node.parentNode) {
                    // don't call if me is removed.
                    settings.onRightClick(e);
                }
            }, 500);
            e.preventDefault(); // prevent browser default behavior;
        });
    }
};