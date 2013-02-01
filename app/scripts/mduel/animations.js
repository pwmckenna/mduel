var defineAnimations = function(Sprites, Animation) {
   console.log('animations loaded');
   if (typeof Mduel == 'undefined') {
      var Mduel = {};
   }
   if (typeof Mduel.Animations == 'undefined') {
      Mduel.Animations = {};
   }

   Mduel.Sprites = Sprites;
   Mduel.Animation = Animation;

   Mduel.Animations.pit = function(startFrame) {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'pit0', time: 2500 },
            { sprite: 'pit1', time: 2500 },
            { sprite: 'pit2', time: 2500 },
            { sprite: 'pit3', time: 2500 }
         ], 
         data: Mduel.Sprites.pit,
         loop: true,
         startFrame: startFrame
      });
   }

   Mduel.Animations.bubble = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'bubble1', time: 250 },
            { sprite: 'bubble2', time: 250 },
            { sprite: 'bubble3', time: 250 }
         ],
         data: Mduel.Sprites.pickups,
         loop: true
      })
   }

   Mduel.Animations.skull = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'skull', time: 10000000 }
         ],
         data: Mduel.Sprites.pickups
      })
   }

   Mduel.Animations.lightning = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'lightning', time: 10000000 }
         ],
         data: Mduel.Sprites.pickups
      })
   }

   Mduel.Animations.invisibility = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'invisibility', time: 10000000 }
         ],
         data: Mduel.Sprites.pickups
      })
   }

   Mduel.Animations.mine = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'mine', time: 10000000 }
         ],
         data: Mduel.Sprites.pickups
      })
   }

   Mduel.Animations.gun = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'gun', time: 10000000 }
         ],
         data: Mduel.Sprites.pickups
      })
   }

   Mduel.Animations.explode = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'explode', time: 10000000 }
         ],
         data: Mduel.Sprites.pickups
      })
   }

   Mduel.Animations.knockForward = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'knock_forward_1', time: 75 },
            { sprite: 'knock_forward_2', time: 75 }
         ],
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.knockForwardHard = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'knock_forward_1', time: 75 },
            { sprite: 'knock_forward_2', time: 75 },
            { sprite: 'roll_1', time: 15 },
            { sprite: 'roll_2', time: 75 },
            { sprite: 'roll_3', time: 75 },
            { sprite: 'roll_4', time: 75 }
         ],
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.knockBack = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'knock_back_1', time: 75 },
            { sprite: 'knock_back_2', time: 75 }
         ],
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.knockBackHard = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'knock_back_1', time: 75 },
            { sprite: 'knock_back_2', time: 75 },
            { sprite: 'roll_4', time: 75 },
            { sprite: 'roll_3', time: 75 },
            { sprite: 'roll_2', time: 75 },
            { sprite: 'roll_1', time: 15 }
         ],
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.disintegrate = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'disintegrate_1', time: 75 },
            { sprite: 'disintegrate_2', time: 75 },
            { sprite: 'disintegrate_3', time: 75 },
            { sprite: 'disintegrate_4', time: 75 },
            { sprite: 'disintegrate_5', time: 75 },
            { sprite: 'disintegrate_6', time: 75 }
         ],
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.vaporize = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'vaporize_1', time: 75 },
            { sprite: 'vaporize_2', time: 75 },
            { sprite: 'vaporize_3', time: 75 },
            { sprite: 'vaporize_4', time: 75 }
         ],
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.standVictory = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'stand_victory_1', time: 75 },
            { sprite: 'stand_victory_2', time: 75 }
         ],
         data: Mduel.Sprites.player
      })
   }

   Mduel.Animations.ropeVictory = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'rope_victory_1', time: 75 },
            { sprite: 'rope_victory_2', time: 75 }
         ],
         data: Mduel.Sprites.player
      })
   }

   Mduel.Animations.stand = function() {

      return Mduel.Animation.animation({
         frames: [
            { sprite: 'stand', time: 10000000 }
         ], 
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.run = function() {

      return Mduel.Animation.animation({
         frames: [
            { sprite: 'run_1', time: 75 },
            { sprite: 'run_2', time: 75 },
            { sprite: 'run_3', time: 75 },
            { sprite: 'run_4', time: 75 }
         ], 
         loop: true,
         data: Mduel.Sprites.player
      });
}

   Mduel.Animations.roll = function() {

      return Mduel.Animation.animation({
         frames: [
            { sprite: 'crouching', time: 75 },
            { sprite: 'roll_1', time: 75 },
            { sprite: 'roll_2', time: 75 },
            { sprite: 'roll_3', time: 75 },
            { sprite: 'roll_4', time: 75 },
            { sprite: 'crouched', time: 1 }
         ], 
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.crouching = function() {

      return Mduel.Animation.animation({
         frames: [
            { sprite: 'crouching', time: 75 },
            { sprite: 'crouched', time: 1 }
         ], 
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.crouch = function() {

      return Mduel.Animation.animation({
         frames: [
            { sprite: 'crouched', time: 1 }
         ], 
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.uncrouching = function() {

      return Mduel.Animation.animation({
         frames: [
            { sprite: 'crouched', time: 75 },
            { sprite: 'crouching', time: 1 }
         ], 
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.standJump = function() {

      return Mduel.Animation.animation({
         frames: [
            { sprite: 'jump_2', time: 75 },
            { sprite: 'jump_3', time: 75 },
            { sprite: 'jump_4', time: 75 },
            { sprite: 'jump_5', time: 75 },
            { sprite: 'jump_6', time: 75 },
            { sprite: 'jump_7', time: 75 }
         ], 
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.runJump = function() {

      return Mduel.Animation.animation({
         frames: [
            { sprite: 'run_jump_1', time: 150 },
            { sprite: 'run_jump_2', time: 150 },
            { sprite: 'run_jump_3', time: 150 }
         ], 
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.climbing = function() {

      return Mduel.Animation.animation({
         frames: [
            { sprite: 'climb_1', time: 75 },
            { sprite: 'climb_2', time: 75 },
            { sprite: 'climb_3', time: 75 },
            { sprite: 'climb_4', time: 75 }
         ], 
         loop: true,
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.rope = function() {

      return Mduel.Animation.animation({
         frames: [
            { sprite: 'climb_5', time: 1 }
         ], 
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.standFall = function() {

      return Mduel.Animation.animation({
         frames: [
            { sprite: 'stand_fall', time: 1 }
         ], 
         data: Mduel.Sprites.player
      });
   }

   Mduel.Animations.empty = function() {
      return Mduel.Animation.animation({
         frames: [
            { sprite: 'empty', time: 1}
         ],
         data: Mduel.Sprites.player
      })
   }

   return Mduel.Animations;
};

if(typeof define !== 'undefined') {
   define(['mduel/sprites', 'mduel/animation'], defineAnimations);
} else if(typeof module !== 'undefined') {
   module.exports = defineAnimations(
      require('./sprites'), 
      require('./animation')
   );
}
