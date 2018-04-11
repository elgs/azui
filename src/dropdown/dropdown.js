$(function () {
    $.fn.azDropdownMenu = function (options) {
        const settings = $.extend({}, options);
        return this.each(function () {
            const $this = $(this);
            const self = this;
            $this.addClass('azDropdownMenu');
        });
    };
});