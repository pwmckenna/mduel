require.config({
    shim: {
        'underscore': {
            exports: '_'
        },
        // Backbone
        'backbone': {

            // Depends on underscore/lodash and jQuery
            'deps': ['underscore', 'jquery'],

            // Exports the global window.Backbone object
            'exports': 'Backbone'

        },
        'firebase': {
            'exports': 'Firebase'
        },
        'rAF': {
            'exports': 'requestAnimationFrame'
        }
    },
    paths: {
        modernizr: 'vendor/modernizr.min',
        jquery: 'vendor/jquery.min',
        underscore: 'components/underscore/underscore-min',
        backbone: 'components/backbone/backbone-min',
        firebase: 'vendor/firebase',
        seedrandom: 'vendor/seedrandom',
        q: 'components/q/q',
        rAF: 'vendor/rAF'
    }
});
require(['jquery', 'mduel/game'], function ($, Game) {
    'use strict';
    console.log('waiting for window load');
    console.log('let the games begin!');
    var gameFirebase = new Firebase('https://mduel.firebaseio.com/game/');
    Game.startGame(gameFirebase);
});
