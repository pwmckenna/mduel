require.config({
  shim: {
	'components/underscore/underscore': {
		exports: '_'
	},
	'vendor/firebase': {
		exports: 'Firebase'
	}
  },

  paths: {
    jquery: 'vendor/jquery.min'
  }
});
 
require(['mduel/game'], function(Game) {
	var gameFirebase = new Firebase('https://mduel.firebaseio.com/game/');
	Game.startGame(gameFirebase);
});