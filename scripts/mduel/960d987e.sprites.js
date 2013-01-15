var defineSprites = function(Spritesheet) {
   console.log('sprites loaded');
   if (typeof Mduel == 'undefined') {
      var Mduel = {};
   }
   if (typeof Mduel.Sprites == 'undefined') {
      Mduel.Sprites = {};
   }

   Mduel.Spritesheet = Spritesheet;

   Mduel.Sprites.player = Mduel.Spritesheet.spritesheet({
      width: 64,
      height: 64,
      sprites: {
         'stand': { x:0, y: 0 },
         'run_1': { x: 0, y: 1 },
         'run_2': { x: 0, y: 2 },
         'run_3': { x: 0, y: 3 },
         'run_4': { x: 0, y: 4 },
         'crouched': { x: 0, y: 5 },
         'crouching': { x: 0, y: 6 },
         'roll_1': { x: 0, y: 7 },
         'roll_2': { x: 0, y: 8 },
         'roll_3': { x: 0, y: 9 },
         'roll_4': { x: 0, y: 10 },
         'jump_1': { x: 0, y: 11 },
         'jump_2': { x: 0, y: 12 },
         'jump_3': { x: 0, y: 13 },
         'jump_4': { x: 0, y: 14 },
         'jump_5': { x: 0, y: 15 },
         'jump_6': { x: 0, y: 16 },
         'jump_7': { x: 0, y: 17 },
         'run_jump_1': { x: 0, y: 18 },
         'run_jump_2': { x: 0, y: 19 },
         'run_jump_3': { x: 0, y: 20 },
         'stand_fall': { x: 0, y: 21 },
         'roll_back_1': { x: 0, y: 22 },
         'roll_back_2': { x: 0, y: 23 },
         'roll_back_3': { x: 0, y: 24 },
         'roll_back_4': { x: 0, y: 25 },
         'knock_forward_1': { x: 0, y: 26 },
         'knock_forward_2': { x: 0, y: 27 },
         'knock_back_1': { x: 0, y: 28 },
         'knock_back_2': { x: 0, y: 29 },
         'gun_shoot_1': { x: 0, y: 30 },
         'gun_shoot_2': { x: 0, y: 31 },
         'grenade_toss_1': { x: 0, y: 32 },
         'grenade_toss_2': { x: 0, y: 33 },
         'puck_toss_1': { x: 0, y: 34 },
         'puck_toss_2': { x: 0, y: 35 },
         'parachute': { x: 0, y: 36 },
         'unknown_27': { x: 0, y: 37 },
         'unknown_28': { x: 0, y: 38 },
         'climb_1': { x: 0, y: 39 },
         'climb_2': { x: 0, y: 40 },
         'climb_3': { x: 0, y: 41 },
         'climb_4': { x: 0, y: 42 },
         'climb_5': { x: 0, y: 43 },
         'stand_victory_1': { x: 0, y: 44 },
         'stand_victory_2': { x: 0, y: 45 },
         'rope_victory_1': { x: 0, y: 46 },
         'rope_victory_2': { x: 0, y: 47 },
         'disintegrate_1': { x: 0, y: 48 },
         'disintegrate_2': { x: 0, y: 49 },
         'disintegrate_3': { x: 0, y: 50 },
         'disintegrate_4': { x: 0, y: 51 },
         'disintegrate_5': { x: 0, y: 52 },
         'disintegrate_6': { x: 0, y: 53 },
         'vaporize_1': { x: 0, y: 54 },
         'vaporize_2': { x: 0, y: 55 },
         'vaporize_3': { x: 0, y: 56 },
         'vaporize_4': { x: 0, y: 57 },
         'taunt_1': { x: 0, y: 58 },
         'taunt_2': { x: 0, y: 59 },
         'taunt_3': { x: 0, y: 60 },
         'taunt_4': { x: 0, y: 61 },
         'flex_1': { x: 0, y: 62 },
         'flex_2': { x: 0, y: 63 },
         'magnet_1': { x: 0, y: 64 },
         'magnet_2': { x: 0, y: 65 },
         'empty': { x: 0, y: 66 },
         'trapped': { x: 0, y: 67 }
      }
   });

   Mduel.Sprites.pit = Mduel.Spritesheet.spritesheet({
      width: 32,
      height: 32,
      sprites: {
         'pit0': { x: 0, y: 0 },
         'pit1': { x: 0, y: 1 },
         'pit2': { x: 0, y: 2 },
         'pit3': { x: 0, y: 3 }
      }
   });

   Mduel.Sprites.pickups = Mduel.Spritesheet.spritesheet({
      width: 32,
      height: 32,
      sprites: {
         'bubble1': { x: 0, y: 0 },
         'bubble2': { x: 0, y: 1 },
         'bubble3': { x: 0, y: 2 },
         'skull': { x: 0, y: 3 },
         'lightning': { x: 0, y: 4 },
         'invisibility': { x: 0, y: 5 },
         'mine': { x: 0, y: 6 },
         'gun': { x: 0, y: 7 },
         'explode': { x: 0, y: 8 },
         'boot': { x: 0, y: 9 },
         'grenade': { x: 0, y: 10 },
         'puck': { x: 0, y: 11 },
         'parachute': { x: 0, y: 12 },
         'unknown_1': { x: 0, y: 13 },
         'unknown_2': { x: 0, y: 14 },
         'magnet': { x: 0, y: 15 },
         'unknown_3': { x: 0, y: 16 },
         'shield': { x: 0, y: 17 },
         'drop': { x: 0, y: 18 },
         'unknown_4': { x: 0, y: 19 },
         'corner_tl': { x: 0, y: 20 },
         'corner_tr': { x: 0, y: 21 },
         'corner_br': { x: 0, y: 22 },
         'puck_1': { x: 0, y: 23 },
         'puck_2': { x: 0, y: 24 },
         'grenade_1': { x: 0, y: 25 },
         'grenade_2': { x: 0, y: 26 },
         'bigdrop': { x: 0, y: 27 }
      }
   });

   return Mduel.Sprites;
};

if(typeof define !== 'undefined') {
   define(['mduel/spritesheet'], defineSprites);   
} else if(typeof module !== 'undefined') {
   module.exports = defineSprites(
      require('./spritesheet')
   );
}
