import {
    Base
} from '../utilities/core.js';

import {
    registerDropTarget,
    dndStateConsts,
    randGen,
    randGenConsts,
} from '../utilities/utilities.js';

azui.Droppable = class Droppable extends Base {
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

        for (const node of this.nodeList) {
            const self = node;

            self.setAttribute('az-drop-id', randGen(8, randGenConsts.LowerUpperDigit, '', ''));
            self.classList.add('azDroppable');
            if (!settings.key) {
                return;
            }
            registerDropTarget(settings.key, self);
            Object.keys(dndStateConsts).map(state => {
                const stateIn = state + '_in';
                const stateOut = state + '_out';
                if (settings[stateIn]) {
                    self.addEventListener(stateIn, settings[stateIn]);
                }
                if (settings[stateOut]) {
                    self.addEventListener(stateOut, settings[stateOut]);
                }
            });
            if (settings.dragged) {
                self.addEventListener('dragged', settings.dragged);
            }
            if (settings.dropped) {
                self.addEventListener('dropped', settings.dropped);
            }
        }
    }
};