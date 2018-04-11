$(function () {
    $.azDebugDiv = function () {
        console.log(124234);
        const $debugDiv = $('<div/>')
            .attr('id', 'debugDiv')
            .css('border', '1px solid gray')
            .css('height', 200)
            .css('width', '98%')
            .css('position', 'absolute')
            .css('bottom', 0)
            .css('margin', 0)
            .css('padding', 0)
            .css('font-size', '10px')
            .css('overflow', 'auto')
            // .css('line-height', .1)
            .appendTo($('body'));
        console.olog = console.log;
        console.log = function () {
            console.olog(arguments);
            $debugDiv.append('<p>' + JSON.stringify(arguments) + '</p>');
        };
        console.error = console.debug = console.info = console.log;
    };
});