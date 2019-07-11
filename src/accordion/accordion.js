import { azObj, Base } from '../_core/core.js';
import { isTouchDevice, parseDOMElement, randGen } from '../_utilities/utilities.js';

azui.Accordion = function (el, options, init) {
  return azObj(Accordion, el, options, init);
};

class Accordion extends Base {
  static className = 'Accordion';

  _init(options) {
    const settings = Object.assign(
      {
        //  @doc:settings:start
        collapseOthers: false // @doc:collapseOthers: True to collapse others when one is expanded.
        //  @doc:settings:end
      },
      options
    );

    const me = this;
    const node = me.node;
    me.settings = settings;

    const createHeaderSelected = cm => {
      return e => {
        if (e.type === 'touchend') {
          // prevent mouseup from triggered on touch device
          e.preventDefault();
          if (cm.rightClick.triggered || me.dragged) {
            me.dragged = false;
            return;
          }
        }

        if (e.type === 'mouseup' && e.button !== 0) {
          return;
        }

        if (settings.collapseOthers) {
          for (const a of me.node.querySelectorAll('.azAccordionHeader')) {
            if (a === e.currentTarget) {
              me._toggle(a);
            } else {
              me._toggle(a, false);
            }
          }
        } else {
          me._toggle(e.currentTarget);
        }
      };
    };

    const contexMenuItemsForCollapseOthersFalse = [
      {
        title: 'Expand All',
        action: function (e, target) {
          // console.log(target);
          me.toggleAll(true);
          return false;
        }
      },
      {
        title: 'Collpase All',
        action: function (e, target) {
          // console.log(target);
          me.toggleAll(false);
          return false;
        }
      },
      {
        title: 'Expand Others',
        action: function (e, target) {
          // console.log(target);
          const key = target.closest('.azAccordionComponent').getAttribute('acc-key');
          me.toggleOthers(key, true);
          return false;
        }
      },
      {
        title: 'Collpase Others',
        action: function (e, target) {
          const key = target.closest('.azAccordionComponent').getAttribute('acc-key');
          // console.log(target);
          me.toggleOthers(key, false);
          return false;
        }
      }
    ];

    const contexMenuItemsForCollapseOthersTrue = [
      {
        title: 'Expand',
        action: function (e, target) {
          // console.log(target);
          for (const a of me.node.querySelectorAll('.azAccordionHeader')) {
            if (a === target) {
              me._toggle(a, true);
            } else {
              me._toggle(a, false);
            }
          }
          return false;
        }
      },
      {
        title: 'Collpase',
        action: function (e, target) {
          // console.log(target);
          me._toggle(target, false);
          return false;
        }
      }
    ];

    me.applyEvents = a => {
      const cm = azui.ContextMenu(a, {
        items: settings.collapseOthers ? contexMenuItemsForCollapseOthersTrue : contexMenuItemsForCollapseOthersFalse
      });

      if (isTouchDevice()) {
        a.addEventListener('touchend', createHeaderSelected(cm));
        a.addEventListener('touchmove', e => {
          me.dragged = true;
        });
      }
      a.addEventListener('mouseup', createHeaderSelected(cm));
    };

    for (const a of me.node.querySelectorAll('.azAccordionHeader')) {
      a.closest('.azAccordionComponent').setAttribute('acc-key', randGen(8));
      me.applyEvents(a);
    }
  }

  _toggle(header, state) {
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
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.minHeight = '20px';
      }
    } else if (state === true) {
      header.setAttribute('state', '1');
      header.classList.add('active');
      content.style.maxHeight = content.scrollHeight + 'px';
      content.style.minHeight = '20px';
    } else if (state === false) {
      header.setAttribute('state', '0');
      header.classList.remove('active');
      content.style.maxHeight = null;
      content.style.minHeight = 0;
    }
  }

  append(title) {
    const me = this;
    const node = me.node;
    const key = randGen(8);
    const markup = `<div class="azAccordionComponent" acc-key="${key}"><div class="azAccordionHeader"><span>${title}</span></div><div class="azAccordionContent"></div></div>`;
    const comp = parseDOMElement(markup)[0];

    const header = comp.querySelector('.azAccordionHeader');
    me.applyEvents(header);
    node.appendChild(comp);

    return key;
  }

  remove(key) {
    const me = this;
    const node = me.node;
    const comp = node.querySelector(`[acc-key="${key}"]`);
    if (comp) {
      comp.remove();
    }
  }

  insert(title, pos) {
    const me = this;
    const node = me.node;
    const key = randGen(8);
    const markup = `<div class="azAccordionComponent" acc-key="${key}"><div class="azAccordionHeader"><span>${title}</span></div><div class="azAccordionContent"></div></div>`;
    const comp = parseDOMElement(markup)[0];

    const header = comp.querySelector('.azAccordionHeader');
    me.applyEvents(header);
    node.insertBefore(comp, node.children[pos]);

    return key;
  }

  move(key, pos) {
    const me = this;
    const node = me.node;
    const comp = node.querySelector(`[acc-key="${key}"]`);
    if (comp) {
      node.insertBefore(comp, node.children[pos]);
    }
  }

  alert(key, state) {
    const me = this;
    const node = me.node;
    const header = node.querySelector(`[acc-key="${key}"]>.azAccordionHeader`);
    if (header) {
      state ? header.classList.add('azAccordionAlert') : header.classList.remove('azAccordionAlert');
    }
  }

  toggleAll(state) {
    const me = this;
    const node = me.node;
    for (const a of me.node.querySelectorAll('.azAccordionHeader')) {
      me._toggle(a, state);
    }
  }

  toggleOthers(key, state) {
    const me = this;
    const node = me.node;
    const header = node.querySelector(`[acc-key="${key}"]>.azAccordionHeader`);
    for (const a of me.node.querySelectorAll('.azAccordionHeader')) {
      if (a === header) {
        continue;
      }
      me._toggle(a, state);
    }
  }

  getContentDiv(key) {
    const me = this;
    const node = me.node;
    return node.querySelector(`[acc-key="${key}"] .azAccordionContent`);
  }
}
