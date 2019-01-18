import {
    azObj,
    Base
} from '../utilities/core.js';
import {
    svgTriangle
} from '../utilities/icons.js';
import {
    parseDOMElement,
    prevElem
} from '../utilities/utilities.js';



azui.Tree = function (el, options, init) {
    return azObj(Tree, el, options, init);
};

class Tree extends Base {

    static className = 'Tree';

    _init(options) {
        const me = this;
        const settings = Object.assign({

        }, options);

        this.settings = settings;

        const node = this.node;

        const folders = document.querySelectorAll(".folder");
        folders.forEach(folder => {
            const prev = prevElem(folder);
            const caret = parseDOMElement(svgTriangle)[0];
            prev.insertBefore(caret, prev.firstChild);
            prev.addEventListener("click", function () {
                folder.classList.toggle("active");
                caret.classList.toggle("caret-down");
            });
        });
    }
}