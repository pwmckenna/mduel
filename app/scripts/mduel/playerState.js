var definePlayerState = function(
   Animations,
   Keyboard,
   Constants,
   _
) {
   console.log('playerState loaded');
   if (typeof Mduel == 'undefined') {
      var Mduel = {};
   }
   if (typeof Mduel.PlayerState == 'undefined') {
      Mduel.PlayerState = {};
   }

   Mduel.Animations = Animations;
   Mduel.Keyboard = Keyboard;
   Mduel.Constants = Constants;

   Mduel.PlayerState.playerState = function(spec) {
      var that = {};
    
      that.player = spec.player;

      that.states = {};
      that.states.standVictory = {
         animation: 'standVictory'
      };
      that.states.ropeVictory = {
         animation: 'ropeVictory'
      };
      that.states.stand = {
         animation: 'stand',
         collide: function(state, x, y, vx, vy) {
            console.log('stand collide', state, x, y, vx, vy);
            switch(state) {
               case 'run':
               case 'runJump':
                  that.player.setVelocityX(vx);
                  var forward = (!that.player.get('flip') && that.player.getVelocityX() > 0) ||
                     (that.player.get('flip') && that.player.getVelocityX() < 0);
                  that.setState(forward ? 'knockForwardHard' : 'knockBackHard');
               break;
               case 'roll':
                  that.player.setVelocityY(-10);
                  that.setState('standJump');
               break;
               case 'standJump':
                  that.player.setVelocityY(-10);
                  that.setState('standJump');
               break;
               case 'disintegrate':
               break;
               default:
                  throw 'stand/' + state + ' not supported';
               break;
            }
         },
         update: function(elapsed) {
            if (!that.player.isOnPlatform()) {
               that.setState('fall');
            }
         },
         keyUp : function(keyState) {
          
         },
         keyDown : function(keyState) {
            if (keyState.lastKey.name == 'left' && keyState.left.pressed && !keyState.right.pressed) {
               that.player.setVelocityX(-that.player.get('RUN_SPEED'));
               that.player.setFlip(true);
               that.setState('run');
            } 
            else if (keyState.lastKey.name == 'right' && keyState.right.pressed && !keyState.left.pressed) {
               that.player.setVelocityX(that.player.get('RUN_SPEED'));
               that.player.setFlip(false);
               that.setState('run');
            }
            else if (keyState.lastKey.name == 'down' && !keyState.right.pressed && !keyState.right.pressed) {
               var rope = that.player.isOnRope();
            
               if (rope) {
                  that.player.setPositionX(rope.ropeStart.x - 32);
               
                  that.player.setVelocityY(that.player.get('CLIMB_SPEED'));
                  that.setState('climbing');
               }
               else {
                  that.setState('crouching');
               }
            }
            else if (keyState.lastKey.name == 'up' && !keyState.right.pressed && !keyState.right.pressed) {
               var rope = that.player.isOnRope();
               
               if (rope) {
                  that.player.setPositionX(rope.ropeStart.x - 32);
               
                  that.player.setVelocityY(-that.player.get('CLIMB_SPEED'));
                  that.setState('climbing');
               }
               else {
                  that.player.setVelocityY(-10);
                  that.setState('standJump');
               }
            }
         }
      };
      that.states.run = {
         animation : 'run',
         update : function(elapsed) {
            if (!that.player.isOnPlatform()) {
               that.setState('fall');
            }
         },
         collide: function(state, x, y, vx, vy) {
            console.log('run collide', state, x, y, vx, vy);
            switch(state) {
               case 'run':
                  that.player.setVelocityX(vx);
                  that.player.setVelocityY(vy);
                  that.setState('knockBackHard');
                  break;
               case 'stand':
                  that.player.setVelocityX(0);
                  that.setState('knockForward');
               break;
               case 'standJump':
               case 'runJump':
                  that.player.changeVelocityX(vx);
                  var forward = (!that.player.get('flip') && that.player.getVelocityX() > 0) ||
                     (that.player.get('flip') && that.player.getVelocityX() < 0);
                  that.setState(forward ? 'knockForwardHard' : 'knockBackHard');
               break;
               default:
                  throw 'run/' + state + ' not supported';
               break;
            }
         },
         keyUp : function(keyState) {
            if (!keyState.left.pressed && !keyState.right.pressed) {
               that.player.setVelocityX(0);
               that.setState('stand');
            }
            else if (!keyState.left.pressed && keyState.right.pressed) 
            {
               that.player.setVelocityX(that.player.get('RUN_SPEED'));
               that.player.setFlip(false);
            } 
            else if (keyState.left.pressed && !keyState.right.pressed) 
            {
               that.player.setVelocityX(-that.player.get('RUN_SPEED'));
               that.player.setFlip(true);
            }  
         },
         keyDown : function(keyState) {
            if (keyState.lastKey.name == 'down') {
               if (keyState.left.pressed || keyState.right.pressed) {
                  that.setState('roll');
               } 
               else {
                  that.setState('crouch');
               }
            }
            else if (keyState.lastKey.name == 'up') {
               that.player.setVelocityY(-10);
               that.setState('runJump');
            }
         }      
      };
      that.states.standJump = {
         animation : 'standJump',
         update : function(elapsed) {
            if (that.player.getVelocityY() < that.player.get('MAX_FALL_SPEED')) {
               var updatePercentage =  elapsed / Mduel.Constants.UPDATE_RATE;
               that.player.changeVelocityY(1 * updatePercentage);
            }

            if (that.player.getVelocityY() >= 0) {
               var platform = that.player.isOnPlatform();
               
               if (platform) {            
                  that.player.setPositionY(platform.y - 56);
               
                  that.player.setVelocityY(0);
                  that.setState('stand');
               }
            }
         },
         collide: function(state, x, y, vx, vy) {
            console.log('standJump collide', state, x, y, vx, vy);
            switch(state) {
               case 'roll':
               case 'crouch':
               case 'stand':
               case 'standJump':
               case 'run':
               break;
               default:
                  throw 'standJump/' + state + ' not supported';
               break;
            }
         }
      };
      that.states.runJump = {
         animation : 'runJump',
         update : function(elapsed) {
            if (that.player.getVelocityY() < that.player.get('MAX_FALL_SPEED')) {
               var updatePercentage =  elapsed / Mduel.Constants.UPDATE_RATE;
               that.player.changeVelocityY(1 * updatePercentage);
            }

            if (that.player.getVelocityY() >= 0) {
               var platform = that.player.isOnPlatform();

               if (that.player.getPositionY() >= 320) {
                  that.player.setVelocity(0, 0);
                  that.player.setPositionY(320);
                  that.setState('disintegrate');
               } else if (platform) {
                  that.player.setVelocityY(0);
                  
                  that.player.setPositionY(platform.y - 56);
               
                  var keyState = Mduel.Keyboard.playerKeyStates[that.player.id];
                  if (!keyState.right.pressed && !keyState.left.pressed) {
                     that.player.setVelocityX(0);
                     that.setState('stand');
                  }
                  else {
                     if ((keyState.right.pressed && !keyState.left.pressed && that.player.getVelocityX() < 0) ||
                         (keyState.left.pressed && !keyState.right.pressed && that.player.getVelocityX() > 0)) {
                        that.player.setFlip(!that.player.getFlip());
                        that.player.setVelocityX(-1 * that.player.getVelocityX());
                     }
                  
                     that.setState('run');
                  }
               }
            }
         },
         collide: function(state, x, y, vx, vy) {
            console.log('runJump collide', state, x, y, vx, vy);
            switch(state) {
               case 'stand':
                  that.setState('knockBack');
                  that.player.setVelocityX(-1 * that.player.getVelocityX());
                  that.player.setVelocityY(0);
               break;
               default:
                  throw 'runJump/' + state + ' not supported';
               break;
            }
         }
      };
      that.states.crouching = {
         animation : 'crouching',
         update : function(elapsed) {
            if (that.currentAnimation.isFinished()) {
               var keyState = Mduel.Keyboard.playerKeyStates[that.player.id];
               if(keyState.down.pressed) {
                  that.setState('crouch');
               } else {
                  that.setState('uncrouching');
               }
            }
         },
         collide: function(state, x, y, vx, vy) {
            console.log('crouching collide', state, x, y, vx, vy);
            switch(state) {
               case 'standJump':
                  that.player.setVelocityY(-10);
                  that.setState('standJump');
               break;
               default:
                  throw 'crouching/' + state + ' not supported';
               break;
            }
         }
      };
      that.states.crouch = {
         animation : 'crouch',
         keyUp : function(keyState) {
            if (!keyState.down.pressed) {
               that.setState('uncrouching');
            }
         },
         collide: function(state, x, y, vx, vy) {
            console.log('crouch collide', state, x, y, vx, vy);
            switch(state) {
               case 'standJump':
                  that.player.setVelocityY(-10);
                  that.setState('standJump');
               break;
               default:
                  throw 'crouch/' + state + ' not supported';
               break;
            }
         }
      };
      that.states.roll = {
         animation : 'roll',
         update : function(elapsed) {
            if (!that.player.isOnPlatform()) {
               that.setState('fall');
            }
            else if (that.currentAnimation.isFinished()) {
               that.player.setVelocityX(0);
               
               var keyState = Mduel.Keyboard.playerKeyStates[that.player.id];
               
               if (keyState.down.pressed) {
                  that.setState('crouch');
               }
               else {
                  that.setState('uncrouching');
               }
            }
         },
         collide: function(state, x, y, vx, vy) {
            console.log('roll collide', state, x, y, vx, vy);
            switch(state) {
               case 'stand':
               case 'standJump':
               break;
               default:
                  throw 'roll/' + state + ' not supported';
               break;
            }
         }
      };
      that.states.knockForward = {
         animation : 'knockForward',
         update : function(elapsed) {
            if (!that.player.isOnPlatform()) {
               that.setState('fall');
            } else if (that.currentAnimation.isFinished()) {
               var keyState = Mduel.Keyboard.playerKeyStates[that.player.id];
            
               if (keyState.left.pressed && (!keyState.right.pressed || keyState.left.eventTime > keyState.right.eventTime)) {
                  that.player.setFlip(true);
                  that.player.setVelocityX(-that.player.get('RUN_SPEED'));
                  that.setState('run');
               }
               else if (keyState.right.pressed && (!keyState.left.pressed || keyState.right.eventTime > keyState.left.eventTime)) {
                  that.player.setFlip(false);
                  that.player.setVelocityX(that.player.get('RUN_SPEED'));
                  that.setState('run');
               }
               else {
                  that.setState('stand');
               }
            }
         }
      };
      that.states.knockForwardHard = {
         animation : 'knockForwardHard',
         update : that.states.knockForward.update
      },
      that.states.knockBack = {
         animation : 'knockBack',
         update : function(elapsed) {
            if (!that.player.isOnPlatform()) {
               that.setState('fall');
            } else if (that.currentAnimation.isFinished()) {
               var keyState = Mduel.Keyboard.playerKeyStates[that.player.id];
            
               if (keyState.left.pressed && (!keyState.right.pressed || keyState.left.eventTime > keyState.right.eventTime)) {
                  that.player.setFlip(true);
                  that.player.setVelocityX(-that.player.get('RUN_SPEED'));
                  that.setState('run');
               }
               else if (keyState.right.pressed && (!keyState.left.pressed || keyState.right.eventTime > keyState.left.eventTime)) {
                  that.player.setFlip(false);
                  that.player.setVelocityX(that.player.get('RUN_SPEED'));
                  that.setState('run');
               }
               else {
                  that.player.setVelocityX(0);
                  that.setState('stand');
               }
            }
         }
      };
      that.states.knockBackHard = {
         animation: 'knockBackHard',
         update: that.states.knockBack.update
      };
      that.states.uncrouching = {
         animation : 'uncrouching',
         update : function(elapsed) {
            if (that.currentAnimation.isFinished()) {
               var keyState = Mduel.Keyboard.playerKeyStates[that.player.id];
            
               if (keyState.left.pressed && (!keyState.right.pressed || keyState.left.eventTime > keyState.right.eventTime)) {
                  that.player.setFlip(true);
                  that.player.setVelocityX(-that.player.get('RUN_SPEED'));
                  that.setState('run');
               }
               else if (keyState.right.pressed && (!keyState.left.pressed || keyState.right.eventTime > keyState.left.eventTime)) {
                  that.player.setFlip(false);
                  that.player.setVelocityX(that.player.get('RUN_SPEED'));
                  that.setState('run');
               }
               else {
                  that.player.setVelocityX(0);
                  that.setState('stand');
               }
            }
         },
         collide: function(state, x, y, vx, vy) {
            console.log('uncrouching collide', state, x, y, vx, vy);
            switch(state) {
               default:
                  throw 'uncrouching/' + state + ' not supported';
               break;
            }
         }
      };
      that.states.climbing = {
         animation : 'climbing',
         update : function(elapsed) {
            var rope = that.player.isOnRope();
            if(!rope) {
               that.player.changePositionY(-that.player.getVelocityY());
            }
         },
         collide: function(state, x, y, vx, vy) {
            console.log('climbing collide', state, x, y, vx, vy);
            switch(state) {
               default:
                  throw 'climbing/' + state + ' not supported';
               break;
            }
         },
         keyUp : function(keyState) {
            if (!keyState.up.pressed && !keyState.down.pressed) {
               that.player.setVelocityY(0);
               that.setState('rope');
            }
         },
         keyDown : function(keyState) {
            if (keyState.lastKey.name == 'left') {
               that.player.setVelocityX(-that.player.get('RUN_SPEED'));
               that.setState('fall');
            }
            else if (keyState.lastKey.name == 'right') {
               that.player.setVelocityX(that.player.get('RUN_SPEED'));
               that.setState('fall');
            }
         }
      };
      that.states.rope = {
         animation : 'rope',
         collide: function(state, x, y, vx, vy) {
            console.log('rope collide', state, x, y, vx, vy);
            switch(state) {
               default:
                  throw 'rope/' + state + ' not supported';
               break;
            }
         },
         keyUp : function(keyState) {
         },
         keyDown : function(keyState) {
            if (keyState.lastKey.name == 'up') {
               that.player.setVelocityY(-that.player.get('CLIMB_SPEED'));
               that.setState('climbing');            
            }
            else if (keyState.lastKey.name == 'down') {
               that.player.setVelocityY(that.player.get('CLIMB_SPEED'));
               that.setState('climbing');
            }
            else if (keyState.lastKey.name == 'left') {
               that.player.setVelocityX(-that.player.get('RUN_SPEED'));               
               that.setState('fall');
            }
            else if (keyState.lastKey.name == 'right') {
               that.player.setVelocityX(that.player.get('RUN_SPEED'));               
               that.setState('fall');
            }
         }
      };
      that.states.ropeFall = {
         animation : 'stand',
         update : function(elapsed) {
            if (that.player.getVelocityY() < that.player.get('MAX_FALL_SPEED')) {
               var updatePercentage =  elapsed / Mduel.Constants.UPDATE_RATE;
               that.player.changeVelocityY(1 * updatePercentage);
            }
            
            if (that.player.getPositionY() >= 320) {
               that.player.setVelocity(0, 0)
               that.player.setPositionY(320);
               that.setState('disintegrate');
            }
            else {
               var platform = that.player.isOnPlatform();
               if (platform) {
                  that.player.setVelocity(0, 0);
                  that.setState('stand');
               }
            }            
         },
         collide: function(state, x, y, vx, vy) {
            console.log('ropeFall collide', state, x, y, vx, vy);
            switch(state) {
               default:
                  throw 'stand/' + state + ' not supported';
               break;
            }
         }
      };
      that.states.fall = {
         animation : 'standFall',
         update : function(elapsed) {         
            if (that.player.getVelocityY() < that.player.get('MAX_FALL_SPEED')) {
               var updatePercentage =  elapsed / Mduel.Constants.UPDATE_RATE;
               that.player.changeVelocityY(1 * updatePercentage);
            }
            
            if (that.player.getPositionY() >= 320) {
               that.player.setVelocity(0, 0);
               that.player.setPositionY(320);
               that.setState('disintegrate');
            }
            else {
               var platform = that.player.isOnPlatform();
               if (platform) {
                  that.player.setVelocityY(0);
                  that.player.setPositionY(platform.y - 56);
                  that.setState('runJump');
               }
               if(that.player.getVelocityX() < 0) {
                  that.player.setFlip(true);
               } else if(that.player.getVelocityX() > 0) {
                  that.player.setFlip(false);
               }
            }
         },
         collide: function(state, x, y, vx, vy) {
            console.log('fall collide', state, x, y, vx, vy);
            switch(state) {
               default:
                  throw 'standFall/' + state + ' not supported';
               break;
            }
         }
      };
      that.states.disintegrate = {
         animation: 'disintegrate',
         update : function(elapsed) {
            if (that.currentAnimation.isFinished()) {
               that.setState('dead');
               that.player.collection.remove(that.player);
            }
         },
      };
      that.states.vaporize = {
         animation: 'vaporize',
         update : function(elapsed) {
            if(that.currentAnimation.isFinished()) {
               that.setState('dead');
               that.player.collection.remove(that.player);
            }
         }
      };
      that.states.dead = {
         animation : 'empty'
      };

      that.getState = function() {
         return that.state;
      }

      that.setState = function(state) {
         console.log('setState', state);
         that.state = state;
         if (that.states[state]) {
            that.currentState = that.states[state];
            that.currentAnimation = Mduel.Animations[that.currentState.animation]();
         }
      }
      
      that.collide = function(state, x, y, vx, vy) {
         if(_.any([state, that.getState()], function(s) {
            return s === 'knockForwardHard' ||
               s === 'knockForward' ||
               s === 'knockBackHard' ||
               s === 'knockBack' ||
               s === 'vaporize' || 
               s === 'disintegrate';
         })) {
            return;
         }
         if (that.currentState && that.currentState.collide) {
            that.currentState.collide(state, x, y, vx, vy);
         } else {
            throw state + ' collisions not supported';
         }
      }

      that.update = function(elapsed) {
         if (that.currentState && that.currentState.update) {
            that.currentState.update(elapsed);
         }
      }   
      
      that.setState(that.player.get('state'));
      return that;
   }

   return Mduel.PlayerState;
};

if(typeof define !== 'undefined') {
   define([
      'mduel/animations',
      'mduel/keyboard',
      'mduel/constants',
      'underscore'
   ], definePlayerState);   
} else if(typeof module !== 'undefined.') {
   module.exports = definePlayerState(
      require('./animations'), 
      require('./keyboard'),
      require('./constants'),
      require('./underscore')
   );
}
