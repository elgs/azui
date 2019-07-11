import { svgTriangle } from '../_utilities/icons.js';
import { ancestors, children, diffPosition, getHeight, insertAfter, isTouchDevice, matches, nextElem, normalizeTree, parseDOMElement, prevElem, randGen } from '../_utilities/utilities.js';
import { azObj, Base } from '../_core/core.js';

azui.Tree = (el, options, init) => azObj(Tree, el, options, init);

class Tree extends Base {
  static className = 'Tree';

  _init(options) {
    // console.log(options);
    const me = this;
    const settings = Object.assign(
      {
        action: e => { },
        data: [],
        searchPlaceholderText: 'Search...'
      },
      options
    );

    this.settings = settings;
    const node = this.node;

    const treeScroller = document.createElement('div');
    treeScroller.classList.add('treeScroller');
    [...node.children].map(c => {
      treeScroller.appendChild(c);
    });
    node.appendChild(treeScroller);
    node.treeScroller = treeScroller;

    const filterTree = (term, treeNodes) => {
      treeNodes.map(treeNode => {
        if (treeNode.classList.contains('azTreeNode')) {
          const text = treeNode.innerText.trim().toLowerCase();
          if (!term) {
            treeNode.classList.remove('filtered');
          } else if (!text.includes(term)) {
            treeNode.classList.add('filtered');
          } else {
            treeNode.classList.remove('filtered');
            const bs = ancestors(treeNode, '.azTreeBranch');
            bs.map(b => {
              const previousNode = prevElem(b);
              if (matches(previousNode, '.azTreeNode.filtered')) {
                previousNode.classList.remove('filtered');
              }
            });
          }
        } else if (treeNode.classList.contains('azTreeBranch')) {
          filterTree(term, [...treeNode.children]);
        }
      });
    };

    // search box
    const searchDiv = document.createElement('div');
    searchDiv.classList.add('searchDiv');
    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'search');
    searchInput.setAttribute('placeholder', settings.searchPlaceholderText);
    searchInput.setAttribute('autocomplete', 'off');
    searchInput.setAttribute('autocapitalize', 'off');
    searchInput.setAttribute('autocorrect', 'off');
    searchInput.setAttribute('spellcheck', 'off');
    searchInput.setAttribute('maxlength', '30');
    searchInput.classList.add('searchInput');
    searchInput.addEventListener('input', e => {
      const term = searchInput.value.trim().toLowerCase();
      filterTree(term, [...treeScroller.children]);
    });
    searchInput.addEventListener('keydown', e => {
      if (e.keyCode === 40) {
        e.preventDefault();
        if (!me.keyonItem) {
          me.keyonItem = treeScroller.querySelector('.azTreeNode:not(.filtered)');
          me.keyonItem.classList.add('keyon');
        }
        searchInput.focus();
        treeScroller.focus();
      }
    });
    searchDiv.appendChild(searchInput);
    node.prepend(searchDiv);

    // tree
    const treeNodes = document.querySelectorAll('.azTreeBranch,.azTreeNode');
    treeNodes.forEach(treeNode => {
      me._applyEvents(treeNode);
    });

    const data = normalizeTree(settings.data);
    // console.log(data);

    const buildDOM = (data, branch) => {
      data &&
        data.map(d => {
          const treeNode = document.createElement('div');
          treeNode.classList.add('azTreeNode');
          treeNode.setAttribute('tree-key', d.key);
          treeNode.innerHTML = d.title;
          branch.appendChild(treeNode);
          me._applyEvents(treeNode, d.action);

          if (d.children) {
            const treeBranch = document.createElement('div');
            treeBranch.classList.add('azTreeBranch');
            treeBranch.setAttribute('tree-key', d.key);
            d.collapsed && treeBranch.classList.add('collapsed');
            branch.appendChild(treeBranch);
            me._applyEvents(treeBranch);
            buildDOM(d.children, treeBranch);
          }
        });
    };

    buildDOM(data, treeScroller);

    const navUp = el => {
      if (!el) {
        return null;
      }
      const prev = prevElem(el);
      if (prev) {
        if (matches(prev, '.azTreeNode:not(.filtered)')) {
          return prev;
        } else if (matches(prev, '.azTreeBranch:not(.filtered):not(.collapsed)')) {
          const elements = prev.querySelectorAll('.azTreeNode:not(.filtered)');
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
        if (matches(next, '.azTreeNode:not(.filtered)')) {
          return next;
        } else if (matches(next, '.azTreeBranch:not(.filtered):not(.collapsed)')) {
          const firstChild = next.querySelector('*>.azTreeNode:not(.filtered)');
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
        const prev = navUp(me.keyonItem);
        if (prev) {
          me.keyonItem.classList.remove('keyon');
          me.keyonItem = prev;
          me.keyonItem.classList.add('keyon');
          const itemHeight = me.keyonItem.offsetHeight;
          const topDiff = diffPosition(me.keyonItem, me.node.treeScroller).top;
          // console.log(itemHeight, topDiff);
          if (topDiff < 0) {
            // scroll down rowHeight
            me.node.treeScroller.scrollTop -= itemHeight;
          }
        } else {
          searchInput.focus();
        }
      } else if (e.keyCode === 40) {
        // down
        // console.log(me.keyonItem);
        if (me.keyonItem) {
          const next = navDown(me.keyonItem);
          if (next) {
            me.keyonItem.classList.remove('keyon');
            me.keyonItem = next;
            me.keyonItem.classList.add('keyon');

            const containerHeight = getHeight(me.node);
            const itemHeight = me.keyonItem.offsetHeight;
            const topDiff = diffPosition(me.keyonItem, me.node).top;
            // console.log(containerHeight, itemHeight, topDiff);
            if (itemHeight + topDiff > containerHeight) {
              // scroll down rowHeight
              // console.log(me.node.parentNode);
              me.node.treeScroller.scrollTop += itemHeight;
            }
          }
        }
      } else if (e.keyCode === 37) {
        // left
        if (me.keyonItem) {
          const branch = nextElem(me.keyonItem, '.azTreeBranch:not(.collapsed)');
          if (branch) {
            const key = branch.getAttribute('tree-key');
            me.toggle(key, false);
          } else {
            const parentNode = prevElem(me.keyonItem.closest('.azTreeBranch'), '.azTreeNode');
            me.keyonItem.classList.remove('keyon');
            me.keyonItem = parentNode;
            me.keyonItem.classList.add('keyon');
          }
        }
      } else if (e.keyCode === 39) {
        // right
        if (me.keyonItem) {
          const branch = nextElem(me.keyonItem, '.azTreeBranch') || me.keyonItem.closest('.azTreeBranch');
          const key = branch.getAttribute('tree-key');
          me.toggle(key, true);
        }
      } else if (e.keyCode === 13) {
        // enter
        me.keyonItem.dispatchEvent(new CustomEvent('mouseup'));
      }
    };

    treeScroller.setAttribute('tabindex', 0);
    treeScroller.addEventListener('keydown', onKeyDown);
  }

  _applyEvents(treeNode, action) {
    // console.log(node);
    const me = this;
    if (treeNode.classList.contains('azTreeBranch')) {
      const collapsed = treeNode.classList.contains('collapsed');
      const prev = prevElem(treeNode);
      const caret = parseDOMElement(svgTriangle)[0];
      if (collapsed) {
        treeNode.classList.add('collapsed');
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
        treeNode.classList.toggle('collapsed');
        caret.classList.toggle('collapsed');
      };
      if (isTouchDevice()) {
        prev.addEventListener('touchend', itemSelected);
      }
      prev.addEventListener('mouseup', itemSelected);
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
          me.keyonItem.classList.remove('keyon');
        }
        treeNode.classList.add('active');
        me.activeItem = treeNode;
        me.keyonItem = treeNode;
        if (!action) {
          me.settings.action.call(treeNode, e);
        } else if (action.call(treeNode, e) !== false) {
          me.settings.action.call(treeNode, e);
        }
      };
      if (isTouchDevice()) {
        treeNode.addEventListener('touchend', select);
        treeNode.addEventListener('touchmove', e => {
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
      const ch = children(node.treeScroller, '.azTreeNode');
      if (pos < ch.length) {
        node.treeScroller.insertBefore(newNode, ch[pos]);
      } else {
        node.treeScroller.appendChild(newNode);
      }
      return key;
    }

    // console.log(title, parentKey);
    const treeNode = node.treeScroller.querySelector(`div.azTreeNode[tree-key="${parentKey}"]`);
    if (!treeNode) {
      return null;
    }
    let branch = node.treeScroller.querySelector(`div.azTreeBranch[tree-key="${parentKey}"]`);
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
    const treeNode = node.treeScroller.querySelector(`[tree-key="${key}"]`);
    if (treeNode) {
      treeNode.remove();
    }
  }

  toggle(key, state) {
    const me = this;
    const node = me.node;
    const branch = node.treeScroller.querySelector(`div.azTreeBranch[tree-key="${key}"]`);
    if (!branch) {
      return;
    }
    const prev = prevElem(branch);
    const caret = prev.querySelector('svg');
    if (state === true) {
      branch.classList.remove('collapsed');
      caret.classList.remove('collapsed');
    } else if (state === false) {
      branch.classList.add('collapsed');
      caret.classList.add('collapsed');
    } else {
      branch.classList.toggle('collapsed');
      caret.classList.toggle('collapsed');
    }
  }

  activate(key, triiger = true) {
    const me = this;
    const node = me.node;
    const treeNode = node.treeScroller.querySelector(`[tree-key="${key}"]`);
    if (treeNode) {
      const ancestorBranches = ancestors(treeNode, 'div.azTreeBranch');
      ancestorBranches.map(ab => {
        const abKey = ab.getAttribute('tree-key');
        me.toggle(abKey, true);
      });

      if (triiger) {
        if (isTouchDevice()) {
          treeNode.dispatchEvent(new CustomEvent('touchend'));
        } else {
          treeNode.dispatchEvent(new CustomEvent('mouseup'));
        }
      } else {
        if (me.activeItem) {
          me.activeItem.classList.remove('active');
        }
        treeNode.classList.add('active');
        me.activeItem = treeNode;
      }
    }
  }
}
