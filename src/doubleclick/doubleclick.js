import {
    azObj,
    Base
} from '../utilities/core.js';
import {
    isTouchDevice
} from '../utilities/utilities.js';

azui.DoubleClick = function (el, options, init = true) {
    // return new DoubleClick(el, options);
    return azObj(DoubleClick, el, options, init);
};

class DoubleClick extends Base {
    // constructor(el, options) {
    // super(el);
    azInit(options) {
        const me = this;
        const settings = Object.assign({
            delay: 500,
            onDoubleClick: function (e) {
                // console.log(e);
            }
        }, options);

        if (isTouchDevice()) {
            let touchtime = 0;
            me.replaceEventListener('touchstart', 'touchstart', function (event) {
                if (touchtime === 0) {
                    touchtime = new Date().getTime();
                } else {
                    if ((new Date().getTime()) - touchtime < settings.delay) {
                        settings.onDoubleClick.call(this, event);
                        touchtime = 0;
                    } else {
                        touchtime = new Date().getTime();
                    }
                }
            });
        }
        me.replaceEventListener('dblclick', 'dblclick', function (event) {
            settings.onDoubleClick.call(this, event);
        });
    }
};