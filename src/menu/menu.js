import {
    azObj,
    Base
} from '../utilities/core.js';
import {} from '../utilities/utilities.js';


azui.Menu = function (el, options, init) {
    return azObj(Menu, el, options, init);
};

class Menu extends Base {

    static className = 'Menu';

    azInit(options) {
        const settings = Object.assign({}, options);

        const me = this;
        const node = me.node;

    }
};