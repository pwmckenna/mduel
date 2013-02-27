var defineTrace = function (Debug) {
    'use strict';
    var trace = false;
    if (Debug.trace && typeof console !== 'undefined' && console.hasOwnProperty('time')) {
        trace = true;
    }
    return {
        start: function (title) {
            if (trace) {
                console.time(title);
            }
            return {
                stop: function () {
                    if (trace) {
                        console.timeEnd(title);
                    }
                }
            };
        }
    };
};

if (typeof define !== 'undefined') {
    define(['mduel/debug'], defineTrace);
} else if (typeof module !== 'undefined') {
    module.exports = defineTrace(require('./debug'));
}
