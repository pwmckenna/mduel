(function() {
	"use strict";
	var Firebase = require('./firebase-node');
	var Pickups = require('../app/scripts/mduel/pickups');
	var Player = require('../app/scripts/mduel/player');
	var _ = require('underscore');
	var gameFirebase = new Firebase('https://mduel.firebaseio.com/game')
	var playerFirebase = gameFirebase.child('players');
	var pickupFirebase = gameFirebase.child('pickups');

	var players = [];
	var pickups = Pickups.pickups(pickupFirebase);

	var onPlayerAdded = function(dataSnapshot) {
		console.log('onPlayerAdded');
		var player = Player.player({
           ref: dataSnapshot.ref()
        });
		players.push(player);
	};

	var onPlayerRemoved = function(dataSnapshot) {
		console.log('onPlayerRemoved');
		for(var i in players) {
			if(players[i].name === dataSnapshot.name()) {
				players.splice(i, 1);
				return;
			}
		}
	};

	playerFirebase.on('child_added', onPlayerAdded);
	playerFirebase.on('child_removed', onPlayerRemoved);

	console.log('clearing existing pickups');
	pickupFirebase.remove(function() {
		console.log('existing pickups cleared');
		var create = function() {
			pickups.create();	
		};
		setTimeout(create, 1000);
		setTimeout(create, 3000);
		setTimeout(create, 5000);

		pickupFirebase.on('child_removed', function() {
			pickups.create();
			console.log('pickup removed. adding another');
		});

		var update;
		update = function() {
			pickups.update(100);
			setTimeout(update, 100);
		};
		setTimeout(update, 200);
	});
}());