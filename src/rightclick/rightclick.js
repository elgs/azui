import { isTouchDevice } from '../_utilities/utilities.js';
import { azObj, Base } from '../_core/core.js';

azui.RightClick = function (el, options, init) {
  return azObj(RightClick, el, options, init);
};

class RightClick extends Base {
  static className = 'RightClick';

  _init(options) {
    const settings = Object.assign(
      {
        onRightClick: function (e) { },
        // preventDefault: function (e) {
        //     return true;
        // },
        resumeDefaultEvent: function (e) {
          e.target.dispatchEvent(new CustomEvent('click'));
        }
      },
      options
    );

    const me = this;
    const node = me.node;

    node.setAttribute('tabindex', 0);
    node.style.outline = 'none';

    me.replaceEventListener('contextmenu', 'contextmenu', settings.onRightClick);

    if (isTouchDevice()) {
      let timer;
      me.triggered = false;
      me.replaceEventListener('touchstart', 'touchstart', function (event) {
        'touchmove touchend touchcancel'.split(' ').forEach(e =>
          me.replaceEventListener(e, e, function (event) {
            clearTimeout(timer);
            // console.log(event);
            if (me.triggered) {
              // console.log('triggered');
              event._azRightClickTriggered = true;
              me.triggered = false;
            } else {
              // console.log('not triggered');
              settings.resumeDefaultEvent(event);
            }
          })
        );
        timer = setTimeout(function () {
          me.triggered = true;
          if (node === document || node === window || node.parentNode) {
            // don't call if me is removed.
            settings.onRightClick(event);
          }
        }, 500);
        // console.log(settings.preventDefault(event));
        // if (settings.preventDefault(event)) {
        //     event.preventDefault(); // prevent long press browser menu;
        // }
      });
    }
  }
}
