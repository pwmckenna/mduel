var definePlayerState = function(
   Animations,
   Keyboard
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

   Mduel.PlayerState.playerState = function(spec) {
      var that = {};
    
      that.player = spec.player;

      that.states = {
         standVictory: {
            animation: 'standVictory'
         },
         ropeVictory: {
            animation: 'ropeVictory'
         },
         stand : {
            animation: 'stand',
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
         },
         run : {
            animation : 'run',
            update : function(elapsed) {
               if (!that.player.isOnPlatform()) {
                  that.setState('fall');
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
         },
         standJump : {
            animation : 'standJump',
            update : function(elapsed) {
               if (that.player.getVelocityY() < that.player.get('MAX_FALL_SPEED')) {
                  that.player.changeVelocityY(1);
               }

               if (that.player.getVelocityY() >= 0) {
                  var platform = that.player.isOnPlatform();
                  
                  if (platform) {            
                     that.player.setPositionY(platform.y - 56);
                  
                     that.player.setVelocityY(0);
                     that.setState('stand');
                  }
               }
            }
         },
         runJump : {
            animation : 'runJump',
            update : function(elapsed) {
               if (that.player.getVelocityY() < that.player.get('MAX_FALL_SPEED')) {
                  that.player.changeVelocityY(1);
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
            }
         },
         crouching : {
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
            }
         },
         crouch : {
            animation : 'crouch',
            keyUp : function(keyState) {
               if (!keyState.down.pressed) {
                  that.setState('uncrouching');
               }
            }
         },
         roll : {
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
            }
         },
         knockForward : {
            animation : 'knockForward',
            update : function(elapsed) {
               if (that.currentAnimation.isFinished()) {
                  that.setState('fall');
               }
            }
         },
         knockBack : {
            animation : 'knockBack',
            update : function(elapsed) {
               if (that.currentAnimation.isFinished()) {
                  that.setState('fall');
               }
            }
         },
         uncrouching : {
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
                     that.setState('stand');
                  }
               }
            }
         },
         climbing : {
            animation : 'climbing',
            update : function(elapsed) {
               var rope = that.player.isOnRope();
               if(!rope) {
                  that.player.changePositionY(-that.player.getVelocityY());
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
         },
         rope : {
            animation : 'rope',
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
         },
         ropeFall : {
            animation : 'stand',
            update : function(elapsed) {
               if (that.player.getVelocityY() < that.player.get('MAX_FALL_SPEED')) {
                  that.player.changeVelocityY(1);
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
            }
         },
         fall : {
            animation : 'standFall',
            update : function(elapsed) {         
               if (that.player.getVelocityY() < that.player.get('MAX_FALL_SPEED')) {
                  that.player.changeVelocityY(1);
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
            }
         },
         disintegrate : {
            animation: 'disintegrate',
            update : function(elapsed) {
               if (that.currentAnimation.isFinished()) {
                  that.setState('dead');
                  that.player.collection.remove(that.player);
               }
            }
         },
         vaporize : {
            animation: 'vaporize',
            update : function(elapsed) {
               if(that.currentAnimation.isFinished()) {
                  that.setState('dead');
                  that.player.collection.remove(that.player);
               }
            }
         },
         dead : {
            animation : 'empty'
         }
      };

      that.setState = function(state) {
         console.log('setState', state);
         if (that.states[state]) {
            that.currentState = that.states[state];
            that.currentAnimation = Mduel.Animations[that.currentState.animation]();
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
      'mduel/keyboard'
   ], definePlayerState);   
} else if(typeof module !== 'undefined.') {
   module.exports = definePlayerState(
      require('./animations'), 
      require('./keyboard')
   );
}
