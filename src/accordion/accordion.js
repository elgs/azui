import {
    azObj,
    Base
} from '../utilities/core.js';
import {
    isTouchDevice,
    randGen,
    parseDOMElement
} from '../utilities/utilities.js';

azui.Accordion = function (el, options, init) {
    return azObj(Accordion, el, options, init);
};

class Accordion extends Base {

    static className = 'Accordion';

    azInit(options) {
        const settings = Object.assign({
            collapseOthers: false,
        }, options);

        const me = this;
        const node = me.node;
        me.settings = settings;

        me.toggle = (header, state) => {
            const content = header.nextElementSibling;
            if (state === undefined || state === null) {
                state = header.getAttribute('state') || (content.style.maxHeight ? '1' : '0');

                if (state == '1') {
                    header.setAttribute('state', '0');
                    header.classList.remove('active');
                    content.style.maxHeight = null;
                    content.style.minHeight = 0;
                } else {
                    header.setAttribute('state', '1');
                    header.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + "px";
                    content.style.minHeight = "20px";
                }
            } else if (state === true) {
                header.setAttribute('state', '1');
                header.classList.add("active");
                content.style.maxHeight = content.scrollHeight + "px";
                content.style.minHeight = "20px";
            } else if (state === false) {
                header.setAttribute('state', '0');
                header.classList.remove("active");
                content.style.maxHeight = null;
                content.style.minHeight = 0;
            }
        };

        me.append = (title) => {
            const key = randGen(8);
            const markup = `<div class="azAccordionComponent" acc-key="${key}"><div class="azAccordionHeader"><span>${title}</span></div><div class="azAccordionContent"></div></div>`;
            const comp = parseDOMElement(markup)[0];

            const header = comp.querySelector('.azAccordionHeader');
            applyEvents(header);
            node.appendChild(comp);

            return key;
        };

        me.remove = (key) => {
            const comp = node.querySelector(`[acc-key="${key}"]`);
            if (comp) {
                comp.remove();
            }
        };

        me.insert = (title, pos) => {
            const key = randGen(8);
            const markup = `<div class="azAccordionComponent" acc-key="${key}"><div class="azAccordionHeader"><span>${title}</span></div><div class="azAccordionContent"></div></div>`;
            const comp = parseDOMElement(markup)[0];

            const header = comp.querySelector('.azAccordionHeader');
            applyEvents(header);
            node.insertBefore(comp, node.children[pos]);

            return key;
        };

        me.move = (key, pos) => {
            const comp = node.querySelector(`[acc-key="${key}"]`);
            if (comp) {
                node.insertBefore(comp, node.children[pos]);
            }
        };

        me.alert = (key, state) => {
            const header = node.querySelector(`[acc-key="${key}"]>.azAccordionHeader`);
            if (header) {
                state ? header.classList.add('azAccordionAlert') : header.classList.remove('azAccordionAlert');
            }
        };

        me.toggleAll = (state) => {
            for (const a of me.node.querySelectorAll('.azAccordionHeader')) {
                me.toggle(a, state);
            }
        };

        me.toggleOthers = (key, state) => {
            const header = node.querySelector(`[acc-key="${key}"]>.azAccordionHeader`);
            for (const a of me.node.querySelectorAll('.azAccordionHeader')) {
                if (a === header) {
                    continue;
                }
                me.toggle(a, state);
            }
        };


        const createHeaderSelected = cm => {
            return e => {
                if (e.type === 'touchend') {
                    e.preventDefault();
                    if (cm.rightClick.triggered) {
                        return;
                    }
                }

                if (e.type === 'mouseup' && e.button !== 0) {
                    return;
                }

                if (settings.collapseOthers) {
                    for (const a of me.node.querySelectorAll('.azAccordionHeader')) {
                        if (a === e.currentTarget) {
                            me.toggle(a);
                        } else {
                            me.toggle(a, false);
                        }
                    }
                } else {
                    me.toggle(e.currentTarget);
                }
            };
        }

        const contexMenuItemsForCollapseOthersFalse = [{
            title: 'Expand All',
            action: function (e, target) {
                // console.log(target);
                me.toggleAll(true);
                return false;
            }
        }, {
            title: 'Collpase All',
            action: function (e, target) {
                // console.log(target);
                me.toggleAll(false);
                return false;
            }
        }, {
            title: 'Expand Others',
            action: function (e, target) {
                // console.log(target);
                const key = target.closest('.azAccordionComponent').getAttribute('acc-key');
                me.toggleOthers(key, true);
                return false;
            }
        }, {
            title: 'Collpase Others',
            action: function (e, target) {
                const key = target.closest('.azAccordionComponent').getAttribute('acc-key');
                // console.log(target);
                me.toggleOthers(key, false);
                return false;
            }
        }];

        const contexMenuItemsForCollapseOthersTrue = [{
            title: 'Expand',
            action: function (e, target) {
                // console.log(target);
                for (const a of me.node.querySelectorAll('.azAccordionHeader')) {
                    if (a === target) {
                        me.toggle(a, true);
                    } else {
                        me.toggle(a, false);
                    }
                }
                return false;
            }
        }, {
            title: 'Collpase',
            action: function (e, target) {
                // console.log(target);
                me.toggle(target, false);
                return false;
            }
        }];

        const applyEvents = a => {
            const cm = azui.ContextMenu(a, {
                items: settings.collapseOthers ? contexMenuItemsForCollapseOthersTrue : contexMenuItemsForCollapseOthersFalse,
            });

            if (isTouchDevice()) {
                a.addEventListener("touchend", createHeaderSelected(cm));
            }
            a.addEventListener("mouseup", createHeaderSelected(cm));
        };

        for (const a of me.node.querySelectorAll('.azAccordionHeader')) {
            a.closest('.azAccordionComponent').setAttribute('acc-key', randGen(8));
            applyEvents(a);
        }
    }
};