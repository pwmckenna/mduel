var defineKeyboard = function() {
   console.log('keyboard loaded');
   if (typeof Mduel == 'undefined') {
      var Mduel = {};
   }
   if (typeof Mduel.Keyboard == 'undefined') {
      Mduel.Keyboard = {};
   }

   Mduel.Keyboard.keyDown = function(e) {
      Mduel.Game = require('mduel/game');
      var keyName = Mduel.Keyboard.getKeyName(e.keyCode);
      if (keyName) {
      
         if (Mduel.Game.state == 'game') { 
            for (var i = 0, len = Mduel.Keyboard.playerKeys.length; i < len; i++) {
               if (Mduel.Keyboard.playerKeys[i][keyName]) {
                  var mapping = Mduel.Keyboard.playerKeys[i][keyName];
               
                  var eventTime = new Date().valueOf();
           
                  Mduel.Keyboard.playerKeyStates[i][mapping].pressed = true;
                  Mduel.Keyboard.playerKeyStates[i][mapping].eventTime = eventTime;
                  Mduel.Keyboard.playerKeyStates[i].lastKey.name = mapping;
                  Mduel.Keyboard.playerKeyStates[i].lastKey.pressed = true;
                  Mduel.Keyboard.playerKeyStates[i].lastKey.eventTime = eventTime;
                  
                  Mduel.Game.localPlayers.each(function(player) {
                     if(player.get('id') === i) {
                        player.keyDown(Mduel.Keyboard.playerKeyStates[i]);
                     }
                  });
               }
            }
         }
      }
   }

   Mduel.Keyboard.keyUp = function(e) {
      Mduel.Game = require('mduel/game');
      var keyName = Mduel.Keyboard.getKeyName(e.keyCode);
      if (keyName) {
      
         if (Mduel.Game.state == 'game') {   
            for (var i = 0, len = Mduel.Keyboard.playerKeys.length; i < len; i++) {
               if (Mduel.Keyboard.playerKeys[i][keyName]) {
                  var mapping = Mduel.Keyboard.playerKeys[i][keyName];
               
                  var eventTime = new Date().valueOf();
            
                  Mduel.Keyboard.playerKeyStates[i][mapping].pressed = false;
                  Mduel.Keyboard.playerKeyStates[i][mapping].eventTime = eventTime;
                  Mduel.Keyboard.playerKeyStates[i].lastKey.name = mapping;
                  Mduel.Keyboard.playerKeyStates[i].lastKey.pressed = false;
                  Mduel.Keyboard.playerKeyStates[i].lastKey.eventTime = eventTime;
                  
                  Mduel.Game.localPlayers.each(function(player) {
                     if(player.get('id') === i) {
                        player.keyUp(Mduel.Keyboard.playerKeyStates[i]);
                     }
                  });               
               }
            }
         }
      }
   }

   Mduel.Keyboard.playerKeys = [
      {
         'left' : 'left',
         'right' : 'right',
         'up' : 'up', 
         'down' : 'down',
         'enter' : 'action'
      },
      {
         'a' : 'left',
         'd' : 'right',
         'w' : 'up', 
         's' : 'down',
         'q' : 'action'   
      }
   ];

   Mduel.Keyboard.playerKeyStates = [
      {
         'lastKey' : { name: undefined, pressed: false, eventTime: 0 },
         'up' : { pressed : false, eventTime : 0 },
         'down' : { pressed : false, eventTime : 0 },
         'left' : { pressed : false, eventTime : 0 },
         'right' : { pressed : false, eventTime : 0 },
         'action' : { pressed : false, eventTime : 0 }
      },
      {
         'lastKey' : { name: undefined, pressed: false, eventTime: 0 },
         'up' : { pressed : false, eventTime : 0 },
         'down' : { pressed : false, eventTime : 0 },
         'left' : { pressed : false, eventTime : 0 },
         'right' : { pressed : false, eventTime : 0 },
         'action' : { pressed : false, eventTime : 0 }
      }   
   ];

   Mduel.Keyboard.keyNames = {
         '37' : 'left',
         '38' : 'up',
         '39' : 'right',
         '40' : 'down',
         '65' : 'a',
         '83' : 's',
         '68' : 'd',
         '87' : 'w',
         '13' : 'enter',
         '73' : 'i',
         '74' : 'j',
         '75' : 'k',
         '76' : 'l',
         '85' : 'u',
         '81' : 'q'
   };

   Mduel.Keyboard.getKeyName = function(keyCode) {
      var rval = null;
     
      if (Mduel.Keyboard.keyNames['' + keyCode]) {
         rval = Mduel.Keyboard.keyNames['' + keyCode];
      }
      
      return rval;
   }

   return Mduel.Keyboard;
};

if(typeof define !== 'undefined') {
   define([], defineKeyboard);
} else if(typeof module !== 'undefined') {
   module.exports = defineKeyboard();
}
