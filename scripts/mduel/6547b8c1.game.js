var defineGame = function(
   Stage,
   Player, 
   Images, 
   Pickups,
   Keyboard,
   Util,
   Debug,
   _,
   Backbone
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
   Mduel.Debug = Debug;

   Mduel.Game.startGame = function() {
      Mduel.Game.framerate = 30;
      
      Mduel.Game.lastFrameDrawn = new Date().valueOf();
      
      Mduel.Game.state = 'game';
      
      Mduel.Game.pickups = new Mduel.Pickups.Pickups();
      Mduel.Game.stage = Mduel.Stage.stage();
      Mduel.Game.localPlayers = new Backbone.Collection([
         Mduel.Game.generateLocalPlayer(0),
         Mduel.Game.generateLocalPlayer(1)
      ]);
      if(Mduel.Game.localPlayers.on('remove', function() {
         if(Mduel.Game.localPlayers.length <= 1) {
            Mduel.Game.localPlayers.at(0).celebrateVictory();
         }
      }));


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

   Mduel.Game.generateLocalPlayer = function(id) {
      var images = {
         0: Mduel.Images.player1,
         1: Mduel.Images.player2,
         2: Mduel.Images.playerRemote,
         3: Mduel.Images.playerComputer
      };
      if(!images.hasOwnProperty(id)) {
         throw 'invalid player id';
      }
      var position = Mduel.Game.generateStartPosition()
      var player = new Mduel.Player.Player({
         x: position.x, 
         y: position.y,
         spriteImage: images[id],
         id: id
      });
      return player;
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
      Mduel.Game.pickups.update(elapsedTime);
      Mduel.Game.localPlayers.each(function(player) {
         player.update(elapsedTime);
      });
   }

   Mduel.Game.draw = function(elapsedTime) {
      var canvas = document.getElementById('game');
      var ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Mduel.Game.state == 'game') {
         Mduel.Game.stage.draw(ctx, elapsedTime, canvas.width, canvas.height);
         Mduel.Game.localPlayers.each(function(player) {
            player.draw(ctx, elapsedTime);
         })
         Mduel.Game.pickups.draw(ctx, elapsedTime);
      }
      
      if (Mduel.Debug.debug) {
         ctx.fillStyle = '#f00';
         ctx.font = 'arial 30px sans-serif';
         ctx.fillText(Mduel.Debug.debugText || '', 5, 10);
      }
   }

   Mduel.Game.handlePickupCollisions = function(elapsedTime, players) {
      Mduel.Game.pickups.handleCollisions(elapsedTime, players, Mduel.Game.stage);
   }

   Mduel.Game.handleWallCollisions = function(elapsedTime, player) {
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
   }

   Mduel.Game.handlePlayerCollisions = function(elapsedTime, player1, player2) {
      if(player1 === player2) {
         return;
      }
      if(!Mduel.Util.colliding(player1.getBoundingBox(), player2.getBoundingBox())) {
         return;
      }

      // we have a collision!
      console.log('collision');
   }

   Mduel.Game.handleCollisions = function(elapsedTime) {
      Mduel.Game.handlePickupCollisions(elapsedTime, Mduel.Game.localPlayers);
      for (var i = 0; i < Mduel.Game.localPlayers.length; i++) {
         var player = Mduel.Game.localPlayers.at(i);
         Mduel.Game.handleWallCollisions(elapsedTime, player);

         for (var j = i + 1; j < Mduel.Game.localPlayers.length; j++) {
            var other = Mduel.Game.localPlayers.at(j);
            Mduel.Game.handlePlayerCollisions(elapsedTime, player, other)
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
      'mduel/debug',
      'underscore',
      'backbone'
   ], defineGame);
} else if(typeof module !== 'undefined') {
   module.exports = defineGame(
      require('./stage'),
      require('./player'),
      require('./images'),
      require('./pickups'),
      require('./keyboard'),
      require('./util'),
      require('./debug'),
      require('underscore'),
      require('backbone')
   );
}