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
    underscore: 'components/underscore/underscore',
    backbone: 'components/backbone/backbone'
  }
});
 
require(['mduel/game', 'mduel/keyboard'], function(Game, Keyboard) {
	Game.startGame();
});