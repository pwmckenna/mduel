var defineGame = function(
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
   Debug.log('game loaded');
   if (typeof Mduel == 'undefined') {
      var Mduel = {};
   }
   if (typeof Mduel.Game == 'undefined') {
      Mduel.Game = {};
   }

   Mduel.Player = Player;
   Mduel.Images = Images;
   Mduel.Pickups = Pickups;
   Mduel.Stage = Stage;
   Mduel.Keyboard = Keyboard;
   Mduel.Util = Util;
   Mduel.Debug = Debug;
   Mduel.Constants = Constants;

   Mduel.Game.firebase = new Firebase('https://mduel.firebaseio.com/');

   Mduel.Game.startGame = function(firebase) {
      Mduel.Game.lastFrameDrawn = window.performance.now();
      
      Mduel.Game.state = 'game';
      
      Mduel.Game.pickups = new Mduel.Pickups.Pickups(null, {
         firebase: firebase.child('pickups')
      });
      Mduel.Game.stage = Mduel.Stage.stage(firebase.child('stage'));
      
      Mduel.Game.localPlayers = new Backbone.Collection();
      Mduel.Game.remotePlayers = new Backbone.Collection();
      var players = firebase.child('players');
      Mduel.Game.addLocalPlayer(players).then(function() {
         players.on('child_added', function(childSnapshot, prevChildName) {
            var local = false;
            for (var i = 0, len = Mduel.Game.localPlayers.length; i < len; i++) {
               local = local || (Mduel.Game.localPlayers.at(i).firebase.name() === childSnapshot.name());
            }
            if(!local) {
               Debug.log('child_added remote player');
               var player = new Mduel.Player.Player(null, {
                  firebase: childSnapshot.ref()
               });
               Mduel.Game.remotePlayers.push(player);
            }
         });

         players.on('child_removed', function(childSnapshot) {
            Mduel.Game.localPlayers.each(function(player) {
               if(player.firebase.name() === childSnapshot.name()) {
                  Mduel.Game.localPlayers.remove(player);
               }
            });
            Mduel.Game.remotePlayers.each(function(player) {
               if(player.firebase.name() === childSnapshot.name()) {
                  Mduel.Game.remotePlayers.remove(player);
               }
            });
         });
      });

      window.onkeydown = Mduel.Keyboard.keyDown;
      window.onkeyup = Mduel.Keyboard.keyUp;
      Mduel.Game.requestGameLoop();
   }

   Mduel.Game.generateStartPosition = function() {
      var platforms = Mduel.Game.stage.platforms;
      var random = Math.floor(Math.random() * (new Date()).getTime());
      var platform = platforms[random % platforms.length];
      return {
         x: platform.x - 16,
         y: platform.y - 56
      };
   }

   Mduel.Game.addLocalPlayer = function(players) {
      var defer = Q.defer();
      var position = Mduel.Game.generateStartPosition();
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
      ref.once('value', function(valueSnapshot) {
         console.log('value', valueSnapshot.val());
         var player = new Mduel.Player.Player(init, {
            firebase: ref
         });
         Mduel.Game.localPlayers.push(player);
         defer.resolve();
      });
      return defer.promise;
   };

   Mduel.Game.requestGameLoop = function() {
      var trace = Trace.start('Mduel.Game.requestGameLoop');
      requestAnimationFrame(Mduel.Game.gameLoop);
      trace.stop();
   }


   Mduel.Game.gameLoop = function(renderTime) {
      var trace = Trace.start('Mduel.Game.gameLoop');
      var elapsedTime = renderTime - Mduel.Game.lastFrameDrawn;
      if(elapsedTime < 0) {
         elapsedTime = 0;
      }

      if(elapsedTime > Mduel.Constants.MAX_RENDER_DELAY) {
         Mduel.Game.localPlayers.each(function(player) {
            player.firebase.remove();
         });
         return;
      }

      // because we have velocities that might carry us well past
      // walls or cause us to jump inappropriately high, we make sure
      // that we only ever evaluate a bit of time at a time.
      var times = Math.ceil(elapsedTime / 30.0);
      _.times(times, function() {
         var t = elapsedTime / times;
         Mduel.Game.lastFrameDrawn += t;
         Mduel.Game.handleCollisions(t);
         Mduel.Game.update(t);
         Mduel.Game.draw(t);
      });


      Mduel.Game.requestGameLoop();
      trace.stop();
   }


   Mduel.Game.update = function(elapsedTime) {
      var trace = Trace.start('Mduel.Game.update');
      Mduel.Game.stage.update(elapsedTime);
      Mduel.Game.pickups.update(elapsedTime);
      Mduel.Game.localPlayers.each(function(player) {
         player.update(elapsedTime);
      });
      trace.stop();
   }

   Mduel.Game.draw = function(elapsedTime) {
      var trace = Trace.start('Mduel.Game.draw');
      var canvas = document.getElementById('game');
      var ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (Mduel.Game.state == 'game') {
         Mduel.Game.stage.draw(ctx, elapsedTime, canvas.width, canvas.height);
         Mduel.Game.localPlayers.each(function(player) {
            player.draw(ctx, elapsedTime);
         });
         Mduel.Game.remotePlayers.each(function(player) {
            player.draw(ctx, elapsedTime);
         });
         Mduel.Game.pickups.draw(ctx, elapsedTime);
      }
      trace.stop();
   }

   Mduel.Game.handlePickupCollisions = function(elapsedTime, players) {
      var trace = Trace.start('Mduel.Game.handlePickupCollisions');
      var pickups = Mduel.Game.pickups;
      pickups.handleCollisions(elapsedTime, players, Mduel.Game.stage);
      trace.stop();
   }

   Mduel.Game.handleWallCollisions = function(elapsedTime, player) {
      var trace = Trace.start('Mduel.Game.handleWallCollisions');
      var canvas = document.getElementById('game');

      var boundingBox = player.getBoundingBox();

      // Handle collisions with left and right walls
      var leftWall = { x: -100, y: 0, width: 100, height: canvas.height };
      var rightWall = { x: canvas.width, y: 0, width: 100, height: canvas.height };
      if (Mduel.Util.colliding(leftWall, boundingBox)) {
         // Are we already moving away from the wall?
         if(player.getVelocityX() > 0) {
            return;
         }
         player.setFlip(!player.getFlip());
         player.setVelocityX(-1 * player.getVelocityX());
      } else if(Mduel.Util.colliding(rightWall, boundingBox)) {
         // Are we already moving away from the wall?
         if(player.getVelocityX() < 0) {
            return;
         }
         player.setFlip(!player.getFlip());
         player.setVelocityX(-1 * player.getVelocityX());
      }
      trace.stop();
   }

   Mduel.Game.handlePlayerCollisions = function(elapsedTime, player1, player2) {
      var trace = Trace.start('Mduel.Game.handlePlayerCollisions');
      if(player1 === player2) {
         return;
      }
      if(!Mduel.Util.colliding(player1.getBoundingBox(), player2.getBoundingBox())) {
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
   }

   Mduel.Game.handleCollisions = function(elapsedTime) {
      var trace = Trace.start('Mduel.Game.handleCollisions');
      Mduel.Game.handlePickupCollisions(elapsedTime, Mduel.Game.localPlayers);
      for (var i = 0; i < Mduel.Game.localPlayers.length; i++) {
         var player = Mduel.Game.localPlayers.at(i);
         Mduel.Game.handleWallCollisions(elapsedTime, player);

         for (var j = i + 1; j < Mduel.Game.localPlayers.length; j++) {
            var other = Mduel.Game.localPlayers.at(j);
            Mduel.Game.handlePlayerCollisions(elapsedTime, player, other)
         }
         for (var j = 0; j < Mduel.Game.remotePlayers.length; j++) {
            var other = Mduel.Game.remotePlayers.at(j);
            Mduel.Game.handlePlayerCollisions(elapsedTime, player, other);
         }
      }
      trace.stop();
   }

   return Mduel.Game;
};

if(typeof define !== 'undefined') {
   define([
      'components/q/q',
      'mduel/stage',
      'mduel/player',
      'mduel/images', 
      'mduel/pickups',
      'mduel/keyboard',
      'mduel/util',
      'mduel/debug',
      'mduel/constants',
      'mduel/trace'
   ], _.partial(defineGame, _, Backbone, Firebase));
} else if(typeof module !== 'undefined') {
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