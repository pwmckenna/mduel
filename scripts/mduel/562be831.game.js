var defineGame = function(
   Stage,
   Player, 
   Images, 
   Pickups,
   Keyboard,
   Util,
   _
) {
   console.log('game loaded');
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

   Mduel.Game.startGame = function(firebase) {
      Mduel.Game.debug = false;

      Mduel.Game.framerate = 30;
      
      Mduel.Game.lastFrameDrawn = new Date().valueOf();
      
      Mduel.Game.state = 'game';
      
      Mduel.Game.localPlayers = [];
      Mduel.Game.remotePlayers = [];
      Mduel.Game.pickups = Mduel.Pickups.pickups(firebase.child('pickups'));
      Mduel.Game.stage = Mduel.Stage.stage();
      Mduel.Game.addLocalPlayer(firebase);
      
      firebase.child('players').on('child_added', function(childSnapshot, prevChildName) {
         var local = false;
         for (var i = 0, len = Mduel.Game.localPlayers.length; i < len; i++) {
            local = local || (Mduel.Game.localPlayers[i].name() === childSnapshot.name());
         }
         if(!local) {
            var player = Mduel.Player.player({
               spriteImage: Mduel.Images.player2,
               firebase: childSnapshot.ref(),
               id: 0
            });
            Mduel.Game.remotePlayers.push(player);
         }
      });

      firebase.child('players').on('child_removed', function(childSnapshot) {
         for(var i = 0, len = Mduel.Game.localPlayers.length; i < len; i++) {
            if(Mduel.Game.localPlayers[i].name() === childSnapshot.name()) {
               Mduel.Game.localPlayers.splice(i, 1);
               break;
            }
         }
         for(var i = 0, len = Mduel.Game.remotePlayers.length; i < len; i++) {
            if(Mduel.Game.remotePlayers[i].name() === childSnapshot.name()) {
               Mduel.Game.remotePlayers.splice(i, 1);
               break;
            }
         }
      });

      window.onkeydown = Mduel.Keyboard.keyDown;
      window.onkeyup = Mduel.Keyboard.keyUp;

      setInterval(Mduel.Game.gameLoop, 1000 / Mduel.Game.framerate);
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

   Mduel.Game.addLocalPlayer = function(firebase) {
      var init = {
         position: Mduel.Game.generateStartPosition(),
         velocity: {
            x: 0,
            y: 0
         },
         box: {
            x: 0, y: 0, width: 0, height: 0
         },
         flip: false,
         state: 'stand'
      };
      var ref = firebase.child('players').push(init);
      ref.removeOnDisconnect();

      var initPlayer;
      initPlayer = function(dataSnapshot) {
         if(_.isEqual(dataSnapshot.val(), init)) {
            ref.off('value', initPlayer);
            var player = Mduel.Player.initializeLocalPlayer(ref);
            Mduel.Game.localPlayers.push(player);
         }
      };
      ref.on('value', initPlayer);      
   }

   Mduel.Game.gameLoop = function() {
      var renderTime = new Date().valueOf();
      var elapsedTime = renderTime - Mduel.Game.lastFrameDrawn;
      Mduel.Game.lastFrameDrawn = renderTime;

      Mduel.Game.handleCollisions(elapsedTime);
      Mduel.Game.update(elapsedTime);
      Mduel.Game.draw(elapsedTime);
   }


   Mduel.Game.update = function(elapsedTime) {
      Mduel.Game.stage.update(elapsedTime);
      //Mduel.Game.pickups.update(elapsedTime);
      for (var i = 0, len = Mduel.Game.localPlayers.length; i < len; i++) {
         Mduel.Game.localPlayers[i].update(elapsedTime);
      }
      // We're not responsible for updating the remote players
   }

   Mduel.Game.draw = function(elapsedTime) {
      var canvas = document.getElementById('game');
      var ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Mduel.Game.state == 'game') {
         Mduel.Game.stage.draw(ctx, elapsedTime, canvas.width, canvas.height);
         for (var i = 0, len = Mduel.Game.remotePlayers.length; i < len; i++) {
            var player = Mduel.Game.remotePlayers[i];
            player.draw(ctx, elapsedTime);
         }
         for (var i = 0, len = Mduel.Game.localPlayers.length; i < len; i++) {
            var player = Mduel.Game.localPlayers[i];
            player.draw(ctx, elapsedTime);
         }
         Mduel.Game.pickups.draw(ctx, elapsedTime);
      }
      
      if (Mduel.Game.debug) {
         var drawBoundingBox = function(player) {
            var box = player.getBoundingBox();
            //draw the bounding box so we can work on collision detection
            ctx.strokeStyle = "red";
            ctx.strokeRect(box.x, box.y, box.width, box.height);
         }
         for (var i = 0, len = Mduel.Game.remotePlayers.length; i < len; i++) {
            drawBoundingBox(Mduel.Game.remotePlayers[i]);
         }
         for (var i = 0, len = Mduel.Game.localPlayers.length; i < len; i++) {
            drawBoundingBox(Mduel.Game.localPlayers[i]);
         }

         ctx.fillStyle = '#f00';
         ctx.font = 'arial 30px sans-serif';

         ctx.fillText(Mduel.Game.debugText || '', 5, 10);
      }
   }

   Mduel.Game.handleWallCollisions = function(elapsedTime, player) {
      var canvas = document.getElementById('game');
      var pos = player.get('position');
      if(!pos) return;

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
   }

   Mduel.Game.handlePlayerCollisions = function(elapsedTime, player1, player2) {
      if(player1.name() === player2.name()) {
         return;
      }
      if(!Mduel.Util.colliding(player1.getBoundingBox(), player2.getBoundingBox())) {
         return;
      }

      // we have a collision!
      console.log('collision');
   }

   Mduel.Game.handleCollisions = function(elapsedTime) {
      for (var i = 0; i < Mduel.Game.localPlayers.length; i++) {
         var player = Mduel.Game.localPlayers[i];
         Mduel.Game.handleWallCollisions(elapsedTime, player);

         for (var j = i + 1; j < Mduel.Game.localPlayers.length; j++) {
            var other = Mduel.Game.localPlayers[j];
            Mduel.Game.handlePlayerCollisions(elapsedTime, player, other)
         }
         for (var j = 0; j < Mduel.Game.remotePlayers.length; j++) {
            var other = Mduel.Game.remotePlayers[j];
            Mduel.Game.handlePlayerCollisions(elapsedTime, player, other);
         }
      }
   }

   return Mduel.Game;
};

if(typeof define !== 'undefined') {
   define([
      'mduel/stage',
      'mduel/player', 
      'mduel/images', 
      'mduel/pickups',
      'mduel/keyboard',
      'mduel/util',
      'underscore'
   ], defineGame);
} else if(typeof module !== 'undefined') {
   module.exports = defineGame(
      require('./stage'),
      require('./player'),
      require('./images'),
      require('./pickups'),
      require('./keyboard'),
      require('./util'),
      require('underscore')
   );
}