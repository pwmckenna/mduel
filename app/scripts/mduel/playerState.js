var definePlayerState = function(
   _,
   Backbone,
   Animations,
   Keyboard,
   Constants,
   Debug
) {
   Debug.log('playerState loaded');
   if (typeof Mduel == 'undefined') {
      var Mduel = {};
   }
   if (typeof Mduel.PlayerState == 'undefined') {
      Mduel.PlayerState = {};
   }

   Mduel.Animations = Animations;
   Mduel.Keyboard = Keyboard;
   Mduel.Constants = Constants;

   Mduel.PlayerState.PlayerState = Backbone.Model.extend({
      initialize: function() {
         if(!this.get('player')) { 
            throw 'no player!'; 
         }
         this.on('change:state', this.onStateChange, this);
         this.onStateChange();
      },

      set: function() {
         var args = _.toArray(arguments);
         if(typeof args[0] === 'object') {
            args[1] = _.extend(args[2] || {}, { silent: true });
         } else if(typeof args[0] === 'string') {
            args[2] = _.extend(args[2] || {}, { silent: true });
         } else {
            throw 'invalid player state set key type';
         }
         Backbone.Model.prototype.set.apply(this, arguments);
      },

      onStateChange: function() {
         var state = this.get('state');
         Debug.log('setState', state);
         if (this.get('states')[state]) {
            this.set('currentState', this.get('states')[state]);
            this.set('currentAnimation', Mduel.Animations[this.get('currentState').animation]());
         }
      },
      
      knock: function () {
         var forward = (!this.get('player').get('flip') && this.get('player').getVelocityX() > 0) ||
            (this.get('player').get('flip') && this.get('player').getVelocityX() < 0);
         this.set('state', forward ? 'knockForwardHard' : 'knockBackHard');         
      },
      
      introduceVelocityIfNecessary: function(x, vx) {
         if(vx === 0 && this.get('player').getVelocityX() === 0) {
            // we need to introduce some velocity to split these two apart
            this.get('player').setVelocityX(
               this.get('player').getPositionX() < x ? -0.5 : 0.5
            );
         }         
      },
      
      reverseVelocityIfNecessary: function(x) {
         if(this.get('player').getPositionX() < x && this.get('player').getVelocityX() > 0) {
            this.get('player').setVelocityX(-this.get('player').getVelocityX());
         }
      },
      
      updateFall: function(elapsed) {
         Debug.log('update fall');
         if (this.get('player').getVelocityY() < this.get('player').get('MAX_FALL_SPEED')) {
            var updatePercentage =  elapsed / Mduel.Constants.UPDATE_RATE;
            this.get('player').changeVelocityY(1 * updatePercentage);
         }

         if (this.get('player').getVelocityY() >= 0) {
            var platform = this.get('player').isOnPlatform();

            if (this.get('player').getPositionY() >= 320) {
               this.get('player').setVelocity(0, 0);
               this.get('player').setPositionY(320);
               this.set('state', 'disintegrate');
            } else if (platform) {
               this.get('player').setVelocityY(0);
               
               this.get('player').setPositionY(platform.y - 56);
            
               var keyState = Mduel.Keyboard.playerKeyStates[this.get('player').id];
               if (!keyState.right.pressed && !keyState.left.pressed) {
                  this.get('player').setVelocityX(0);
                  this.set('state', 'stand');
               }
               else {
                  if (keyState.right.pressed && !keyState.left.pressed) {
                     this.get('player').setVelocityX(this.get('player').get('RUN_SPEED'));
                     this.get('player').setFlip(false);
                  } 
                  if (keyState.left.pressed && !keyState.right.pressed) {
                        this.get('player').setVelocityX(-this.get('player').get('RUN_SPEED'));
                        this.get('player').setFlip(true);
                  } 
                  this.set('state', 'run');
               }
            }
         }
      },

      collide: function(state, x, y, vx, vy, lightning) {
         var l = this.get('player').get('pickup') === 'lightning';
         if(lightning && l) {
            this.get('player').unset('pickup');
         } else if(lightning) {
            this.set('state', 'disintegrate');
            this.get('player').setVelocityX(vx > 0 ? 10 : -10);
            this.get('player').setVelocityY(-25);
            return;
         } else if(l) {
            return;
         }
         if(_.any([state, this.get('state')], function(s) {
            return s === 'knockForwardHard' ||
               s === 'knockForward' ||
               s === 'knockBackHard' ||
               s === 'knockBack' ||
               s === 'vaporize' || 
               s === 'disintegrate';
         })) {
            return;
         }
         var currentState = this.get('currentState');
         if (currentState && 
            currentState.hasOwnProperty('collide') && 
            typeof currentState['collide'] === 'function'
         ) {
            currentState.collide.call(this, state, x, y, vx, vy);
         } else {
            throw state + ' collisions not supported';
         }
      },

      update: function(elapsed) {
         if (this.get('currentState') && 
            this.get('currentState').hasOwnProperty('update') && 
            typeof this.get('currentState')['update'] === 'function'
         ) {
            this.get('currentState').update.call(this, elapsed);
         }
      },
      
      defaults: {
         state: 'stand',

         states: {
            standVictory: {
               animation: 'standVictory'
            },
            ropeVictory: {
               animation: 'ropeVictory'
            },
            stand: {
               animation: 'stand',
               collide: function(state, x, y, vx, vy) {
                  Debug.log('stand collide', state, x, y, vx, vy);
                  switch(state) {
                     case 'run':
                     case 'runJump':
                        this.get('player').setVelocityX(vx);
                        this.knock();
                     break;
                     case 'roll':
                        this.get('player').setVelocityY(-10);
                        this.set('state', 'standJump');
                     break;
                     case 'standJump':
                     case 'fall':
                     case 'stand':
                     case 'rope':
                     case 'climbing':
                     case 'crouch':
                     case 'crouching':
                     case 'uncrouching':
                        this.get('player').setVelocityX(vx);
                        this.introduceVelocityIfNecessary(x, vx);
                        this.knock();
                     break;
                     default:
                        throw 'stand/' + state + ' not supported';
                     break;
                  }
               },
               update: function(elapsed) {
                  if (!this.get('player').isOnPlatform()) {
                     this.set('state', 'fall');
                  }
               },
               keyUp : function(keyState) {
                
               },
               keyDown : function(keyState) {
                  if (keyState.lastKey.name == 'left' && keyState.left.pressed && !keyState.right.pressed) {
                     this.get('player').setVelocityX(-this.get('player').get('RUN_SPEED'));
                     this.get('player').setFlip(true);
                     this.set('state', 'run');
                  } 
                  else if (keyState.lastKey.name == 'right' && keyState.right.pressed && !keyState.left.pressed) {
                     this.get('player').setVelocityX(this.get('player').get('RUN_SPEED'));
                     this.get('player').setFlip(false);
                     this.set('state', 'run');
                  }
                  else if (keyState.lastKey.name == 'down' && !keyState.right.pressed && !keyState.right.pressed) {
                     var rope = this.get('player').isOnRope();
                  
                     if (rope) {
                        this.get('player').setPositionX(rope.ropeStart.x - 32);
                     
                        this.get('player').setVelocityY(this.get('player').get('CLIMB_SPEED'));
                        this.set('state', 'climbing');
                     }
                     else {
                        this.set('state', 'crouching');
                     }
                  }
                  else if (keyState.lastKey.name == 'up' && !keyState.right.pressed && !keyState.right.pressed) {
                     var rope = this.get('player').isOnRope();
                     
                     if (rope) {
                        this.get('player').setPositionX(rope.ropeStart.x - 32);
                     
                        this.get('player').setVelocityY(-this.get('player').get('CLIMB_SPEED'));
                        this.set('state', 'climbing');
                     }
                     else {
                        this.get('player').setVelocityY(-10);
                        this.set('state', 'standJump');
                     }
                  }
               }
            },
            run: {
               animation : 'run',
               update : function(elapsed) {
                  if (!this.get('player').isOnPlatform()) {
                     this.set('state', 'fall');
                  }
               },
               collide: function(state, x, y, vx, vy) {
                  Debug.log('run collide', state, x, y, vx, vy);
                  switch(state) {
                     case 'standJump':
                     case 'runJump':
                     case 'run':
                        this.get('player').setVelocityX(vx);
                        this.knock();
                        break;
                     case 'fall':
                        this.introduceVelocityIfNecessary(x, vx);
                        this.reverseVelocityIfNecessary(x, vx);
                        this.knock()
                     break;
                     case 'stand':
                        this.get('player').setVelocityX(0);
                        this.knock();
                     break;
                     case 'crouching':
                     case 'crouch':
                     case 'uncrouching':
                     case 'roll':
                        this.get('player').setVelocityY(-10);
                        this.set('state', 'knockForwardHard');
                     break;
                     case 'rope':
                     case 'climbing':
                     break;
                     default:
                        throw 'run/' + state + ' not supported';
                     break;
                  }
               },
               keyUp : function(keyState) {
                  if (!keyState.left.pressed && !keyState.right.pressed) {
                     this.get('player').setVelocityX(0);
                     this.set('state', 'stand');
                  }
                  else if (!keyState.left.pressed && keyState.right.pressed) 
                  {
                     this.get('player').setVelocityX(this.get('player').get('RUN_SPEED'));
                     this.get('player').setFlip(false);
                  } 
                  else if (keyState.left.pressed && !keyState.right.pressed) 
                  {
                     this.get('player').setVelocityX(-this.get('player').get('RUN_SPEED'));
                     this.get('player').setFlip(true);
                  }  
               },
               keyDown : function(keyState) {
                  if (keyState.lastKey.name == 'down') {
                     if (keyState.left.pressed || keyState.right.pressed) {
                        this.set('state', 'roll');
                     } 
                     else {
                        this.set('state', 'crouch');
                     }
                  }
                  else if (keyState.lastKey.name == 'up') {
                     this.get('player').setVelocityY(-10);
                     this.set('state', 'runJump');
                  }
               }      
            },
            standJump: {
               animation : 'standJump',
               update : function() {
                  this.updateFall.apply(this, arguments);
               },
               collide: function(state, x, y, vx, vy) {
                  Debug.log('standJump collide', state, x, y, vx, vy);
                  switch(state) {
                     case 'roll':
                     case 'crouch':
                     case 'uncrouching':
                     case 'stand':
                     case 'standJump':
                     case 'fall':
                     break;
                     case 'run':
                     case 'runJump':
                        this.get('player').setVelocityX(vx);
                        this.knock();
                     break;
                     default:
                        throw 'standJump/' + state + ' not supported';
                     break;
                  }
               }
            },
            runJump: {
               animation : 'runJump',
               update : function() {
                  this.updateFall.apply(this, arguments);
               },
               collide: function(state, x, y, vx, vy) {
                  Debug.log('runJump collide', state, x, y, vx, vy);
                  switch(state) {
                     case 'stand':
                     case 'standJump':
                     case 'run':
                     case 'runJump':
                     case 'crouch':
                     case 'uncrouching':
                        this.get('player').setVelocityX(-1 * this.get('player').getVelocityX());
                        this.knock();
                     break;
                     case 'climbing':
                     case 'rope':
                     case 'fall':
                     break;
                     default:
                        throw 'runJump/' + state + ' not supported';
                     break;
                  }
               }
            },
            crouching: {
               animation : 'crouching',
               update : function(elapsed) {
                  if (this.get('currentAnimation').isFinished()) {
                     var keyState = Mduel.Keyboard.playerKeyStates[this.get('player').id];
                     if(keyState.down.pressed) {
                        this.set('state', 'crouch');
                     } else {
                        this.set('state', 'uncrouching');
                     }
                  }
               },
               collide: function(state, x, y, vx, vy) {
                  Debug.log('crouching collide', state, x, y, vx, vy);
                  switch(state) {
                     case 'standJump':
                        this.get('player').setVelocityY(-10);
                        this.set('state', 'fall');
                     break;
                     case 'stand':
                     case 'crouching':
                     case 'crouch':
                     case 'uncrouching':
                     case 'roll':
                        this.get('player').setVelocityX(vx);
                        this.introduceVelocityIfNecessary(x, vx);
                        this.knock();
                     break;
                     case 'run':
                     case 'fall':
                     break;
                     default:
                        throw 'crouching/' + state + ' not supported';
                     break;
                  }
               }
            },
            crouch: {
               animation : 'crouch',
               keyUp : function(keyState) {
                  if (!keyState.down.pressed) {
                     this.set('state', 'uncrouching');
                  }
               },
               collide: function(state, x, y, vx, vy) {
                  Debug.log('crouch collide', state, x, y, vx, vy);
                  switch(state) {
                     case 'standJump':
                        this.get('player').setVelocityY(-10);
                        this.set('state', 'standJump');
                     break;
                     case 'runJump':
                        this.get('player').setVelocityX(-1 * this.get('player').getVelocityX());
                        this.knock();
                        break;
                     case 'stand':
                     case 'crouching':
                     case 'crouch':
                     case 'uncrouching':
                     case 'roll':
                        this.get('player').setVelocityX(vx);
                        this.introduceVelocityIfNecessary(x, vx);
                        this.knock();
                     break;
                     case 'run':
                     case 'fall':
                     break;
                     default:
                        throw 'crouch/' + state + ' not supported';
                     break;
                  }
               }
            },
            roll: {
               animation : 'roll',
               update : function(elapsed) {
                  if (!this.get('player').isOnPlatform()) {
                     this.set('state', 'fall');
                  }
                  else if (this.get('currentAnimation').isFinished()) {
                     this.get('player').setVelocityX(0);
                     
                     var keyState = Mduel.Keyboard.playerKeyStates[this.get('player').id];
                     
                     if (keyState.down.pressed) {
                        this.set('state', 'crouch');
                     }
                     else {
                        this.set('state', 'uncrouching');
                     }
                  }
               },
               collide: function(state, x, y, vx, vy) {
                  Debug.log('roll collide', state, x, y, vx, vy);
                  switch(state) {
                     case 'stand':
                     case 'standJump':
                     case 'rope':
                     case 'climbing':
                     case 'fall':
                     case 'run':
                     break;
                     case 'crouching':
                     case 'crouch':
                     case 'uncrouching':
                     case 'roll':
                        this.get('player').setVelocityX(vx);
                        this.introduceVelocityIfNecessary(x, vx);
                        this.knock();
                     break;
                     default:
                        throw 'roll/' + state + ' not supported';
                     break;
                  }
               }
            },
            knockForward: {
               animation : 'knockForward',
               update : function(elapsed) {
                  if (!this.get('player').isOnPlatform()) {
                     this.set('state', 'fall');
                  } else if (this.get('currentAnimation').isFinished()) {
                     var keyState = Mduel.Keyboard.playerKeyStates[this.get('player').id];
                  
                     if (keyState.left.pressed && (!keyState.right.pressed || keyState.left.eventTime > keyState.right.eventTime)) {
                        this.get('player').setFlip(true);
                        this.get('player').setVelocityX(-this.get('player').get('RUN_SPEED'));
                        this.set('state', 'run');
                     }
                     else if (keyState.right.pressed && (!keyState.left.pressed || keyState.right.eventTime > keyState.left.eventTime)) {
                        this.get('player').setFlip(false);
                        this.get('player').setVelocityX(this.get('player').get('RUN_SPEED'));
                        this.set('state', 'run');
                     }
                     else {
                        this.get('player').setVelocityX(0);
                        this.set('state', 'stand');
                     }
                  }
               }
            },
            knockForwardHard: {
               animation : 'knockForwardHard',
               update : function() {
                  this.get('states').knockForward.update.apply(this, arguments);
               }
            },
            knockBack: {
               animation : 'knockBack',
               update : function(elapsed) {
                  if (!this.get('player').isOnPlatform()) {
                     this.set('state', 'fall');
                  } else if (this.get('currentAnimation').isFinished()) {
                     var keyState = Mduel.Keyboard.playerKeyStates[this.get('player').id];
                  
                     if (keyState.left.pressed && (!keyState.right.pressed || keyState.left.eventTime > keyState.right.eventTime)) {
                        this.get('player').setFlip(true);
                        this.get('player').setVelocityX(-this.get('player').get('RUN_SPEED'));
                        this.set('state', 'run');
                     }
                     else if (keyState.right.pressed && (!keyState.left.pressed || keyState.right.eventTime > keyState.left.eventTime)) {
                        this.get('player').setFlip(false);
                        this.get('player').setVelocityX(this.get('player').get('RUN_SPEED'));
                        this.set('state', 'run');
                     }
                     else {
                        this.get('player').setVelocityX(0);
                        this.set('state', 'stand');
                     }
                  }
               }
            },
            knockBackHard: {
               animation: 'knockBackHard',
               update: function() {
                  this.get('states').knockBack.update.apply(this, arguments);
               }
            },
            uncrouching: {
               animation : 'uncrouching',
               update : function(elapsed) {
                  if (this.get('currentAnimation').isFinished()) {
                     var keyState = Mduel.Keyboard.playerKeyStates[this.get('player').id];
                  
                     if (keyState.left.pressed && (!keyState.right.pressed || keyState.left.eventTime > keyState.right.eventTime)) {
                        this.get('player').setFlip(true);
                        this.get('player').setVelocityX(-this.get('player').get('RUN_SPEED'));
                        this.set('state', 'run');
                     }
                     else if (keyState.right.pressed && (!keyState.left.pressed || keyState.right.eventTime > keyState.left.eventTime)) {
                        this.get('player').setFlip(false);
                        this.get('player').setVelocityX(this.get('player').get('RUN_SPEED'));
                        this.set('state', 'run');
                     }
                     else {
                        this.get('player').setVelocityX(0);
                        this.set('state', 'stand');
                     }
                  }
               },
               collide: function(state, x, y, vx, vy) {
                  Debug.log('uncrouching collide', state, x, y, vx, vy);
                  switch(state) {
                     case 'standJump':
                        this.get('player').setVelocityX(vx);
                        this.introduceVelocityIfNecessary(x, vx);
                        this.knock();
                     break;
                     case 'stand':
                     case 'crouching':
                     case 'crouch':
                     case 'uncrouching':
                     case 'roll':
                        this.get('player').setVelocityX(vx);
                        this.introduceVelocityIfNecessary(x, vx);
                        this.knock();
                     break;
                     case 'run':
                     case 'fall':
                     break;
                     default:
                        throw 'uncrouching/' + state + ' not supported';
                     break;
                  }
               }
            },
            climbing: {
               animation : 'climbing',
               update : function(elapsed) {
                  var rope = this.get('player').isOnRope();
                  if(!rope) {
                     this.get('player').changePositionY(-this.get('player').getVelocityY());
                  }
               },
               collide: function(state, x, y, vx, vy) {
                  Debug.log('climbing collide', state, x, y, vx, vy);

                  this.get('player').setVelocityX(vx);
                  this.introduceVelocityIfNecessary(x, vx);
                  this.get('player').changeVelocityY(vy);
                  this.knock();
                  this.set('state', 'fall');
               },
               keyUp : function(keyState) {
                  if (!keyState.up.pressed && !keyState.down.pressed) {
                     this.get('player').setVelocityY(0);
                     this.set('state', 'rope');
                  }
               },
               keyDown : function(keyState) {
                  if (keyState.lastKey.name == 'left') {
                     this.get('player').setVelocityX(-this.get('player').get('RUN_SPEED'));
                     this.set('state', 'fall');
                  }
                  else if (keyState.lastKey.name == 'right') {
                     this.get('player').setVelocityX(this.get('player').get('RUN_SPEED'));
                     this.set('state', 'fall');
                  }
               }
            },
            rope: {
               animation : 'rope',
               collide: function(state, x, y, vx, vy) {
                  Debug.log('rope collide', state, x, y, vx, vy);

                  this.get('player').setVelocityX(vx);
                  this.introduceVelocityIfNecessary(x, vx);
                  this.get('player').changeVelocityY(vy);
                  this.knock();
                  this.set('state', 'fall');
               },
               keyUp : function(keyState) {
               },
               keyDown : function(keyState) {
                  if (keyState.lastKey.name == 'up') {
                     this.get('player').setVelocityY(-this.get('player').get('CLIMB_SPEED'));
                     this.set('state', 'climbing');            
                  }
                  else if (keyState.lastKey.name == 'down') {
                     this.get('player').setVelocityY(this.get('player').get('CLIMB_SPEED'));
                     this.set('state', 'climbing');
                  }
                  else if (keyState.lastKey.name == 'left') {
                     this.get('player').setVelocityX(-this.get('player').get('RUN_SPEED'));               
                     this.set('state', 'fall');
                  }
                  else if (keyState.lastKey.name == 'right') {
                     this.get('player').setVelocityX(this.get('player').get('RUN_SPEED'));               
                     this.set('state', 'fall');
                  }
               }
            },
            ropeFall: {
               animation : 'stand',
               update : function() {
                  this.updateFall.apply(this, arguments);
               },
               collide: function(state, x, y, vx, vy) {
                  Debug.log('ropeFall collide', state, x, y, vx, vy);
                  switch(state) {
                     default:
                        throw 'stand/' + state + ' not supported';
                     break;
                  }
               }
            },
            fall: {
               animation : 'standFall',
               update : function() {
                  this.updateFall.apply(this, arguments);
               },
               collide: function(state, x, y, vx, vy) {
                  Debug.log('fall collide', state, x, y, vx, vy);
                  switch(state) {
                     case 'fall':
                     case 'runJump':
                     case 'standFall':
                     case 'standJump':
                     break;
                     case 'rope':
                     case 'climbing':
                     case 'stand':
                     case 'run':
                     case 'roll':
                        this.get('player').setVelocityX(vx);
                        this.introduceVelocityIfNecessary(x, vx);
                        this.knock();
                     break;
                     case 'crouch':
                     case 'crouching':
                     case 'uncrouching':
                     break;
                     default:
                        throw 'standFall/' + state + ' not supported';
                     break;
                  }
               }
            },
            disintegrate: {
               animation: 'disintegrate',
               update : function(elapsed) {
                  if (this.get('currentAnimation').isFinished()) {
                     this.set('state', 'dead');
                     this.get('player').collection.remove(this.get('player'));
                  }
               },
            },
            vaporize: {
               animation: 'vaporize',
               update : function(elapsed) {
                  if(this.get('currentAnimation').isFinished()) {
                     this.set('state', 'dead');
                     this.get('player').collection.remove(this.get('player'));
                  }
               }
            },
            dead: {
               animation : 'empty'
            }
         }
      }
   });

   return Mduel.PlayerState;
};

if(typeof define !== 'undefined') {
   define([
      'mduel/animations',
      'mduel/keyboard',
      'mduel/constants',
      'mduel/debug'
   ], _.partial(definePlayerState, _, Backbone));   
} else if(typeof module !== 'undefined.') {
   module.exports = definePlayerState(
      require('underscore'),
      require('backbone'),
      require('./animations'), 
      require('./keyboard'),
      require('./constants'),
      require('./debug')
   );
}
