import {
    azObj,
    Base
} from '../utilities/core.js';
import {
    randGen
} from '../utilities/utilities.js';


azui.Droppable = function (el, options, init) {
    // return new Droppable(el, options);
    return azObj(Droppable, el, options, init);
};

class Droppable extends Base {

    static className = 'Droppable';

    azInit(options) {
        const settings = Object.assign({
            // key: '',
            // source_all_in: function (e) {},
            // source_all_out: function (e) {},
            // target_all_in: function (e) {},
            // target_all_out: function (e) {},
            // source_center_in: function (e) {},
            // source_center_out: function (e) {},
            // target_center_in: function (e) {},
            // target_center_out: function (e) {},
            // touch_in: function (e) {},
            // touch_out: function (e) {},
            // pointer_in: function (e) {},
            // pointer_out: function (e) {},
            // dragged: function (e) {},
            // dropped: function (e) {},
            interestedDropEvents: azui.constants.dndEventConsts.all,
        }, options);

        const me = this;
        const node = me.node;

        node.setAttribute('az-interested-drop-events', settings.interestedDropEvents);

        Object.keys(azui.constants.dndStateConsts).map(state => {
            const stateIn = state + '_in';
            const stateOut = state + '_out';
            if (settings[stateIn]) {
                me.replaceEventListener(stateIn, stateIn, settings[stateIn]);
            }
            if (settings[stateOut]) {
                me.replaceEventListener(stateOut, stateOut, settings[stateOut]);
            }
        });
        if (settings.dragged) {
            me.replaceEventListener('dragged', 'dragged', settings.dragged);
        }
        if (settings.dropped) {
            me.replaceEventListener('dropped', 'dropped', settings.dropped);
        }
    }
};