import {
    azObj,
    Base
} from '../utilities/core.js';

azui.DoubleClick = function (el, options) {
    // return new DoubleClick(el, options);
    return azObj(DoubleClick, el, options);
};

class DoubleClick extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({
            delay: 500,
            onDoubleClick: function (e) {
                // console.log(e);
            }
        }, options);

        const node = this.node;
        node.addEventListener('dblclick', function (event) {
            settings.onDoubleClick.call(this, event);
        });

        let touchtime = 0;
        node.addEventListener('touchstart', function (event) {
            if (touchtime == 0) {
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
};