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
    randGen,
    insertAfter,
    children,
    resolveFunction,
    ancestors
} from '../utilities/utilities.js';



azui.Tree = (el, options, init) => azObj(Tree, el, options, init);

class Tree extends Base {

    static className = 'Tree';

    _init(options) {
        const me = this;
        const settings = Object.assign({

        }, options);

        this.settings = settings;

        const node = this.node;

        const treeNodes = document.querySelectorAll(".azTreeBranch,.azTreeNode");
        treeNodes.forEach(treeNode => {
            me._applyEvents(treeNode);
        });
    }

    _applyEvents(node, action) {
        // console.log(node);
        const me = this;
        if (node.classList.contains('azTreeBranch')) {
            const prev = prevElem(node);
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
                node.classList.toggle("active");
                caret.classList.toggle("active");
            };
            if (isTouchDevice()) {
                prev.addEventListener("touchend", itemSelected);
            }
            prev.addEventListener("mouseup", itemSelected);
        } else if (node.classList.contains('azTreeNode')) {
            const select = e => {
                if (e.type === 'touchend') {
                    // prevent mouseup from being triggered on touch device
                    e.preventDefault();
                    if (me.dragged) {
                        me.dragged = false;
                        return;
                    }
                }
                if (me.activeItem) {
                    me.activeItem.classList.remove('active');
                }
                node.classList.add('active');
                me.activeItem = node;
                action && action.call(node, e);
            };
            if (isTouchDevice()) {
                node.addEventListener('touchend', select);
                node.addEventListener("touchmove", e => {
                    me.dragged = true;
                });
            }
            node.addEventListener('mouseup', select);
        }
    }

    append(title, parentKey, action, key = null, disabled = false) {
        return this.insert(title, parentKey, Number.MAX_SAFE_INTEGER, action, key, disabled);
    }

    insert(title, parentKey, pos, action, key = null, disabled = false) {
        const me = this;
        const node = me.node;
        key = key || randGen(8);
        const markup = `<div class="azTreeNode" tree-key="${key}"><span>${title}</span></div>`;
        const newNode = parseDOMElement(markup)[0];

        disabled = resolveFunction(disabled);
        if (disabled) {
            newNode.classList.add('disabled');
        } else {
            me._applyEvents(newNode, action);
        }

        if (!parentKey) {
            const ch = children(node, '.azTreeNode');
            if (pos < ch.length) {
                node.insertBefore(newNode, ch[pos]);
            } else {
                node.appendChild(newNode);
            }
            return key;
        }

        // console.log(title, parentKey);
        const treeNode = node.querySelector(`div.azTreeNode[tree-key="${parentKey}"]`);
        if (!treeNode) {
            return null;
        }
        let branch = node.querySelector(`div.azTreeBranch[tree-key="${parentKey}"]`);
        if (!branch) {
            branch = document.createElement('div');
            branch.classList.add('azTreeBranch');
            branch.setAttribute('tree-key', parentKey);
            insertAfter(branch, treeNode);
            me._applyEvents(branch);
        }
        const ch = children(branch, '.azTreeNode');
        if (pos < ch.length) {
            branch.insertBefore(newNode, ch[pos]);
        } else {
            branch.appendChild(newNode);
        }

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
        const branch = node.querySelector(`div.azTreeBranch[tree-key="${key}"]`);
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

    activate(key) {
        const me = this;
        const node = me.node;
        const treeNode = node.querySelector(`[tree-key="${key}"]`);
        if (treeNode) {
            const ancestorBranches = ancestors(treeNode, 'div.azTreeBranch');
            ancestorBranches.map(ab => {
                const abKey = ab.getAttribute('tree-key');
                me.toggle(abKey, true);
            });

            if (isTouchDevice()) {
                treeNode.dispatchEvent(new CustomEvent('touchend'));
            } else {
                treeNode.dispatchEvent(new CustomEvent('mouseup'));
            }
        }
    }
}