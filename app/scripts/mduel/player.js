var memoize = function(func, hasher) {
   var memo = {};
   return function() {
      var key = hasher.apply(this, arguments);
      return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
   };
};

var calculateBoundingBox = memoize(function(image, flip, frame) {
   var x = frame.x;
   var y = frame.y;
   var width = frame.width;
   var height = frame.height;
   var left = width, 
      top = height, 
      right = 0, 
      bottom = 0;

   var canvas = document.createElement('canvas');
   canvas.height = image.height;
   canvas.width = image.width;
   var ctx = canvas.getContext('2d');
   ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
   var myImageData = ctx.getImageData(0, 0, image.width, image.height); // Parameters are left, top, width and height
   for(var x = 0; x < myImageData.width; x++) {
      for(var y = 0; y < myImageData.height; y++) {
         var idx = (x + y * myImageData.width) * 4;
         if(myImageData.data[idx + 3]) {
            if(x < left) left = x;
            if(y < top) top = y;
            if(x > right) right = x;
            if(y > bottom) bottom = y;
         }
      }
   }
   if(flip) {
      return {
         x: width - left - (right - left),
         y: top,
         width: right - left,
         height: bottom - top
      };         
   } else {
      return {
         x: left,
         y: top,
         width: right - left,
         height: bottom - top
      };         
   }
}, function(image, flip, frame) { return '' + image.src + flip + JSON.stringify(frame); });

var definePlayer = function(
   Images, 
   PlayerState,
   Stage,
   Util,
   MovingObject,
   Debug,
   _
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

   Mduel.Player.Player = Mduel.MovingObject.extend({
      defaults: _.extend({
         location: 'platform',
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
         this.set('playerState', playerState);
      },

      getBoundingBox: function() {
         var image = this.get('spriteImage');
         var flip = this.get('flip');
         var frame = this.get('playerState').currentAnimation.getSprite();
         var box = calculateBoundingBox(image, flip, frame);
         return {
            x: this.getPositionX() + box.x, 
            y: this.getPositionY() + box.y, 
            width: box.width, 
            height: box.height 
         };
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
            ctx.strokeStyle = "white";
            ctx.strokeRect(box.x, box.y, box.width, box.height);
         }
      },
      
      update: function(elapsed) {
         // Update position
         var vx = this.getVelocityX();
         var vy = this.getVelocityY();
         if(vx !== 0) {
            this.changePositionX(vx);
         }
         if(vy !== 0) {
            this.changePositionY(vy);
         }

         // Update location
         this.updateLocation();
         
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
     
      updateLocation: function() {
         // Possible Values: air, pit, platform, rope
         if (this.location == 'platform') 
         {         
            if (this.isOnPlatform())
            {
            }
            else
            {
               this.location = 'air';
            }         
         }
      },
      
      isOnPlatform: function() {
         Mduel.Game = require('mduel/game');
         var rval = undefined;
      
         var playerCenter = this.getPositionX() + 32;
      
         var predX = function(p) {
            return playerCenter >= p.x && playerCenter <= (p.x + 32);
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
      'underscore'
   ], definePlayer);
} else if(typeof module !== 'undefined.') {
   module.exports = definePlayer(
      require('./images'),
      require('./playerState'),
      require('./stage'),
      require('./util'),
      require('./movingObject'),
      require('./debug'),
      require('underscore')
   );
}