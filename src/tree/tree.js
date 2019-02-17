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
    ancestors,
    nextElem
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

        const navUp = el => {
            if (!el) {
                return null;
            }
            const prev = prevElem(el);
            if (prev) {
                if (prev.classList.contains('azTreeNode')) {
                    return prev;
                } else if (prev.classList.contains('azTreeBranch') && !prev.classList.contains('collapsed')) {
                    const elements = prev.querySelectorAll('.azTreeNode');
                    for (let i = elements.length - 1; i >= 0; --i) {
                        if (!elements[i].closest('.azTreeBranch.collapsed')) {
                            return elements[i];
                        }
                    }
                    return navUp(prev);
                } else {
                    return navUp(prev);
                }
            } else {
                return navUp(el.parentNode);
            }
        };

        const navDown = el => {
            if (!el) {
                return null;
            }
            const next = nextElem(el);
            if (next) {
                if (next.classList.contains('azTreeNode')) {
                    return next;
                } else if (next.classList.contains('azTreeBranch') && !next.classList.contains('collapsed')) {
                    const firstChild = next.querySelector('*>.azTreeNode');
                    if (firstChild) {
                        return firstChild;
                    } else {
                        return navDown(next);
                    }
                } else {
                    return navDown(next);
                }
            } else {
                return navDown(el.parentNode);
            }
        };

        const onKeyDown = e => {
            // console.log(e.keyCode);

            e.preventDefault();
            if (e.keyCode === 38) {
                // up
                const prev = navUp(me.activeItem);
                if (prev) {
                    me.activeItem.classList.remove('active');
                    me.activeItem = prev;
                    me.activeItem.classList.add('active');
                }
            } else if (e.keyCode === 40) {
                // down
                if (me.activeItem) {
                    const next = navDown(me.activeItem);
                    if (next) {
                        me.activeItem.classList.remove('active');
                        me.activeItem = next;
                        me.activeItem.classList.add('active');
                    }
                }
            } else if (e.keyCode === 37) {
                // left
                if (me.activeItem) {
                    const key = me.activeItem.getAttribute('tree-key');
                    me.toggle(key, false);
                }
            } else if (e.keyCode === 39) {
                // right
                if (me.activeItem) {
                    const key = me.activeItem.getAttribute('tree-key');
                    me.toggle(key, true);
                }
            } else if (e.keyCode === 13) {
                // enter
                me.activeItem.dispatchEvent(new CustomEvent('mouseup'));
            }
        };

        node.setAttribute('tabindex', 0);
        node.addEventListener('keydown', onKeyDown);
    }

    _applyEvents(treeNode, action) {
        // console.log(node);
        const me = this;
        if (treeNode.classList.contains('azTreeBranch')) {
            const collapsed = treeNode.classList.contains('collapsed');
            const prev = prevElem(treeNode);
            const caret = parseDOMElement(svgTriangle)[0];
            if (collapsed) {
                caret.classList.add('collapsed');
            }
            prev.insertBefore(caret, prev.firstChild);
            const itemSelected = e => {
                if (e.type === 'touchend') {
                    // prevent mouseup from triggered on touch device
                    e.preventDefault();
                }

                if (e.type === 'mouseup' && e.button !== 0) {
                    return;
                }
                treeNode.classList.toggle("collapsed");
                caret.classList.toggle("collapsed");
            };
            if (isTouchDevice()) {
                prev.addEventListener("touchend", itemSelected);
            }
            prev.addEventListener("mouseup", itemSelected);
        } else if (treeNode.classList.contains('azTreeNode')) {
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
                treeNode.classList.add('active');
                me.activeItem = treeNode;
                action && action.call(treeNode, e);
            };
            if (isTouchDevice()) {
                treeNode.addEventListener('touchend', select);
                treeNode.addEventListener("touchmove", e => {
                    me.dragged = true;
                });
            }
            treeNode.addEventListener('mouseup', select);
        }
    }

    append(title, parentKey, action, key = null) {
        return this.insert(title, parentKey, Number.MAX_SAFE_INTEGER, action, key);
    }

    insert(title, parentKey, pos, action, key = null) {
        const me = this;
        const node = me.node;
        key = key || randGen(8);
        const markup = `<div class="azTreeNode" tree-key="${key}"><span>${title}</span></div>`;
        const newNode = parseDOMElement(markup)[0];

        me._applyEvents(newNode, action);

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
        if (!branch) {
            return;
        }
        const prev = prevElem(branch);
        const caret = prev.querySelector('svg');
        if (state === true) {
            branch.classList.remove("collapsed");
            caret.classList.remove("collapsed");
        } else if (state === false) {
            branch.classList.add("collapsed");
            caret.classList.add("collapsed");
        } else {
            branch.classList.toggle("collapsed");
            caret.classList.toggle("collapsed");
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