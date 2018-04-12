import {
    Base
} from '../utilities/core.js';

import {
    touchDelayTime
} from '../utilities/utilities.js';

azui.DoubleClick = function (el, options) {
    return new DoubleClick(el, options);
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

        for (const node of this.nodeList) {
            const self = node;
            self.addEventListener('dblclick', function (event) {
                settings.onDoubleClick.call(this, event);
            });

            let touchtime = 0;
            self.addEventListener('touchstart', function (event) {
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
    }
};