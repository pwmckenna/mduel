var defineNodeImages = function() {
	console.log('node images loaded');
	if (typeof Mduel == 'undefined') {
		var Mduel = {};
	}
	if (typeof Mduel.Images == 'undefined') {
		Mduel.Images = {};
	}

	Mduel.Images.player1 = {};
	Mduel.Images.player2 = {};
	Mduel.Images.playerRemote = {};
	Mduel.Images.playerComputer = {};
	Mduel.Images.player1000V = {};
	Mduel.Images.platform = {};
	Mduel.Images.spawn = {};
	Mduel.Images.powerup = {};
	Mduel.Images.ropeAnchor = {};
	Mduel.Images.mallow = {};
	Mduel.Images.mallowFiller = {};
	Mduel.Images.pickups = {};

	return Mduel.Images;
}

var defineBrowserImages = function() {
	console.log('browser images loaded');
	if (typeof Mduel == 'undefined') {
		var Mduel = {};
	}
	if (typeof Mduel.Images == 'undefined') {
		Mduel.Images = {};
	}

	Mduel.Images.player1 = document.getElementById('playerSprite1');
	Mduel.Images.player2 = document.getElementById('playerSprite2');
	Mduel.Images.playerRemote = document.getElementById('playerSpriteRemote');
	Mduel.Images.playerComputer = document.getElementById('playerSpriteComputer');
	Mduel.Images.player1000V = document.getElementById('playerSprite1000V');
	Mduel.Images.platform = document.getElementById('main_platform');
	Mduel.Images.spawn = document.getElementById('spawn_platform');
	Mduel.Images.powerup = document.getElementById('powerup_spawn');
	Mduel.Images.ropeAnchor = document.getElementById('rope_anchor');
	Mduel.Images.mallow = document.getElementById('marshmallowSprites');
	Mduel.Images.mallowFiller = document.getElementById('mallow');
	Mduel.Images.pickups = document.getElementById('pickupSprites');

	return Mduel.Images;
};

console.log('loading images');
if(typeof define !== 'undefined') {
	define([], defineBrowserImages);
} else if(typeof module !== 'undefined') {
	module.exports = defineNodeImages();
}