import {
    azObj,
    Base
} from '../utilities/core.js';
import {
    randGen
} from '../utilities/utilities.js';


azui.Droppable = function (el, options) {
    // return new Droppable(el, options);
    return azObj(Droppable, el, options);
};

class Droppable extends Base {
    constructor(el, options) {
        super(el);
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

        const node = this.node;

        // node.setAttribute('az-drop-id', randGen(8));
        node.setAttribute('az-interested-drop-events', settings.interestedDropEvents);
        node.classList.add('azDropTarget');

        Object.keys(azui.constants.dndStateConsts).map(state => {
            const stateIn = state + '_in';
            const stateOut = state + '_out';
            if (settings[stateIn]) {
                node.addEventListener(stateIn, settings[stateIn]);
            }
            if (settings[stateOut]) {
                node.addEventListener(stateOut, settings[stateOut]);
            }
        });
        if (settings.dragged) {
            node.addEventListener('dragged', settings.dragged);
        }
        if (settings.dropped) {
            node.addEventListener('dropped', settings.dropped);
        }
    }
};