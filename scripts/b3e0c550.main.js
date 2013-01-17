require.config({
  shim: {
	underscore: { 
		exports: '_' 
	},
	backbone: {
		require: ['jquery', 'underscore'],
		exports: 'Backbone'
	},
	firebase: {
		exports: 'Firebase'
	}
  },

  paths: {
    jquery: 'vendor/jquery.min',
    firebase: 'vendor/firebase',
    underscore: 'components/underscore/underscore-min',
    backbone: 'components/backbone/backbone-min'
  }
});
 
require(['mduel/game', 'firebase', 'underscore'], function(Game, Firebase) {
	var gameFirebase = new Firebase('https://mduel.firebaseio.com/game/');
	Game.startGame(gameFirebase);
});