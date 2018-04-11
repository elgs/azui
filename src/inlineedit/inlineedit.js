import {
    Base
} from '../utilities/core.js';

import {
    remove,
    insertAfter,
} from '../utilities/utilities.js';

import * as icons from '../utilities/icons.js';

azui.InlineEdit = class InlineEdit extends Base {
    constructor(el, options) {
        super(el);
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

        if (settings.create(null, this) === false) {
            return false;
        }

        const nodeList = this.nodeList;

        const cancel = function (e) {
            // self.each(function () {
            for (const node of nodeList) {
                const self = node;
                const editor = self.nextElementSibling.querySelector('input.azInlineEditor');
                const v = editor.value;
                if (settings.cancel(e, v) === false) {
                    return false;
                }
                remove(editor.parentNode);
                self.style.display = '';
            };
        };

        const done = function (e) {
            // self.each(function () {
            for (const node of nodeList) {
                const self = node;
                const editor = self.nextElementSibling.querySelector('input.azInlineEditor');
                const v = editor.value;
                if (settings.done(e, v) === false) {
                    return false;
                }
                if (v) {
                    self.textContent = v;
                } else {
                    self.innerHTML = '&nbsp;';
                }
                remove(editor.parentNode);
                self.style.display = '';
            };
        };

        const edit = function (e) {
            if (settings.start(e, self) === false) {
                return false;
            }
            const clickedElem = this;
            // self.each(function () {
            for (const node of nodeList) {
                const self = node;
                const clicked = clickedElem === self;
                const originalValue = self.textContent.trim();
                const editorWrapper = document.createElement('div');
                editorWrapper.classList.add(settings.inlineEditClass + 'Wrapper');

                if (settings.type === 'select') {
                    new azui.Select(editorWrapper, {
                        items: settings.options,
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
                            editor.value = editor.value * 1 + 1;
                            _checkDirty();
                        });
                        downButton.addEventListener('click', function (event) {
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
                self.style.display = 'none';
                insertAfter(editorWrapper, self)
            };
            return false;
        };

        new azui.DoubleClick(nodeList, {
            onDoubleClick: edit
        });
    }
};