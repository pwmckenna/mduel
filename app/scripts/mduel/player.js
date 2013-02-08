var definePlayer = function(
   _,
   Images, 
   PlayerState,
   Stage,
   Util,
   MovingObject,
   Debug,
   Constants
) {
   console.log('player loaded');
   if (typeof Mduel == 'undefined') {
      var Mduel = {};
   }
   if (typeof Mduel.Player == 'undefined') {
      Mduel.Player = {};
   }

   Mduel.Images = Images;
   Mduel.PlayerState = PlayerState;
   Mduel.Stage = Stage;
   Mduel.Util = Util;
   Mduel.MovingObject = MovingObject;
   Mduel.Debug = Debug;
   Mduel.Constants = Constants;

   Mduel.Player.Player = Mduel.MovingObject.extend({
      defaults: _.extend({
         flip: false,
         state: 'stand',
         spriteImage: Mduel.Images.player1,
         id: 0,


         RUN_SPEED: 3.2,
         CLIMB_SPEED: 2.5,
         MAX_FALL_SPEED: 12
      }, Mduel.MovingObject.prototype.defaults),
      initialize: function() {
         var playerState = Mduel.PlayerState.playerState({ 
            player: this
         });
         this.set('defaultSpriteImage', this.get('spriteImage'));
         this.set('playerState', playerState);

         this.on('change:pickup', this.onPickup, this);
      },

      onPickup: function(pickup) {
         console.log('onPickup', this.get('pickup'));
         if(this.get('pickup') === 'lightning') {
            this.set('spriteImage', Mduel.Images.player1000V);
         } else {
            this.set('spriteImage', this.get('defaultSpriteImage'));
         }
      },

      getBoundingBox: function() {
         var image = this.get('spriteImage');
         var flip = this.get('flip');
         var frame = this.get('playerState').currentAnimation.getSprite();
         var box = Mduel.Util.calculateBoundingBox(image, flip, frame);
         return {
            x: this.getPositionX() + box.x, 
            y: this.getPositionY() + box.y, 
            width: box.width, 
            height: box.height 
         };
      },

      celebrateVictory: function() {
         if(this.isOnPlatform()) {
            this.setVelocity(0, 0);
            this.get('playerState').setState('standVictory');
         } else if(this.isOnRope()) {
            this.setVelocity(0, 0);
            this.get('playerState').setState('ropeVictory');
         }
      },

      draw: function(ctx, elapsed) {
         var posNew = { 
            x: this.getPositionX(), 
            y: this.getPositionY()
         };
         
         this.get('playerState').currentAnimation.animate(elapsed);
         var frame = this.get('playerState').currentAnimation.getSprite();

         if (this.get('flip')) {
            ctx.save();
                     
            posNew.x = -posNew.x - frame.width;
            
            ctx.transform(-1, 0, 0, 1, 0, 0);
         }      
         
         ctx.drawImage(this.get('spriteImage'), 
            // Source X and Y coordinates
            frame.x, frame.y, 
            // Source Width and Height
            frame.width, frame.height, 
            // Destination X and Y coordinates
            posNew.x, posNew.y,
            // Destination Width and Height
            frame.width, frame.height);


         if (this.get('flip')) {        
            ctx.restore();      
         }

         if(Mduel.Debug.debug) {
            var box = this.getBoundingBox();
            //draw the bounding box so we can work on collision detection
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.strokeRect(box.x, box.y, box.width, box.height);
         }
      },
      
      update: function(elapsed) {
         // Update position
         var updatePercentage =  elapsed / Mduel.Constants.UPDATE_RATE;
         var vx = this.getVelocityX();
         var vy = this.getVelocityY();
         if(vx !== 0) {
            this.changePositionX(vx * updatePercentage);
         }
         if(vy !== 0) {
            this.changePositionY(vy * updatePercentage);
         }

         this.get('playerState').update(elapsed);
      },
         
      keyUp: function(keyState) {
         if (this.get('playerState').currentState.keyUp) {
            this.get('playerState').currentState.keyUp(keyState);
         }   
      },
         
      keyDown: function(keyState) {
         if (this.get('playerState').currentState.keyDown) {
            this.get('playerState').currentState.keyDown(keyState);
         }
      },
     
      isOnPlatform: function() {
         Mduel.Game = require('mduel/game');
         var rval = undefined;
      
         var playerCenter = this.getPositionX() + 32;
      
         var predX = function(p) {
            var CLING_FACTOR = 1;
            return playerCenter >= p.x - CLING_FACTOR && 
               playerCenter <= (p.x + 32) + CLING_FACTOR;
         };
            
         var columnPlatforms = Mduel.Util.where(Mduel.Game.stage.platforms, predX);
        
         var playerFeet = this.getPositionY() + 56;
        
         var predY = function(p) {
            var diff = p.y - playerFeet;
            return diff <= 12 && diff >= -8;
         }
      
         var platform = Mduel.Util.where(columnPlatforms, predY);
         
         if (platform.length > 0) {
            rval = platform[0];
         }
         
         return rval;
      },
      
      isOnRope: function() {
         Mduel.Game = require('mduel/game');
         var rval = undefined;

         var x = this.getPositionX() + 32;
      
         var predX = function(p) {
            return x >= (p.ropeStart.x - 4) && x <= (p.ropeStart.x + 4);
         };
         
         var ropes = Mduel.Util.where(Mduel.Game.stage.ropes, predX);
         
         if (ropes.length == 1 && ropes[0].ropeEnd.y >= (this.getPositionY() + 56) && ropes[0].ropeStart.y <= (this.getPositionY() + 14)) {
            rval = ropes[0];
         }
         
         return rval;
      },
      isStanding: function() {
         return this.get('playerState').getState() == 'stand';
      },
      isRunning: function() {
         return this.get('playerState').getState() == 'run';
      },
      isRolling: function() {
         return this.get('playerState').getState() == 'roll';
      },
      isCrouching: function() {
         return this.get('playerState').getState() == 'crouch';
      },
      isUncrouching: function() {
         return this.get('playerState').getState() == 'uncrouching';
      },
      getFlip: function() {
         return this.get('flip');
      },
      setFlip: function(flip) {
         this.set('flip', flip);
      }
   });

   return Mduel.Player;
};

if(typeof define !== 'undefined') {  
   define([
      'mduel/images', 
      'mduel/playerState',
      'mduel/stage',
      'mduel/util',
      'mduel/movingObject',
      'mduel/debug',
      'mduel/constants'
   ], _.partial(definePlayer, _));
} else if(typeof module !== 'undefined.') {
   module.exports = definePlayer(
      require('underscore'),
      require('./images'),
      require('./playerState'),
      require('./stage'),
      require('./util'),
      require('./movingObject'),
      require('./debug'),
      require('./constants')
   );
}