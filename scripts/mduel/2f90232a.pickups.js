var definePickups = function(Animations, Images, Util, _) {
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

   Mduel.Pickups.pickup = function(firebase) {
      var that = {};
      that.firebase = firebase;
      that.bubble = Mduel.Animations.bubble();
      that.image = Mduel.Animations.skull();

      that.remove = function() {
         firebase.remove();
      }

      that.get = function(key) {
         var pos = null;
         firebase.child(key).once('value', function(dataSnapshot) {
            pos = dataSnapshot.val();
         });
         return pos;
      }
      
      that.set = function(key, value) {
         var original;
         firebase.once('value', function(dataSnapshot) {
            original = dataSnapshot.val();
         });
         firebase.transaction(function(current) {
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
         firebase.once('value', function(dataSnapshot) {
            original = dataSnapshot.val();
         });
         firebase.transaction(function(current) {
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

      that.update = function(elapsed) {
         var velocity = that.get('velocity');
         that.change('position/x', velocity.x);
         that.change('position/y', velocity.y);
         var position = that.get('position');
         if(position.x < 0) {
            that.set('velocity/x', Math.abs(velocity.x));
         } else if(position.x > (640 - 30)) {
            that.set('velocity/x', -Math.abs(velocity.x));
         }
         if(position.y < 0) {
            that.set('velocity/y', Math.abs(velocity.y));
         } else if(position.y > (400 - 30 - 30)) {
            that.set('velocity/y', -Math.abs(velocity.y));
         }
      }

      that.drawAnimation = function(ctx, elapsed, animation, pos) {
         animation.animate(elapsed);
         var frame = animation.getSprite();
         ctx.drawImage(Mduel.Images.pickups, 
            // Source X and Y coordinates
            frame.x, frame.y, 
            // Source Width and Height
            frame.width, frame.height, 
            // Destination X and Y coordinates
            pos.x, pos.y,
            // Destination Width and Height
            frame.width, frame.height);
      }
      
      that.draw = function(ctx, elapsed) {
         var pos = that.get('position');
         if(!pos) return;
         that.drawAnimation(ctx, elapsed, that.bubble, pos);
         that.drawAnimation(ctx, elapsed, that.image, pos);
      }
            
      return that;
   }

   Mduel.Pickups.pickups = function(firebase) {
      var that = {};
      that.firebase = firebase;
      that.items = [];
      
      var onPickupAdded = function(dataSnapshot) {
         console.log('onPickupAdded', dataSnapshot.val());
         that.items.push(new Mduel.Pickups.pickup(dataSnapshot.ref()));
      };

      var onPickupRemoved = function(dataSnapshot) {
         console.log('onPickupRemoved', dataSnapshot.val());
         delete that.items[dataSnapshot.name()];
      };

      firebase.on('child_added', onPickupAdded);
      firebase.on('child_removed', onPickupRemoved);

      that.update = function(elapsed) {
         for(var i = 0; i < that.items.length; i++) {
            that.items[i].update(elapsed);
         }
      }
      
      that.draw = function(ctx, elapsed) {
         for(var i = 0; i < that.items.length; i++) {
            that.items[i].draw(ctx, elapsed);
         }
      }

      that.handlePlayerCollisions = function(players) {
         for(var i = 0; i < that.items.length; i++) {
            var item = that.items[i];
            var itemBoundingBox = item.getBoundingBox();
            for(var j = 0; j < players.length; j++) {
               var player = players[j];
               var playerBoundingBox = player.getBoundingBox();
               if(Mduel.Util.colliding(itemBoundingBox, playerBoundingBox)) {
                  player.set('pickup', item.get('type'));
                  item.remove();
                  break;
               }
            }
         }
      }

      that.create = function() {
         var vx = Math.random() + 0.8;
         var vy = 3.6 - vx;
         vx = Math.random() < 0.5 ? vx : -vx;
         vy = Math.random() < 0.5 ? vy : -vy;
         firebase.push({
            position: {
               x: 320 - 16,
               y: 20
            },
            velocity: {
               x: vx,
               y: vy
            },
            type: 'explode'
         });
      }
            
      return that;
   }
   
   return Mduel.Pickups;
};

if(typeof define !== 'undefined') {
   define([
      'mduel/animations', 
      'mduel/images',
      'mduel/util',
      'underscore'
   ], definePickups);
} else if(typeof module !== 'undefined') {
   module.exports = definePickups(
      require('../mduel/animations'),
      require('../mduel/images'),
      require('../mduel/util'),
      require('underscore')
   );   
}