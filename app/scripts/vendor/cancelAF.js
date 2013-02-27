// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
define([] {
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    var cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
    return cancelAnimationFrame;
});
