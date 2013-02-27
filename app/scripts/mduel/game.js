var defineGame = function (
    requestAnimationFrame,
    _,
    Backbone,
    Firebase,
    Q,
    Stage,
    Player,
    Images,
    Pickups,
    Keyboard,
    Util,
    Debug,
    Constants,
    Trace
) {
    'use strict';
    Debug.log('game loaded');
    var Game = {};

    Game.firebase = new Firebase('https://mduel.firebaseio.com/');

    Game.startGame = function (firebase) {
        Game.lastFrameDrawn = window.performance.now();

        Game.state = 'game';

        Game.pickups = new Pickups.Pickups(null, {
            firebase: firebase.child('pickups')
        });
        Game.stage = Stage.stage(firebase.child('stage'));

        Game.localPlayers = new Backbone.Collection();
        Game.remotePlayers = new Backbone.Collection();
        var players = firebase.child('players');
        Game.addLocalPlayer(players).then(function () {
            players.on('child_added', function (childSnapshot) {
                var local = false;
                for (var i = 0, len = Game.localPlayers.length; i < len; i++) {
                    local = local || (Game.localPlayers.at(i).firebase.name() === childSnapshot.name());
                }
                if (!local) {
                    Debug.log('child_added remote player');
                    var player = new Player.Player(null, {
                        firebase: childSnapshot.ref()
                    });
                    Game.remotePlayers.push(player);
                }
            });

            players.on('child_removed', function (childSnapshot) {
                Game.localPlayers.each(function (player) {
                    if (player.firebase.name() === childSnapshot.name()) {
                        Game.localPlayers.remove(player);
                    }
                });
                Game.remotePlayers.each(function (player) {
                    if (player.firebase.name() === childSnapshot.name()) {
                        Game.remotePlayers.remove(player);
                    }
                });
            });
        });

        window.onkeydown = Keyboard.keyDown;
        window.onkeyup = Keyboard.keyUp;
        Game.requestGameLoop();
    };

    Game.generateStartPosition = function () {
        var platforms = Game.stage.platforms;
        var random = Math.floor(Math.random() * (new Date()).getTime());
        var platform = platforms[random % platforms.length];
        return {
            x: platform.x - 16,
            y: platform.y - 56
        };
    };

    Game.addLocalPlayer = function (players) {
        var defer = Q.defer();
        var position = Game.generateStartPosition();
        var init = {
            x: position.x,
            y: position.y,
            vx: 0,
            vy: 0,
            bx: 0,
            by: 0,
            bw: 0,
            bh: 0,
            flip: false,
            state: 'stand'
        };
        var ref = players.push(init);
        ref.onDisconnect().remove();
        ref.once('value', function (valueSnapshot) {
            console.log('value', valueSnapshot.val());
            var player = new Player.Player(init, {
                firebase: ref
            });
            Game.localPlayers.push(player);
            defer.resolve();
        });
        return defer.promise;
    };

    Game.requestGameLoop = function () {
        var trace = Trace.start('Game.requestGameLoop');
        requestAnimationFrame(Game.gameLoop);
        trace.stop();
    };


    Game.gameLoop = function (renderTime) {
        var trace = Trace.start('Game.gameLoop');
        var elapsedTime = renderTime - Game.lastFrameDrawn;
        if (elapsedTime < 0) {
            elapsedTime = 0;
        }

        if (elapsedTime > Constants.MAX_RENDER_DELAY) {
            Game.localPlayers.each(function (player) {
                player.firebase.remove();
            });
            return;
        }

        // because we have velocities that might carry us well past
        // walls or cause us to jump inappropriately high, we make sure
        // that we only ever evaluate a bit of time at a time.
        var times = Math.ceil(elapsedTime / 30.0);
        _.times(times, function () {
            var t = elapsedTime / times;
            Game.lastFrameDrawn += t;
            Game.handleCollisions(t);
            Game.update(t);
            Game.draw(t);
        });


        Game.requestGameLoop();
        trace.stop();
    };


    Game.update = function (elapsedTime) {
        var trace = Trace.start('Game.update');
        Game.stage.update(elapsedTime);
        Game.pickups.update(elapsedTime);
        Game.localPlayers.each(function (player) {
            player.update(elapsedTime);
        });
        trace.stop();
    };

    Game.draw = function (elapsedTime) {
        var trace = Trace.start('Game.draw');
        var canvas = document.getElementById('game');
        var ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (Game.state === 'game') {
            Game.stage.draw(ctx, elapsedTime, canvas.width, canvas.height);
            Game.localPlayers.each(function (player) {
                player.draw(ctx, elapsedTime);
            });
            Game.remotePlayers.each(function (player) {
                player.draw(ctx, elapsedTime);
            });
            Game.pickups.draw(ctx, elapsedTime);
        }
        trace.stop();
    };

    Game.handlePickupCollisions = function (elapsedTime, players) {
        var trace = Trace.start('Game.handlePickupCollisions');
        var pickups = Game.pickups;
        pickups.handleCollisions(elapsedTime, players, Game.stage);
        trace.stop();
    };

    Game.handleWallCollisions = function (elapsedTime, player) {
        var trace = Trace.start('Game.handleWallCollisions');
        var canvas = document.getElementById('game');

        var boundingBox = player.getBoundingBox();

        // Handle collisions with left and right walls
        var leftWall = { x: -100, y: 0, width: 100, height: canvas.height };
        var rightWall = { x: canvas.width, y: 0, width: 100, height: canvas.height };
        if (Util.colliding(leftWall, boundingBox)) {
            // Are we already moving away from the wall?
            if (player.getVelocityX() > 0) {
                return;
            }
            player.setFlip(!player.getFlip());
            player.setVelocityX(-1 * player.getVelocityX());
        } else if (Util.colliding(rightWall, boundingBox)) {
            // Are we already moving away from the wall?
            if (player.getVelocityX() < 0) {
                return;
            }
            player.setFlip(!player.getFlip());
            player.setVelocityX(-1 * player.getVelocityX());
        }
        trace.stop();
    };

    Game.handlePlayerCollisions = function (elapsedTime, player1, player2) {
        var trace = Trace.start('Game.handlePlayerCollisions');
        if (player1 === player2) {
            return;
        }
        if (!Util.colliding(player1.getBoundingBox(), player2.getBoundingBox())) {
            return;
        }

        // we have a collision!
        Debug.log('player collision');

        var s1 = player1.get('playerState').get('state');
        var x1 = player1.getPositionX();
        var y1 = player1.getPositionY();
        var vx1 = player1.getVelocityX();
        var vy1 = player1.getVelocityY();
        var lightning1 = player1.get('pickup') === 'lightning';

        var s2 = player2.get('playerState').get('state');
        var x2 = player2.getPositionX();
        var y2 = player2.getPositionY();
        var vx2 = player2.getVelocityX();
        var vy2 = player2.getVelocityY();
        var lightning2 = player2.get('pickup') === 'lightning';

        player1.get('playerState').collide(s2, x2, y2, vx2, vy2, lightning2);
        player2.get('playerState').collide(s1, x1, y1, vx1, vy1, lightning1);
        trace.stop();
    };

    Game.handleCollisions = function (elapsedTime) {
        var trace = Trace.start('Game.handleCollisions');
        Game.handlePickupCollisions(elapsedTime, Game.localPlayers);
        var i;
        for (i = 0; i < Game.localPlayers.length; i++) {
            var player = Game.localPlayers.at(i);
            Game.handleWallCollisions(elapsedTime, player);

            var j, other;
            for (j = i + 1; j < Game.localPlayers.length; j++) {
                other = Game.localPlayers.at(j);
                Game.handlePlayerCollisions(elapsedTime, player, other);
            }
            for (j = 0; j < Game.remotePlayers.length; j++) {
                other = Game.remotePlayers.at(j);
                Game.handlePlayerCollisions(elapsedTime, player, other);
            }
        }
        trace.stop();
    };

    return Game;
};

if (typeof define !== 'undefined') {
    define([
        'requestAF',
        'underscore',
        'backbone',
        'firebase',
        'q',
        'mduel/stage',
        'mduel/player',
        'mduel/images',
        'mduel/pickups',
        'mduel/keyboard',
        'mduel/util',
        'mduel/debug',
        'mduel/constants',
        'mduel/trace'
    ], defineGame);
} else if (typeof module !== 'undefined') {
    module.exports = defineGame(
        require('underscore'),
        require('backbone'),
        require('firebase'),
        require('q'),
        require('./stage'),
        require('./player'),
        require('./images'),
        require('./pickups'),
        require('./keyboard'),
        require('./util'),
        require('./debug'),
        require('./constants'),
        require('./trace')
    );
}
