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
        requestAF: 'vendor/requestAF',
        cancelAF: 'vendor/cancelAF'
    }
});
require(['mduel/game'], function (Game) {
    'use strict';
	$(window).load(function () {
		var gameFirebase = new Firebase('https://mduel.firebaseio.com/game/');
		Game.startGame(gameFirebase);
	});
});
