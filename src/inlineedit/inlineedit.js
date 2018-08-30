import {
    azObj,
    Base
} from '../utilities/core.js';
import * as icons from '../utilities/icons.js';
import {
    insertAfter,
    remove
} from '../utilities/utilities.js';

azui.InlineEdit = function (el, options, init) {
    // return new InlineEdit(el, options);
    return azObj(InlineEdit, el, options, init);
};

class InlineEdit extends Base {
    // constructor(el, options) {
    // super(el);
    azInit(options) {
        const settings = Object.assign({
            inlineEditClass: 'azInlineEditor',
            type: 'text', // number, select
            options: [],
            value: null,
            create: function (event, ui) {
                // console.log('create', ui);
            },
            start: function (event, ui) {
                // console.log('start', ui);
            },
            edit: function (event, ui) {
                // console.log('edit', ui.value);
            },
            cancel: function (event, ui) {
                // console.log('cancel', ui);
            },
            done: function (event, ui) {
                // console.log('done', ui);
            },
        }, options);

        const node = this.node;

        if (settings.create(null, this) === false) {
            return false;
        }

        const cancel = function (e) {
            // me.each(function () {
            const editor = node.nextElementSibling.querySelector('input.azInlineEditor');
            const v = editor.value;
            if (settings.cancel(e, v) === false) {
                return false;
            }
            remove(editor.parentNode);
            node.style.display = '';
        };

        const done = function (e) {
            const editor = node.nextElementSibling.querySelector('input.azInlineEditor');
            const v = editor.value;
            if (settings.done(e, v) === false) {
                return false;
            }
            if (v) {
                node.textContent = v;
            } else {
                node.innerHTML = '&nbsp;';
            }
            remove(editor.parentNode);
            node.style.display = '';
        };

        const edit = function (e) {
            if (settings.start(e, node) === false) {
                return false;
            }
            const clickedElem = this;
            // me.each(function () {
            const clicked = clickedElem === node;
            const originalValue = node.textContent.trim();
            const editorWrapper = document.createElement('div');
            editorWrapper.classList.add(settings.inlineEditClass + 'Wrapper');

            if (settings.type === 'select') {
                const select = azui.Select(editorWrapper, {
                    items: settings.options,
                });
                select.node.addEventListener('done', function (e) {
                    done(e);
                });
                editorWrapper.querySelector('input').classList.add(settings.inlineEditClass);
                editorWrapper.value = originalValue;
                if (clicked) {
                    setTimeout(() => {
                        editorWrapper.querySelector('input').focus();
                    });
                }
            } else {
                const editor = document.createElement('input');
                editor.setAttribute('type', 'text');
                editor.setAttribute('size', 1);
                editor.classList.add(settings.inlineEditClass);
                editor.value = originalValue;
                editorWrapper.appendChild(editor);

                const dirtySign = document.createElement('div');
                dirtySign.classList.add('dirtySign');
                dirtySign.style.display = 'none';
                editorWrapper.appendChild(dirtySign);
                // $editor.on('blur', cancel);

                const _checkDirty = function () {
                    const dirty = originalValue !== editor.value;
                    if (dirty) {
                        dirtySign.style.display = '';
                    } else {
                        dirtySign.style.display = 'none';
                    }
                };

                editor.addEventListener('keyup', function (event) {
                    if (event.keyCode === 13) {
                        done(event);
                    } else if (event.keyCode === 27) {
                        cancel(event)
                    } else {
                        if (settings.edit(event, this.value) === false) {
                            return false;
                        }
                        _checkDirty();
                    }
                });

                editor.addEventListener('keydown', function (event) {
                    if (settings.type === 'number') {
                        if (event.keyCode === 38) {
                            editor.value = editor.value * 1 + 1;
                        } else if (event.keyCode === 40) {
                            editor.value = editor.value * 1 - 1;
                        }
                    }
                    _checkDirty();
                });

                if (settings.type === 'number') {
                    // put a pair of up/down arrow button to increase/decrease the input number;
                    const svgUp = icons.svgTriangleUp;
                    const svgDown = icons.svgTriangleDown;

                    const upButton = document.createElement('div');
                    upButton.innerHTML = svgUp;
                    upButton.classList.add('numberButton');
                    upButton.classList.add('upButton');
                    editorWrapper.appendChild(upButton);

                    const downButton = document.createElement('div');
                    downButton.innerHTML = svgDown;
                    downButton.classList.add('numberButton');
                    downButton.classList.add('downButton');
                    editorWrapper.appendChild(downButton);

                    upButton.addEventListener('click', function (event) {
                        event.stopPropagation();
                        editor.value = editor.value * 1 + 1;
                        _checkDirty();
                    });
                    downButton.addEventListener('click', function (event) {
                        event.stopPropagation();
                        editor.value = editor.value * 1 - 1;
                        _checkDirty();
                    });
                }

                editor.addEventListener('touchmove', function (event) {
                    // prevent view port from moving around while moving cursor on a mobile screen.
                    event.stopPropagation();
                })
                if (clicked) {
                    setTimeout(() => {
                        editor.focus();
                        editor.setSelectionRange(0, 9999);
                    });
                }
            }
            node.style.display = 'none';
            insertAfter(editorWrapper, node)
            return false;
        };

        azui.DoubleClick(node, {
            onDoubleClick: edit
        });
    }
};