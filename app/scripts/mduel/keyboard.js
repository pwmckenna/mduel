var defineKeyboard = function (Debug) {
    'use strict';
    Debug.log('keyboard loaded');
    var Keyboard = {};

    Keyboard.keyDown = function (e) {
        var Game = require('mduel/game');
        var keyName = Keyboard.getKeyName(e.keyCode);
        if (keyName) {
            if (Game.state === 'game') {
                for (var i = 0, len = Keyboard.playerKeys.length; i < len; i++) {
                    if (Keyboard.playerKeys[i][keyName]) {
                        var mapping = Keyboard.playerKeys[i][keyName];

                        var eventTime = new Date().valueOf();

                        Keyboard.playerKeyStates[i][mapping].pressed = true;
                        Keyboard.playerKeyStates[i][mapping].eventTime = eventTime;
                        Keyboard.playerKeyStates[i].lastKey.name = mapping;
                        Keyboard.playerKeyStates[i].lastKey.pressed = true;
                        Keyboard.playerKeyStates[i].lastKey.eventTime = eventTime;

                        for (var j = 0; j < Game.localPlayers.length; j++) {
                            var player = Game.localPlayers.at(j);
                            if (player.get('id') === i) {
                                player.keyDown(Keyboard.playerKeyStates[i]);
                            }
                        }
                    }
                }
            }
        }
    };

    Keyboard.keyUp = function (e) {
        var Game = require('mduel/game');
        var keyName = Keyboard.getKeyName(e.keyCode);
        if (keyName) {

            if (Game.state === 'game') {
                for (var i = 0, len = Keyboard.playerKeys.length; i < len; i++) {
                    if (Keyboard.playerKeys[i][keyName]) {
                        var mapping = Keyboard.playerKeys[i][keyName];

                        var eventTime = new Date().valueOf();

                        Keyboard.playerKeyStates[i][mapping].pressed = false;
                        Keyboard.playerKeyStates[i][mapping].eventTime = eventTime;
                        Keyboard.playerKeyStates[i].lastKey.name = mapping;
                        Keyboard.playerKeyStates[i].lastKey.pressed = false;
                        Keyboard.playerKeyStates[i].lastKey.eventTime = eventTime;

                        for (var j = 0; j < Game.localPlayers.length; j++) {
                            var player = Game.localPlayers.at(j);
                            if (player.get('id') === i) {
                                player.keyUp(Keyboard.playerKeyStates[i]);
                            }
                        }
                    }
                }
            }
        }
    };

    Keyboard.playerKeys = [
        {
            'left' : 'left',
            'right' : 'right',
            'up' : 'up',
            'down' : 'down',
            'enter' : 'action'
        },
        {
            'a' : 'left',
            'd' : 'right',
            'w' : 'up',
            's' : 'down',
            'q' : 'action'
        }
    ];

    Keyboard.playerKeyStates = [
        {
            'lastKey' : { name: undefined, pressed: false, eventTime: 0 },
            'up' : { pressed : false, eventTime : 0 },
            'down' : { pressed : false, eventTime : 0 },
            'left' : { pressed : false, eventTime : 0 },
            'right' : { pressed : false, eventTime : 0 },
            'action' : { pressed : false, eventTime : 0 }
        },
        {
            'lastKey' : { name: undefined, pressed: false, eventTime: 0 },
            'up' : { pressed : false, eventTime : 0 },
            'down' : { pressed : false, eventTime : 0 },
            'left' : { pressed : false, eventTime : 0 },
            'right' : { pressed : false, eventTime : 0 },
            'action' : { pressed : false, eventTime : 0 }
        }
    ];

    Keyboard.keyNames = {
        '37' : 'left',
        '38' : 'up',
        '39' : 'right',
        '40' : 'down',
        '65' : 'a',
        '83' : 's',
        '68' : 'd',
        '87' : 'w',
        '13' : 'enter',
        '73' : 'i',
        '74' : 'j',
        '75' : 'k',
        '76' : 'l',
        '85' : 'u',
        '81' : 'q'
    };

    Keyboard.getKeyName = function (keyCode) {
        var rval = null;

        if (Keyboard.keyNames['' + keyCode]) {
            rval = Keyboard.keyNames['' + keyCode];
        }

        return rval;
    };

    return Keyboard;
};

if (typeof define !== 'undefined') {
    define(['mduel/debug'], defineKeyboard);
} else if (typeof module !== 'undefined') {
    module.exports = defineKeyboard(require('./debug'));
}
