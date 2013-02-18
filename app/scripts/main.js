require.config({
});
 
require(['mduel/game'], function(Game) {
	$(window).load(function() {
		var gameFirebase = new Firebase('https://mduel.firebaseio.com/game/');
		Game.startGame(gameFirebase);
	});
});