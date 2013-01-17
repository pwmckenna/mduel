var definePickups = function(Animations, Images, Util, MovingObject, _) {
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

   Mduel.Pickups.Pickup = MovingObject.extend({
      initialize: function() {
         var bubble = Mduel.Animations.bubble();
         var image = Mduel.Animations[this.get('type')]();
         this.set('bubble', bubble);
         this.set('image', image);
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
         // Update position
         var vx = this.getVelocityX();
         var vy = this.getVelocityY();
         if(vx !== 0) {
            this.changePositionX(vx);
         }
         if(vy !== 0) {
            this.changePositionY(vy);
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
      }
   });

   Mduel.Pickups.Pickups = Backbone.Collection.extend({
      initialize: function() {
         this.create();
         this.create();
         this.create();
      },


      update: function(elapsed) {
         this.each(function(pickup) {
            pickup.update(elapsed);
         });
      },
      
      draw: function(ctx, elapsed) {
         this.each(function(pickup) {
            pickup.draw(ctx, elapsed);
         })
      },

      create: function() {
         var vx = Math.random() + 0.4;
         var vy = 1.8 - vx;
         vx = Math.random() < 0.5 ? vx : -vx;
         vy = Math.random() < 0.5 ? vy : -vy;
         var types = [
            'skull',
            'lightning',
            'invisibility',
            'mine',
            'gun',
            'explode'
         ];
         var pickup = new Mduel.Pickups.Pickup({
            x: 320 - 16,
            y: 20,
            vx: vx,
            vy: vy,
            type: types[Math.floor(Math.random() * types.length)]
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
      'underscore'
   ], definePickups);
} else if(typeof module !== 'undefined') {
   module.exports = definePickups(
      require('../mduel/animations'),
      require('../mduel/images'),
      require('../mduel/util'),
      require('../mduel/movingObject'),
      require('underscore')
   );   
}