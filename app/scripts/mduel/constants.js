var defineConstants = function () {
    'use strict';
    return {
        UPDATE_RATE: 1000 / 30,
        MAX_RENDER_DELAY: 2000
    };
};

if (typeof define !== 'undefined') {
    define([], defineConstants);
} else if (typeof module !== 'undefined') {
    module.exports = defineConstants();
}
