import {
    azObj,
    Base
} from '../utilities/core.js';
import {
    isTouchDevice
} from '../utilities/utilities.js';

azui.Accordion = function (el, options, init) {
    return azObj(Accordion, el, options, init);
};

class Accordion extends Base {

    static className = 'Accordion';

    azInit(options) {
        const me = this;
        const settings = Object.assign({}, options);

        const acc = me.node.querySelectorAll('.accordion');

        for (let i = 0; i < acc.length; ++i) {
            acc[i].addEventListener("touchend", function () {
                this.classList.toggle("active");
                var panel = this.nextElementSibling;
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                }
            });
        }
    }
};