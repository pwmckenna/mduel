var definePlayer = function(
   Images, 
   PlayerState,
   Stage,
   Util
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

   Mduel.Player.player = function(spec) {
      var that = {};
     
      that.location = 'platform';
      that.firebase = spec.firebase;
      
      that.playerState = Mduel.PlayerState.playerState({ 
         player: that
      });
      
      that.id = spec.id;
      that.spriteImage = spec.spriteImage;
      that.constants = Mduel.Player.Constants;

      var memoize = function(func, hasher) {
         var memo = {};
         return function() {
            var key = hasher.apply(this, arguments);
            return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
         };
      };
      /**
       *
      **/
      var calculateBoundingBox = memoize(function(image, flip, x, y, width, height) {
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
      }, function(image, flip, x, y, w, h) { return '' + image + flip + x + y + w + h; });

      that.setBoundingBox = function() {
         var pos = that.get('position');
         var image = that.spriteImage;
         var flip = that.get('flip');
         var frame = that.playerState.currentAnimation.getSprite();
         var box = calculateBoundingBox(image, flip, frame.x, frame.y, frame.width, frame.height);
         that.set('box', { x: pos.x + box.x, y: pos.y + box.y, width: box.width, height: box.height });
      }

      that.getBoundingBox = function() {
         return that.get('box');
      }

      that.name = function() {
         return that.firebase.name();
      }

      that.remove = function() {
         that.firebase.remove();
      }

      that.get = function(key) {
         var ret;
         that.firebase.child(key).once('value', function(dataSnapshot) {
            ret = dataSnapshot.val();
         });
         if(typeof ret === 'undefined') {
            throw 'tried to get key ' + key + ' before waiting for the value to be available on firebase';
         }
         return ret;
      }

      that.set = function(key, value) {
         var original;
         that.firebase.once('value', function(dataSnapshot) {
            original = dataSnapshot.val();
         });
         that.firebase.transaction(function(current) {
            var keys = key.split('/');
            var modify = current;
            for(var i = 0; i < keys.length - 1; i++) {
               modify = modify[keys[i]];
            }
            modify[keys[keys.length - 1]] = value;
            return current;
         }, function(success, dataSnapshot, abortReason) {
            if(!success) {
               console.log('set transaction failure', dataSnapshot.val(), abortReason);
            }
         });
      }

      that.change = function(key, value) {
         var original;
         that.firebase.once('value', function(dataSnapshot) {
            original = dataSnapshot.val();
         });
         that.firebase.transaction(function(current) {
            var keys = key.split('/');
            var modify = current;
            for(var i = 0; i < keys.length - 1; i++) {
               modify = modify[keys[i]];
            }
            modify[keys[keys.length - 1]] += value;
            return current;
         }, function(success, dataSnapshot, abortReason) {
            if(!success) {
               console.log('change transaction failure', dataSnapshot.val(), abortReason);
            }
         });
      }

      // State helpers
      that.setState = function(state) {
         that.set('state', state);
      }


      // Velocity helpers
      that.getVelocity = function() {
         return that.get('velocity');
      }

      that.getVelocityX = function() {
         return that.get('velocity/x');
      }
      that.getVelocityY = function() {
         return that.get('velocity/y');
      }

      that.setVelocity = function(x, y) {
         that.set('velocity/x', x);
         that.set('velocity/y', y);
      }

      that.setVelocityX = function(x) {
         that.set('velocity/x', x);
      }

      that.setVelocityY = function(y) {
         that.set('velocity/y', y);
      }

      that.changeVelocity = function(dx, dy) {
         that.change('velocity/x', dx);
         that.change('velocity/y', dy);
      }

      that.changeVelocityX = function(dx) {
         that.change('velocity/x', dx);
      }

      that.changeVelocityY = function(dy) {
         that.change('velocity/y', dy);
      }

      // Position helpers
      that.getPosition = function() {
         return that.get('position');
      }

      that.setPosition = function(x, y) {
         that.set('position/x', x);
         that.set('position/y', y);
      }

      that.getPositionX = function() {
         return that.get('position/x');
      }

      that.getPositionY = function() {
         return that.get('position/y');
      }

      that.setPositionX = function(x) { 
         that.set('position/x', x); 
      }

      that.setPositionY = function(y) {
         that.set('position/y', y);
      }

      that.getFlip = function() {
         return that.get('flip');
      }

      that.setFlip = function(flip) {
         that.set('flip', flip);
      }

      that.changePosition = function(dx, dy) {
         that.change('position/x', dx);
         that.change('position/y', dy);
      }

      that.changePositionX = function(dx) {
         that.change('position/x', dx);
      }

      that.changePositionY = function(dy) {
         that.change('position/y', dy);
      }


      that.draw = function(ctx, elapsed) {
         var pos = that.get('position');
         if(!pos) return;

         var posNew = { x: pos.x, y: pos.y };
         
         that.playerState.currentAnimation.animate(elapsed);
         var frame = that.playerState.currentAnimation.getSprite();

         if (that.get('flip')) {
            ctx.save();
                     
            posNew.x = -posNew.x - frame.width;
            
            ctx.transform(-1, 0, 0, 1, 0, 0);
         }      
         
         ctx.drawImage(that.spriteImage, 
            // Source X and Y coordinates
            frame.x, frame.y, 
            // Source Width and Height
            frame.width, frame.height, 
            // Destination X and Y coordinates
            posNew.x, posNew.y,
            // Destination Width and Height
            frame.width, frame.height);


         if (that.get('flip')) {        
            ctx.restore();      
         }

         that.setBoundingBox();
      }
      
      that.update = function(elapsed) {
         var pos = that.get('position');
         if(!pos) return;

         // Update position
         var vx = that.getVelocityX();
         var vy = that.getVelocityY();
         if(vx !== 0) {
            that.changePositionX(vx);
         }
         if(vy !== 0) {
            that.changePositionY(vy);
         }

         // Update location
         that.updateLocation();
         
         that.playerState.update(elapsed);
      }
         
      that.keyUp = function(keyState) {
         if (that.playerState.currentState.keyUp) {
            that.playerState.currentState.keyUp(keyState);
         }   
      }
         
      that.keyDown = function(keyState) {
         if (that.playerState.currentState.keyDown) {
            that.playerState.currentState.keyDown(keyState);
         }
      }
     
      that.updateLocation = function() {
         // Possible Values: air, pit, platform, rope
         if (that.location == 'platform') 
         {         
            if (that.isOnPlatform())
            {
            }
            else
            {
               that.location = 'air';
            }         
         }
      }
      
      that.isOnPlatform = function() {
         Mduel.Game = require('mduel/game');
         var rval = undefined;
      
         var playerCenter = that.get('position').x + 32;
      
         var predX = function(p) {
            return playerCenter >= p.x && playerCenter <= (p.x + 32);
         };
            
         var columnPlatforms = Mduel.Util.where(Mduel.Game.stage.platforms, predX);
        
         var playerFeet = that.get('position').y + 56;
        
         var predY = function(p) {
            var diff = p.y - playerFeet;
            return diff <= 12 && diff >= -8;
         }
      
         var platform = Mduel.Util.where(columnPlatforms, predY);
         
         if (platform.length > 0) {
            rval = platform[0];
         }
         
         return rval;
      }
      
      that.isOnRope = function() {
         Mduel.Game = require('mduel/game');
         var rval = undefined;

         var x = that.get('position').x + 32;
      
         var predX = function(p) {
            return x >= (p.ropeStart.x - 4) && x <= (p.ropeStart.x + 4);
         };
         
         var ropes = Mduel.Util.where(Mduel.Game.stage.ropes, predX);
         
         if (ropes.length == 1 && ropes[0].ropeEnd.y >= (that.get('position').y + 56) && ropes[0].ropeStart.y <= (that.get('position').y + 14)) {
            rval = ropes[0];
         }
         
         return rval;
      }

      return that;
   }

   Mduel.Player.initializeLocalPlayer = function(ref) {
      return Mduel.Player.player({
         spriteImage: Mduel.Images.player1,
         firebase: ref,
         id: 0
      });
   };

   Mduel.Player.Constants = {
      runSpeed: 3.2,
      climbSpeed: 2.5,
      maxFallSpeed: 12
   };

   return Mduel.Player;
};

if(typeof define !== 'undefined') {  
   define([
      'mduel/images', 
      'mduel/playerState',
      'mduel/stage',
      'mduel/util'
   ], definePlayer);
} else if(typeof module !== 'undefined.') {
   module.exports = definePlayer(
      require('./images'),
      require('./playerState'),
      require('./stage'),
      require('./util')
   );
}