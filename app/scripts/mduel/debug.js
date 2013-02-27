var defineDebug = function () {
    'use strict';
    return {
        boundingBoxes: false,
        trace: false,
        log: function () {
            if (typeof console !== 'undefined' && typeof console.log === 'function') {
                console.log.apply(console, arguments);
            }
        },
        warn: function () {
            if (typeof console !== 'undefined' && typeof console.warn === 'function') {
                console.warn.apply(console, arguments);
            }
        },
        error: function () {
            if (typeof console !== 'undefined' && typeof console.error === 'function') {
                console.error.apply(console, arguments);
            }
        }
    };
};
if (typeof define !== 'undefined') {
    define([], defineDebug);
} else if (typeof module !== 'undefined') {
    module.exports = defineDebug();
}
