import {
    Base
} from '../utilities/core.js';

import {
    registerDropTarget,
    dndStateConsts,
    randGen,
    randGenConsts,
} from '../utilities/utilities.js';

azui.Droppable = function (el, options) {
    return new Droppable(el, options);
};

class Droppable extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({
            // key: '',
            // source_all_in: function (e, data) {},
            // source_all_out: function (e, data) {},
            // target_all_in: function (e, data) {},
            // target_all_out: function (e, data) {},
            // source_center_in: function (e, data) {},
            // source_center_out: function (e, data) {},
            // target_center_in: function (e, data) {},
            // target_center_out: function (e, data) {},
            // touch_in: function (e, data) {},
            // touch_out: function (e, data) {},
            // dragged: function (e, data) {},
            // dropped: function (e, data) {},
        }, options);

        const node = this.node;

        node.setAttribute('az-drop-id', randGen(8, randGenConsts.LowerUpperDigit, '', ''));
        node.classList.add('azDroppable');
        if (!settings.key) {
            return;
        }
        registerDropTarget(settings.key, node);
        Object.keys(dndStateConsts).map(state => {
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