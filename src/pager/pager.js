import {
    Base
} from '../utilities/core.js';

import {
    parseDOMElement,
} from '../utilities/utilities.js';

import * as icons from '../utilities/icons.js';

azui.Pager = function (el, options) {
    return new Pager(el, options);
};

class Pager extends Base {
    constructor(el, options) {
        super(el);
        const settings = Object.assign({
            onPageChange: function (pageNumber) {},
            pageNumber: 1,
            totalSize: 0,
            pageSize: 25,
        }, options);

        this.settings = settings;

        const node = this.node;
        node.classList.add('azPager');

        const pageBar = this._createPagerBar();
        node.appendChild(pageBar);
        const pageInfo = this._createPageInfo();
        pageInfo.style.display = 'none';
        node.appendChild(pageInfo);

        this._updatePager(node);
        pageInfo.style.display = '';
    }

    _createIcon(icon, pagerBar, callback) {
        const iconEl = document.createElement('a');
        iconEl.classList.add('azPageIcon');
        iconEl.innerHTML = icon;
        pagerBar.appendChild(iconEl);
        iconEl.addEventListener('click', callback);
    };

    _createPagerBar() {
        const self = this;
        const pagerBar = document.createElement('div');
        this._createIcon(icons.svgFirstPage, pagerBar, function (e) {
            self.settings.pageNumber = 1;
            self.settings.onPageChange.call(self, self.settings.pageNumber);
        });
        this._createIcon(icons.svgPreviousPage, pagerBar, function (e) {
            --self.settings.pageNumber;
            self.settings.onPageChange.call(self, self.settings.pageNumber);
        });
        const pn = document.createElement('input');
        pn.setAttribute('type', 'number');
        pn.setAttribute('min', 1);
        pn.value = this.settings.pageNumber;
        pn.classList.add('pageNumber');
        pagerBar.appendChild(pn);

        pn.addEventListener('change', function () {
            self.settings.pageNumber = this.value * 1;
            self.settings.onPageChange.call(self, self.settings.pageNumber);
        });
        this._createIcon(icons.svgNextPage, pagerBar, function (e) {
            ++self.settings.pageNumber;
            self.settings.onPageChange.call(self, self.settings.pageNumber);
        });
        this._createIcon(icons.svgLastPage, pagerBar, function (e) {
            self.settings.pageNumber = Number.MAX_SAFE_INTEGER;
            self.settings.onPageChange.call(self, self.settings.pageNumber);
        });
        this._createIcon(icons.svgRefresh, pagerBar, function (e) {
            self.settings.onPageChange.call(self, self.settings.pageNumber);
        });
        pagerBar.classList.add('azPageBar');
        return pagerBar;
    };

    _createPageInfo() {
        const pageInfoTmpl = `<div>
            <span class="start">0</span> - 
            <span class="end">0</span> /
            <span class="total">0</span>
            </div>`;
        const pageInfo = parseDOMElement(pageInfoTmpl)[0];
        pageInfo.classList.add('azPageInfo');
        return pageInfo;
    };

    _updatePager(pager) {
        pager.querySelector('.azPageBar>input[type=number].pageNumber').value = this.settings.pageNumber;
        pager.querySelector('.azPageInfo>span.start').textContent = (this.settings.pageNumber - 1) * this.settings.pageSize + 1;
        pager.querySelector('.azPageInfo>span.end').textContent = Math.min(this.settings.pageNumber * this.settings.pageSize, this.settings.totalSize);
        pager.querySelector('.azPageInfo>span.total').textContent = this.settings.totalSize;
    };

    update(pageNumber, totalSize, pageSize) {
        this.settings.pageNumber = Math.min(Math.ceil(totalSize / pageSize), Math.max(1, pageNumber));
        this.settings.pageSize = pageSize;
        this.settings.totalSize = totalSize;
        this._updatePager(this.node);
    };
};