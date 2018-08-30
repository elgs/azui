import {
    azObj,
    Base
} from '../utilities/core.js';
import * as icons from '../utilities/icons.js';
import {
    getWidth,
    index,
    insertAfter,
    insertBefore,
    isTouchDevice,
    parseDOMElement,
    setOuterWidth,
    setWidth,
    textWidth,
    empty
} from '../utilities/utilities.js';


azui.DataTable = function (el, options, init = true) {
    return azObj(DataTable, el, options, init);
};

class DataTable extends Base {

    azInit(options) {
        const settings = Object.assign({
            pageNumber: 1,
            pageSize: 25,
            sortColumnKey: false,
            sortDirection: false,
            editor: false, // or cell, row
        }, options);

        const me = this;
        const node = this.node;

        empty(node);

        node.classList.add('azDataTable');

        this.totalSize = 0;

        const refresh = function (pageData, totalSize) {
            me.totalSize = totalSize;
            tbody.innerHTML = '';

            pageData.map(row => {
                const tr = document.createElement('div');
                tr.classList.add('tr');
                tbody.appendChild(tr);

                settings.columns.map(col => {
                    const cell = parseDOMElement(`<span>${row[col.dataIndex]}</span>`)[0];
                    const td = document.createElement('div');
                    td.classList.add(`td`, `col-${col.key}`);
                    td.appendChild(cell);

                    if (settings.editor === 'cell') {
                        azui.InlineEdit(cell, {
                            type: col.type,
                            options: col.options,
                        });
                    }
                    if (col.hidden) {
                        td.style.display = 'none';
                    }
                    tr.appendChild(td);

                    if (col.width) {
                        setOuterWidth(td, col.width);
                    }
                });
                if (settings.editor === 'row') {
                    tr.querySelectorAll('div.td>span').forEach(el => {
                        azui.InlineEdit(el);
                    });
                }

                // sorting
                if (settings.sortDirection) {
                    const th = thead.querySelector(`.th.col-${settings.sortColumnKey}`);
                    thead.querySelectorAll('.azThSort').forEach(el => {
                        el.style['display'] = 'none';
                    });
                    th.querySelectorAll(settings.sortDirection === 'asc' ? '.azThSortUp' : '.azThSortDown')
                        .forEach(el => {
                            el.style['display'] = 'inline-block';
                        });
                }

                pager.update(settings.pageNumber, totalSize, settings.pageSize);
            });
        };

        const thead = document.createElement('div');
        thead.classList.add('thead')
        node.appendChild(thead);

        const tbody = document.createElement('div');
        tbody.classList.add('tbody')
        node.appendChild(tbody);

        const tfoot = document.createElement('div');
        tfoot.classList.add('tfoot')
        node.appendChild(tfoot);

        const totalWidth = settings.columns.reduce((a, c) => a + (c.width || 100), 0);

        setWidth(node, 2 + totalWidth);
        const pager = azui.Pager(tfoot, {
            pageSize: settings.pageSize,
            totalSize: me.totalSize,
            pageNumber: settings.pageNumber,
            onPageChange: function (pageNumber) {
                settings.loadData(pageNumber, settings.pageSize, settings.sortColumnKey, settings.sortDirection, refresh);
                this.update(pageNumber, me.totalSize, settings.pageSize);
            },
        });

        settings.columns = settings.columns.map((col, index) => {
            const ncol = this._normalizeCol(col);
            if (typeof ncol.dataIndex !== 'number') {
                ncol.dataIndex = index;
            }
            if (ncol.key === undefined || ncol.key === null) {
                ncol.key = index;
            }
            return ncol;
        });

        settings.columns.map(col => {
            const sortUp = parseDOMElement(icons.svgTriangleUp)[0];
            sortUp.classList.add('azThSort', 'azThSortUp');
            const sortDown = parseDOMElement(icons.svgTriangleDown)[0];
            sortDown.classList.add('azThSort', 'azThSortDown');
            const th = document.createElement('div');
            th.classList.add(`th`, `azSortableItem`, `col-${col.key}`);
            th.innerHTML = col.text;
            th.appendChild(sortUp);
            th.appendChild(sortDown);
            th.setAttribute('col-key', col.key);
            if (col.hidden) {
                th.style.display = 'none';
                // console.log(col.key);
            }
            thead.appendChild(th);
            if (col.width) {
                setOuterWidth(th, col.width);
            }
        });

        // resizing columns
        thead.querySelectorAll('.th').forEach(el => {
            azui.Resizable(el, {
                handles: 'e',
                minWidth: 100,
                hideHandles: true,
                // maxWidth: 400,
                create: function (e) {
                    const target = this;
                    target.setAttribute('widthOnCreate', getWidth(target));
                },
                stop: function (e) {
                    const target = this;
                    // console.log(index(target));
                    const woc = target.getAttribute('widthOnCreate') * 1;
                    target.removeAttribute('widthOnCreate');
                    const dw = getWidth(target) - woc;
                    const newWidth = getWidth(node) + dw;
                    setWidth(node, newWidth);
                    const tds = tbody.querySelectorAll(`div.td:nth-of-type(${index(target)+1})`);
                    tds.forEach(el => {
                        setWidth(el, getWidth(el) + dw);
                    });
                    settings.columns[index(target)].width = tds[0].offsetWidth;
                },
                onDoubleClick: function (event) {
                    const th = event.target.parentNode;
                    const idx = index(th);
                    const tds = tbody.querySelectorAll(`div.td:nth-of-type(${idx + 1})`);
                    let maxWidth = 0;
                    tds.forEach(el => {
                        maxWidth = Math.max(textWidth(el), maxWidth);
                    });
                    maxWidth = Math.max(80, maxWidth) + 10;
                    const newWidth = getWidth(node) + maxWidth - getWidth(tds[0]);
                    setWidth(node, newWidth);
                    tds.forEach(el => {
                        setOuterWidth(el, maxWidth);
                    });
                    setOuterWidth(th, maxWidth);
                    settings.columns[idx].width = tds[0].offsetWidth;

                    event.stopPropagation();
                },
            });
        });

        const sortCmItems = [{
            icon: icons.svgTriangleUp,
            title: 'Sort Ascending',
            action: function (e, target) {
                settings.sortDirection = 'desc';
                sortAll(target.getAttribute('col-key'));
                return false;
            }
        }, {
            icon: icons.svgTriangleDown,
            title: 'Sort Descending',
            action: function (e, target) {
                settings.sortDirection = 'asc';
                sortAll(target.getAttribute('col-key'));
                return false;
            }
        }];
        const colCmItems = () => {
            return settings.columns.map((col) => {
                return {
                    icon: function () {
                        const cb = parseDOMElement(`<input type="checkbox" ${col.hidden?'':'checked="checked"'}>`)[0];
                        cb.addEventListener('click', function (e) {
                            e.preventDefault();
                        });
                        return cb;
                    },
                    title: function () {
                        return col.text;
                    },
                    action: function (e, target) {
                        const cb = e.currentTarget.querySelector('span.icon>input[type=checkbox]');
                        setTimeout(() => {
                            // neglect the effect of e.preventDefault in the icon function;
                            cb.checked = !cb.checked;
                            if (cb.checked) {
                                node.querySelectorAll(`.col-${col.key}`).forEach(el => {
                                    el.style.display = '';
                                });
                                col.hidden = false;
                            } else {
                                node.querySelectorAll(`.col-${col.key}`).forEach(el => {
                                    el.style.display = 'none';
                                });
                                col.hidden = true;
                            }
                        });
                    },
                };
            })
        };

        thead.querySelectorAll('.th').forEach(el => {
            azui.ContextMenu(el, {
                items: () => [
                    ...sortCmItems,
                    null,
                    ...colCmItems(),
                ]
            });
        });

        // moving columns
        azui.Sortable(thead, {
            placeholder: false,
            create: function (e, data) {
                if (isTouchDevice()) {
                    e.target.click();
                    e.preventDefault();
                }
            },
            stop: function (e, data) {
                if (!data.source || !data.target) {
                    return;
                }
                const sIndex = index(data.source);
                const tIndex = index(data.target);
                settings.columns.splice(tIndex, 0, settings.columns.splice(sIndex, 1)[0]);

                tbody.querySelectorAll('div.tr').forEach(tr => {
                    const std = tr.querySelectorAll('div.td')[sIndex];
                    const ttd = tr.querySelectorAll('div.td')[tIndex];
                    if (sIndex < tIndex) {
                        insertAfter(std, ttd);
                    } else {
                        insertBefore(std, ttd);
                    }
                });
            }
        });

        const sortAll = function (colKey) {
            const th = thead.querySelector(`.th.col-${colKey}`);
            const column = settings.columns.find(column => column.key == colKey);
            const sortKey = column.key;
            if (sortKey !== settings.sortColumnKey || settings.sortDirection === 'desc') {
                settings.sortDirection = 'asc';
            } else {
                settings.sortDirection = 'desc';
            }
            settings.sortColumnKey = sortKey;

            settings.loadData(settings.pageNumber, settings.pageSize, settings.sortColumnKey, settings.sortDirection, refresh);
        };

        thead.querySelectorAll('.th').forEach(el => {
            azui.DoubleClick(el, {
                onDoubleClick: function (e) {
                    // console.log(this);
                    sortAll(this.getAttribute('col-key'));
                }
            });
        });

        settings.loadData(settings.pageNumber, settings.pageSize, settings.sortColumnKey, settings.sortDirection, refresh);
    }

    _normalizeCol(col) {
        if (typeof col === 'object') {
            return col;
        } else if (typeof col === 'function') {
            return col();
        } else {
            return {
                text: col
            };
        }
    }
};