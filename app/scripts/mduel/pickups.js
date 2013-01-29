var definePickups = function(Animations, Images, Util, MovingObject, Debug, Constants, _) {
   console.log('pickups loaded');
   if (typeof Mduel == 'undefined') {
      var Mduel = {};
   }
   if (typeof Mduel.Pickups == 'undefined') {
      Mduel.Pickups = {};
   }

   Mduel.Animations = Animations;
   Mduel.Images = Images;
   Mduel.Util = Util;
   Mduel.Debug = Debug;
   Mduel.Constants = Constants;

   Mduel.Pickups.Types = [
      'skull',
      'lightning',
      'invisibility',
      'mine',
      'gun',
      'explode'
   ];

   Mduel.Pickups.Pickup = MovingObject.extend({
      initialize: function() {
         var bubble = Mduel.Animations.bubble();
         var type = Mduel.Pickups.Types[Math.floor(Math.random() * Mduel.Pickups.Types.length)];
         this.set('type', type);
         var image = Mduel.Animations[this.get('type')]();
         this.set('bubble', bubble);
         this.set('image', image);
      },

      getBoundingBox: function() {
         var image = Mduel.Images.pickups;
         var frame = this.get('bubble').getSprite();
         var box = Mduel.Util.calculateBoundingBox(image, false, frame);
         return { 
            x: this.getPositionX() + box.x, 
            y: this.getPositionY() + box.y, 
            width: box.width, 
            height: box.height 
         };
      },

      drawAnimation: function(ctx, elapsed, animation, pos) {
         animation.animate(elapsed);
         var frame = animation.getSprite();
         ctx.drawImage(Mduel.Images.pickups, 
            // Source X and Y coordinates
            frame.x, frame.y, 
            // Source Width and Height
            frame.width, frame.height, 
            // Destination X and Y coordinates
            this.getPositionX(), this.getPositionY(),
            // Destination Width and Height
            frame.width, frame.height);
      },
      
      update: function(elapsed) {
         var updatePercentage =  elapsed / Mduel.Constants.UPDATE_RATE;
         // Update position
         var vx = this.getVelocityX();
         var vy = this.getVelocityY();
         if(vx !== 0) {
            this.changePositionX(vx * updatePercentage);
         }
         if(vy !== 0) {
            this.changePositionY(vy * updatePercentage);
         }
         if(this.getPositionX() < 0) {
            this.setVelocityX(Math.abs(this.getVelocityX()));
         } else if(this.getPositionX() > (640 - 30)) {
            this.setVelocityX(-Math.abs(this.getVelocityX()));
         }
         if(this.getPositionY() < 0) {
            this.setVelocityY(Math.abs(this.getVelocityY()));
         } else if(this.getPositionY() > (400 - 30 - 30)) {
            this.setVelocityY(-Math.abs(this.getVelocityY()));
         }         
      },

      draw: function(ctx, elapsed) {
         this.drawAnimation(ctx, elapsed, this.get('bubble'));
         this.drawAnimation(ctx, elapsed, this.get('image'));
         if(Mduel.Debug.debug) {
            var box = this.getBoundingBox();
            //draw the bounding box so we can work on collision detection
            //draw the bounding box so we can work on collision detection
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.strokeRect(box.x, box.y, box.width, box.height);
         }
      },

      killPlayer: function(player) {
         player.get('playerState').setState('disintegrate');
         player.setVelocity(0, 0);
      },

      bestowAbility: function(player) {
         player.set('pickup', this.get('type'));
      },

      destroyPlatform: function(platform) {

      },

      handleCollisions: function(elapsedTime, players, stage) {
         switch(this.get('type')) {
            case 'skull':
            players.each(function(player) {
               if(Mduel.Util.colliding(this.getBoundingBox(), player.getBoundingBox())) {
                  this.killPlayer(player);
                  this.collection.remove(this);
               }
            }, this);
            break;
            case 'lightning':
            case 'invisibility':
            case 'mine':
            case 'gun':
            players.each(function(player) {
               if(Mduel.Util.colliding(this.getBoundingBox(), player.getBoundingBox())) {
                  this.bestowAbility(player);
                  this.collection.remove(this);
               }
            }, this);
            break;
            case 'explode':
            var getPlatformBox = function(platform) {
               return {
                  x: platform.x,
                  y: platform.y,
                  width: 28,
                  height: 16
               };
            }
            var box = this.getBoundingBox();
            var collided = false;
            for (var i = stage.platforms.length - 1; i >= 0; --i) {
               var platform = stage.platforms[i];
               var platformBox = getPlatformBox(platform);
               if(Mduel.Util.colliding(box, platformBox)) {
                  collided = true;
               }
            }
            if(collided) {
               box.x -= box.width;
               box.width *= 3;
               for (var i = stage.platforms.length - 1; i >= 0; --i) {
                  var platform = stage.platforms[i];
                  var platformBox = getPlatformBox(platform);
                  if(Mduel.Util.colliding(box, platformBox)) {
                     var affectedPlayers = players.filter(function(player) { 
                        return _.isEqual(player.isOnPlatform(), platform);
                     });
                     stage.platforms.splice(i, 1);
                     _.each(affectedPlayers, function(player) {
                        player.get('playerState').setState('runJump');
                     });
                  }
               }

               this.collection.remove(this);
            }

            //do something with the stage
            break;
         }
      }
   });

   Mduel.Pickups.Pickups = Backbone.Collection.extend({
      initialize: function() {
      },

      update: function(elapsed) {
         this.each(function(pickup) {
            pickup.update(elapsed);
         });
         _.times(3 - this.length, function() {
            if(Math.random() < 0.01) {
               this.create();
            }
         }, this);
      },
      
      draw: function(ctx, elapsed) {
         this.each(function(pickup) {
            pickup.draw(ctx, elapsed);
         })
      },

      handleCollisions: function(elapsedTime, players, stage) {
         this.each(function(pickup) {
            pickup.handleCollisions(elapsedTime, players, stage);
         });
      },

      create: function() {
         var vx = Math.random() + 0.4;
         var vy = 1.8 - vx;
         vx = Math.random() < 0.5 ? vx : -vx;
         vy = Math.random() < 0.5 ? vy : -vy;
         var pickup = new Mduel.Pickups.Pickup({
            x: 320 - 16,
            y: 20,
            vx: vx,
            vy: vy
         });
         this.add(pickup);
      }
   });
   
   return Mduel.Pickups;
};

if(typeof define !== 'undefined') {
   define([
      'mduel/animations', 
      'mduel/images',
      'mduel/util',
      'mduel/movingObject',
      'mduel/debug',
      'mduel/constants',
      'underscore'
   ], definePickups);
} else if(typeof module !== 'undefined') {
   module.exports = definePickups(
      require('../mduel/animations'),
      require('../mduel/images'),
      require('../mduel/util'),
      require('../mduel/movingObject'),
      require('../mduel/debug'),
      require('../mduel/constants'),
      require('underscore')
   );   
}