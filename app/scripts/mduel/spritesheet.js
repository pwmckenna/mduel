var defineSpritesheet = function (Debug) {
    'use strict';
    Debug.log('spriteSheet loaded');
    var Spritesheet = {};

    Spritesheet.spritesheet = function (spec) {
        var that = {};

        that.sprites = spec.sprites;
        that.width = spec.width;
        that.height = spec.height;

        that.getOffset = function (spriteName) {
            var sprite = that.sprites[spriteName];

            if (sprite) {
                return {
                    x: (sprite.x || 0),
                    y: ((sprite.y || 0) * that.height),
                    width: that.width,
                    height: that.height
                };
            }

            return null;
        };

        return that;
    };

    return Spritesheet;
};

if (typeof define !== 'undefined') {
    define(['mduel/debug'], defineSpritesheet);
} else if (typeof module !== 'undefined') {
    module.exports = defineSpritesheet(require('./debug'));
}
