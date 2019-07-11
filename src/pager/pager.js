import * as icons from '../_utilities/icons.js';
import { parseDOMElement } from '../_utilities/utilities.js';
import { azObj, Base } from '../_core/core.js';

azui.Pager = function (el, options, init) {
  return azObj(Pager, el, options, init);
};

class Pager extends Base {
  static className = 'Pager';

  _init(options) {
    const settings = Object.assign(
      {
        onPageChange: function (pageNumber, pageSize, totalSize) { },
        pageNumber: 1,
        totalSize: 0,
        pageSize: 25
      },
      options
    );

    this.settings = settings;

    const node = this.node;

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
  }

  _createPagerBar() {
    const me = this;
    const pagerBar = document.createElement('div');
    this._createIcon(icons.svgFirstPage, pagerBar, function (e) {
      me.settings.pageNumber = 1;
      me.update();
    });
    this._createIcon(icons.svgPreviousPage, pagerBar, function (e) {
      --me.settings.pageNumber;
      me.update();
    });

    const pn = document.createElement('input');
    pn.setAttribute('type', 'number');
    pn.setAttribute('min', 1);
    pn.value = this.settings.pageNumber;
    pn.classList.add('pagerInput', 'pageNumber');
    pagerBar.appendChild(pn);

    pn.addEventListener('change', function () {
      me.settings.pageNumber = this.value * 1;
      me.update();
    });

    const totalPagesTmpl = `<span style='margin-right: 15px;'>/ <span class="totalPages">0</span></span>`;
    const totalPages = parseDOMElement(totalPagesTmpl)[0];
    totalPages.classList.add('azPageInfo');
    pagerBar.appendChild(totalPages);

    this._createIcon(icons.svgNextPage, pagerBar, function (e) {
      ++me.settings.pageNumber;
      me.update();
    });
    this._createIcon(icons.svgLastPage, pagerBar, function (e) {
      me.settings.pageNumber = Number.MAX_SAFE_INTEGER;
      me.update();
    });
    this._createIcon(icons.svgRefresh, pagerBar, function (e) {
      me.update();
    });

    const ps = document.createElement('input');
    ps.setAttribute('type', 'number');
    ps.setAttribute('min', 1);
    ps.value = this.settings.pageSize;
    ps.classList.add('pagerInput', 'pageSize', 'azWideScreen');
    pagerBar.appendChild(ps);

    ps.addEventListener('change', function () {
      me.settings.pageSize = this.value * 1;
      me.update();
    });

    const pageSizeTextTmpl = `<span class='azWideScreen'>items per page</span>`;
    const pageSizeText = parseDOMElement(pageSizeTextTmpl)[0];
    pageSizeText.classList.add('azPageInfo');
    pagerBar.appendChild(pageSizeText);

    pagerBar.classList.add('azPageBar');
    return pagerBar;
  }

  _createPageInfo() {
    const pageInfoTmpl = `<div>
            <span class="start">0</span> - 
            <span class="end">0</span> /
            <span class="total">0</span>
            </div>`;
    const pageInfo = parseDOMElement(pageInfoTmpl)[0];
    pageInfo.classList.add('azPageInfo');
    return pageInfo;
  }

  _updatePager(pager) {
    pager.querySelector('.azPageBar>input[type=number].pagerInput.pageNumber').value = this.settings.pageNumber;
    pager.querySelector('.azPageBar>input[type=number].pagerInput.pageSize').value = this.settings.pageSize;
    pager.querySelector('.azPageBar .totalPages').textContent = Math.ceil(
      this.settings.totalSize / this.settings.pageSize
    );
    pager.querySelector('.azPageInfo>span.start').textContent =
      (this.settings.pageNumber - 1) * this.settings.pageSize + 1;
    pager.querySelector('.azPageInfo>span.end').textContent = Math.min(
      this.settings.pageNumber * this.settings.pageSize,
      this.settings.totalSize
    );
    pager.querySelector('.azPageInfo>span.total').textContent = this.settings.totalSize;
  }

  update(pageNumber = this.settings.pageNumber, pageSize = this.settings.pageSize) {
    this.settings.pageSize = pageSize;
    this.settings.onPageChange.call(this, pageNumber, this.settings.pageSize);
    // total size and page number need to be figured out/updated by onPageChange call back.
    this._updatePager(this.node);
  }
}
