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
        const settings = Object.assign({
            collapseOthers: true,
        }, options);

        const me = this;
        const node = me.node;
        me.settings = settings;
        node.classList.add('azAccordion');

        const acc = me.node.querySelectorAll('.azAccordionHeader');

        const toggle = (header, state) => {
            const content = header.nextElementSibling;

            if (state === undefined || state === null) {
                header.classList.toggle("active");
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            } else if (state === true) {
                header.classList.add("active");
                content.style.maxHeight = content.scrollHeight + "px";
            } else if (state === false) {
                header.classList.remove("active");
                content.style.maxHeight = null;
            }
        };

        const headerSelected = e => {
            if (e.type === 'touchend') {
                e.preventDefault();
            }

            if (settings.collapseOthers) {
                for (const a of acc) {
                    if (a === e.currentTarget) {
                        toggle(e.currentTarget);
                    } else {
                        toggle(e.currentTarget, false);
                    }
                }
            } else {
                toggle(e.currentTarget);
            }
        };

        for (const a of acc) {
            if (isTouchDevice()) {
                a.addEventListener("touchend", headerSelected);
            }
            a.addEventListener("mouseup", headerSelected);
        }
    }
};