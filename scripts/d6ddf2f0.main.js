require.config({
  shim: {
	underscore: { 
		exports: '_' 
	},
	firebase: {
		exports: 'Firebase'
	}
  },

  paths: {
    jquery: 'vendor/jquery.min',
    firebase: 'vendor/firebase',
    underscore: 'components/underscore/underscore-min'
  }
});
 
require(['mduel/game', 'firebase', 'underscore'], function(Game, Firebase, _) {
	console.log(typeof Firebase, typeof _);
	var gameFirebase = new Firebase('https://mduel.firebaseio.com/game/');
	Game.startGame(gameFirebase);
});