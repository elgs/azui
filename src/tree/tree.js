import {
    azObj,
    Base
} from '../utilities/core.js';
import {
    svgTriangle
} from '../utilities/icons.js';
import {
    isTouchDevice,
    parseDOMElement,
    prevElem,
    randGen
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

        const branches = document.querySelectorAll(".azTreeBranch");
        branches.forEach(branch => {
            const prev = prevElem(branch);
            const caret = parseDOMElement(svgTriangle)[0];
            prev.insertBefore(caret, prev.firstChild);
            const itemSelected = e => {
                if (e.type === 'touchend') {
                    // prevent mouseup from triggered on touch device
                    e.preventDefault();
                }

                if (e.type === 'mouseup' && e.button !== 0) {
                    return;
                }
                branch.classList.toggle("active");
                caret.classList.toggle("active");
            };
            if (isTouchDevice()) {
                prev.addEventListener("touchend", itemSelected);
            }
            prev.addEventListener("mouseup", itemSelected);
        });
    }

    _applyEvents(treeNode) {}

    append(title, parentKey) {
        const me = this;
        const node = me.node;
        const key = randGen(8);
        const markup = `<div class="azTreeNode" tree-key="${key}"><span>${title}</span></div>`;
        const treeNode = parseDOMElement(markup)[0];

        const branch = node.querySelector(`div.azTreeBranch[tree-key=${parentKey}]`);
        me._applyEvents(treeNode);
        branch.appendChild(treeNode);

        return key;
    }

    insert(title, parentKey, pos) {
        const me = this;
        const node = me.node;
        const key = randGen(8);
        const markup = `<div class="azTreeNode" tree-key="${key}"><span>${title}</span></div>`;
        const treeNode = parseDOMElement(markup)[0];

        const branch = node.querySelector(`div.azTreeBranch[tree-key=${parentKey}]`);
        me._applyEvents(treeNode);
        branch.insertBefore(treeNode, branch.children[pos]);

        return key;
    }

    remove(key) {
        const me = this;
        const node = me.node;
        const treeNode = node.querySelector(`[tree-key="${key}"]`);
        if (treeNode) {
            treeNode.remove();
        }
    }

    toggle(key, state) {
        const me = this;
        const node = me.node;
        const branch = node.querySelector(`div.azTreeBranch[tree-key=${key}]`);
        const prev = prevElem(branch);
        const caret = prev.querySelector('svg');
        if (state === true) {
            branch.classList.add("active");
            caret.classList.add("active");
        } else if (state === false) {
            branch.classList.remove("active");
            caret.classList.remove("active");
        } else {
            branch.classList.toggle("active");
            caret.classList.toggle("active");
        }
    }
}