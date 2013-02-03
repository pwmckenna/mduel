require.config({
});
 
require(['mduel/game', 'mduel/keyboard'], function(Game, Keyboard) {
	$(window).load(function() {
		Game.startGame();
	});
});