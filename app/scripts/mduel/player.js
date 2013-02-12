var definePlayer = function(
   _,
   Images, 
   PlayerState,
   Stage,
   Util,
   MovingObject,
   Debug,
   Constants,
   Trace
) {
   Debug.log('player loaded');
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
         spriteImage: Mduel.Images.player1,
         id: 0,

         RUN_SPEED: 3.2,
         CLIMB_SPEED: 2.5,
         MAX_FALL_SPEED: 12
      }, Mduel.MovingObject.prototype.defaults),
      initialize: function() {
         var playerState = new Mduel.PlayerState.PlayerState({ 
            player: this
         });
         this.set('defaultSpriteImage', this.get('spriteImage'), { silent: true });
         this.set('playerState', playerState, { silent: true });

         this.on('change:pickup', this.onPickup, this);
         this.setBoundingBox();
      },

      save: function() {
         var playerChanges = this.changedAttributes();
         if(playerChanges) {
            Debug.log(_.keys(playerChanges));
         }

         var playerStateChanges = this.get('playerState').changedAttributes();
         if(playerStateChanges) {
            //Debug.log(_.keys(playerStateChanges));
         }

         //trigger a change event for this and player state
         //to reset the changedAttributes
         this.trigger('change');
         this.get('playerState').trigger('change');
      },

      onPickup: function(pickup) {
         Debug.log('onPickup', this.get('pickup'));
         if(this.get('pickup') === 'lightning') {
            this.set('spriteImage', Mduel.Images.player1000V, { silent: true });
         } else {
            this.set('spriteImage', this.get('defaultSpriteImage'), { silent: true });
         }
      },

      getBoundingBox: function() {
         return this.get('box');
      },

      setBoundingBox: function() {
         var trace = Trace.start('player getBoundingBox');
         var image = this.get('spriteImage');
         var flip = this.get('flip');
         var frame = this.get('playerState').get('currentAnimation').getSprite();
         var box = Mduel.Util.calculateBoundingBox(image, flip, frame);
         this.set('box', {
            x: this.getPositionX() + box.x, 
            y: this.getPositionY() + box.y, 
            width: box.width, 
            height: box.height 
         }, { silent: true });
         trace.stop();
      },

      celebrateVictory: function() {
         if(this.isOnPlatform()) {
            this.setVelocity(0, 0);
            this.get('playerState').set('state', 'standVictory');
         } else if(this.isOnRope()) {
            this.setVelocity(0, 0);
            this.get('playerState').set('state', 'ropeVictory');
         }
      },

      draw: function(ctx, elapsed) {
         var trace = Trace.start('player draw');
         var posNew = { 
            x: this.getPositionX(), 
            y: this.getPositionY()
         };
         
         this.get('playerState').get('currentAnimation').animate(elapsed);
         var frame = this.get('playerState').get('currentAnimation').getSprite();

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

         if(Mduel.Debug.boundingBoxes) {
            var box = this.getBoundingBox();
            //draw the bounding box so we can work on collision detection
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.strokeRect(box.x, box.y, box.width, box.height);
         }
         trace.stop();
      },
      
      update: function(elapsed) {
         var trace = Trace.start('player update');
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
         this.setBoundingBox();
         this.save();
         trace.stop();
      },
         
      keyUp: function(keyState) {
         var playerState = this.get('playerState');
         if (playerState.get('currentState').keyUp) {
            playerState.get('currentState').keyUp.call(playerState, keyState);
         }   
      },
         
      keyDown: function(keyState) {
         var playerState = this.get('playerState');
         if (playerState.get('currentState').keyDown) {
            playerState.get('currentState').keyDown.call(playerState, keyState);
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
         
         if (ropes.length === 1 && ropes[0].ropeEnd.y >= (this.getPositionY() + 56) && ropes[0].ropeStart.y <= (this.getPositionY() + 14)) {
            rval = ropes[0];
         }
         
         return rval;
      },
      isStanding: function() {
         return this.get('playerState').this.get('state') === 'stand';
      },
      isRunning: function() {
         return this.get('playerState').this.get('state') === 'run';
      },
      isRolling: function() {
         return this.get('playerState').this.get('state') === 'roll';
      },
      isCrouching: function() {
         return this.get('playerState').this.get('state') === 'crouch';
      },
      isUncrouching: function() {
         return this.get('playerState').this.get('state') === 'uncrouching';
      },
      getFlip: function() {
         return this.get('flip');
      },
      setFlip: function(flip) {
         this.set('flip', flip, { silent: true });
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
      'mduel/constants',
      'mduel/trace'
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
      require('./constants'),
      require('./trace')
   );
}