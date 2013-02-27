var defineNodeImages = function (Debug) {
    'use strict';
    Debug.log('node images loaded');
    var Images = {};

    Images.player1 = {};
    Images.player2 = {};
    Images.playerRemote = {};
    Images.playerComputer = {};
    Images.player1000V = {};
    Images.playerInvisible = {};
    Images.platform = {};
    Images.spawn = {};
    Images.powerup = {};
    Images.ropeAnchor = {};
    Images.mallow = {};
    Images.mallowFiller = {};
    Images.pickups = {};

    return Images;
};

var defineBrowserImages = function (Debug) {
    'use strict';
    Debug.log('browser images loaded');
    var Images = {};

    Images.player1 = document.getElementById('playerSprite1');
    Images.player2 = document.getElementById('playerSprite2');
    Images.playerRemote = document.getElementById('playerSpriteRemote');
    Images.playerComputer = document.getElementById('playerSpriteComputer');
    Images.player1000V = document.getElementById('playerSprite1000V');
    Images.playerInvisible = document.getElementById('playerSpriteInvisible');
    Images.platform = document.getElementById('main_platform');
    Images.spawn = document.getElementById('spawn_platform');
    Images.powerup = document.getElementById('powerup_spawn');
    Images.ropeAnchor = document.getElementById('rope_anchor');
    Images.mallow = document.getElementById('marshmallowSprites');
    Images.mallowFiller = document.getElementById('mallow');
    Images.pickups = document.getElementById('pickupSprites');

    return Images;
};

if (typeof define !== 'undefined') {
    define(['mduel/debug'], defineBrowserImages);
} else if (typeof module !== 'undefined') {
    module.exports = defineNodeImages(require('./debug'));
}
