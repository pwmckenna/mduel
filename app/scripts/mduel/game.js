var defineGame = function(
   _,
   Backbone,
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

   Mduel.Game.startGame = function() {
      Mduel.Game.lastFrameDrawn = window.performance.now();
      
      Mduel.Game.state = 'game';
      
      Mduel.Game.pickups = new Mduel.Pickups.Pickups();
      Mduel.Game.stage = Mduel.Stage.stage();
      Mduel.Game.localPlayers = new Backbone.Collection([
         Mduel.Game.generateLocalPlayer(0),
         Mduel.Game.generateLocalPlayer(1)
         // Mduel.Game.generateLocalPlayer(2),
         // Mduel.Game.generateLocalPlayer(3),
         // Mduel.Game.generateLocalPlayer(4),
         // Mduel.Game.generateLocalPlayer(5),
         // Mduel.Game.generateLocalPlayer(6),
         // Mduel.Game.generateLocalPlayer(7)
      ]);
      Mduel.Game.remotePlayers = new Backbone.Collection();
      // if(Mduel.Game.localPlayers.on('remove', function() {
      //    if(Mduel.Game.localPlayers.length <= 1) {
      //       Mduel.Game.localPlayers.each(function(player) {
      //          player.celebrateVictory();
      //       });
      //    }
      // }));


      window.onkeydown = Mduel.Keyboard.keyDown;
      window.onkeyup = Mduel.Keyboard.keyUp;
      Mduel.Game.requestGameLoop();

      // setTimeout(function() {
      //    Mduel.Keyboard.keyDown({keyCode: '37'});
      //    setTimeout(function() {
      //       Mduel.Keyboard.keyUp({keyCode: '37'});
      //    }, 5)
      //    Mduel.Keyboard.keyDown({keyCode: '65'});

      // });
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
         3: Mduel.Images.playerComputer,
         4: Mduel.Images.playerComputer,
         5: Mduel.Images.playerComputer,
         6: Mduel.Images.playerComputer,
         7: Mduel.Images.playerComputer
      };
      var positions = {
         0: { x: 64, y: 280 },
         2: { x: 92, y: 280 },
         1: { x: 480, y: 280 },
         3: { x: 512, y: 280 },
         4: { x: 432, y: 24},
         5: { x: 464, y: 24 },
         6: { x: 112, y: 24},
         7: { x: 144, y: 24 }
      }
      if(!images.hasOwnProperty(id)) {
         throw 'invalid player id';
      }
      var position = positions[id];//Mduel.Game.generateStartPosition();
      Debug.log('starting position', position);
      var player = new Mduel.Player.Player({
         x: position.x, 
         y: position.y,
         spriteImage: images[id],
         id: id
      });
      return player;
   }

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
         alert('You connection was dropped. Refresh to play');
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
         })
         Mduel.Game.pickups.draw(ctx, elapsedTime);
      }
      trace.stop();
   }

   Mduel.Game.handlePickupCollisions = function(elapsedTime, players) {
      var trace = Trace.start('Mduel.Game.handlePickupCollisions');
      Mduel.Game.pickups.handleCollisions(elapsedTime, players, Mduel.Game.stage);
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
      'mduel/stage',
      'mduel/player', 
      'mduel/images', 
      'mduel/pickups',
      'mduel/keyboard',
      'mduel/util',
      'mduel/debug',
      'mduel/constants',
      'mduel/trace'
   ], _.partial(defineGame, _, Backbone));
} else if(typeof module !== 'undefined') {
   module.exports = defineGame(
      require('underscore'),
      require('backbone'),
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