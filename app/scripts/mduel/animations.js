var defineAnimations = function (Sprites, Animation, Debug) {
    'use strict';
    Debug.log('animations loaded');
    var Animations = {};
    Animations.pit = function (startFrame) {
        return Animation.animation({
            frames: [
                { sprite: 'pit0', time: 2500 },
                { sprite: 'pit1', time: 2500 },
                { sprite: 'pit2', time: 2500 },
                { sprite: 'pit3', time: 2500 }
            ],
            data: Sprites.pit,
            loop: true,
            startFrame: startFrame
        });
    };

    Animations.bubble = function () {
        return Animation.animation({
            frames: [
                { sprite: 'bubble1', time: 250 },
                { sprite: 'bubble2', time: 250 },
                { sprite: 'bubble3', time: 250 }
            ],
            data: Sprites.pickups,
            loop: true
        });
    };

    Animations.skull = function () {
        return Animation.animation({
            frames: [
                { sprite: 'skull', time: 10000000 }
            ],
            data: Sprites.pickups
        });
    };

    Animations.lightning = function () {
        return Animation.animation({
            frames: [
                { sprite: 'lightning', time: 10000000 }
            ],
            data: Sprites.pickups
        });
    };

    Animations.invisibility = function () {
        return Animation.animation({
            frames: [
                { sprite: 'invisibility', time: 10000000 }
            ],
            data: Sprites.pickups
        });
    };

    Animations.mine = function () {
        return Animation.animation({
            frames: [
                { sprite: 'mine', time: 10000000 }
            ],
            data: Sprites.pickups
        });
    };

    Animations.gun = function () {
        return Animation.animation({
            frames: [
                { sprite: 'gun', time: 10000000 }
            ],
            data: Sprites.pickups
        });
    };

    Animations.explode = function () {
        return Animation.animation({
            frames: [
                { sprite: 'explode', time: 10000000 }
            ],
            data: Sprites.pickups
        });
    };

    Animations.knockForward = function () {
        return Animation.animation({
            frames: [
                { sprite: 'knock_forward_1', time: 75 },
                { sprite: 'knock_forward_2', time: 75 }
            ],
            data: Sprites.player
        });
    };

    Animations.knockForwardHard = function () {
        return Animation.animation({
            frames: [
                { sprite: 'knock_forward_1', time: 75 },
                { sprite: 'knock_forward_2', time: 75 },
                { sprite: 'roll_1', time: 15 },
                { sprite: 'roll_2', time: 75 },
                { sprite: 'roll_3', time: 75 },
                { sprite: 'roll_4', time: 75 }
            ],
            data: Sprites.player
        });
    };

    Animations.knockBack = function () {
        return Animation.animation({
            frames: [
                { sprite: 'knock_back_1', time: 75 },
                { sprite: 'knock_back_2', time: 75 }
            ],
            data: Sprites.player
        });
    };

    Animations.knockBackHard = function () {
        return Animation.animation({
            frames: [
                { sprite: 'knock_back_1', time: 75 },
                { sprite: 'knock_back_2', time: 75 },
                { sprite: 'roll_4', time: 75 },
                { sprite: 'roll_3', time: 75 },
                { sprite: 'roll_2', time: 75 },
                { sprite: 'roll_1', time: 15 }
            ],
            data: Sprites.player
        });
    };

    Animations.disintegrate = function () {
        return Animation.animation({
            frames: [
                { sprite: 'disintegrate_1', time: 75 },
                { sprite: 'disintegrate_2', time: 75 },
                { sprite: 'disintegrate_3', time: 75 },
                { sprite: 'disintegrate_4', time: 75 },
                { sprite: 'disintegrate_5', time: 75 },
                { sprite: 'disintegrate_6', time: 75 }
            ],
            data: Sprites.player
        });
    };

    Animations.vaporize = function () {
        return Animation.animation({
            frames: [
                { sprite: 'vaporize_1', time: 75 },
                { sprite: 'vaporize_2', time: 75 },
                { sprite: 'vaporize_3', time: 75 },
                { sprite: 'vaporize_4', time: 75 }
            ],
            data: Sprites.player
        });
    };

    Animations.standVictory = function () {
        return Animation.animation({
            frames: [
                { sprite: 'stand_victory_1', time: 75 },
                { sprite: 'stand_victory_2', time: 75 }
            ],
            data: Sprites.player
        });
    };

    Animations.ropeVictory = function () {
        return Animation.animation({
            frames: [
                { sprite: 'rope_victory_1', time: 75 },
                { sprite: 'rope_victory_2', time: 75 }
            ],
            data: Sprites.player
        });
    };

    Animations.stand = function () {
        return Animation.animation({
            frames: [
                { sprite: 'stand', time: 10000000 }
            ],
            data: Sprites.player
        });
    };

    Animations.run = function () {
        return Animation.animation({
            frames: [
                { sprite: 'run_1', time: 75 },
                { sprite: 'run_2', time: 75 },
                { sprite: 'run_3', time: 75 },
                { sprite: 'run_4', time: 75 }
            ],
            loop: true,
            data: Sprites.player
        });
    };

    Animations.roll = function () {
        return Animation.animation({
            frames: [
                { sprite: 'crouching', time: 75 },
                { sprite: 'roll_1', time: 75 },
                { sprite: 'roll_2', time: 75 },
                { sprite: 'roll_3', time: 75 },
                { sprite: 'roll_4', time: 75 },
                { sprite: 'crouched', time: 1 }
            ],
            data: Sprites.player
        });
    };

    Animations.crouching = function () {
        return Animation.animation({
            frames: [
                { sprite: 'crouching', time: 75 },
                { sprite: 'crouched', time: 1 }
            ],
            data: Sprites.player
        });
    };

    Animations.crouch = function () {
        return Animation.animation({
            frames: [
                { sprite: 'crouched', time: 1 }
            ],
            data: Sprites.player
        });
    };

    Animations.uncrouching = function () {

        return Animation.animation({
            frames: [
                { sprite: 'crouched', time: 75 },
                { sprite: 'crouching', time: 1 }
            ],
            data: Sprites.player
        });
    };

    Animations.standJump = function () {
        return Animation.animation({
            frames: [
                { sprite: 'jump_2', time: 75 },
                { sprite: 'jump_3', time: 75 },
                { sprite: 'jump_4', time: 75 },
                { sprite: 'jump_5', time: 75 },
                { sprite: 'jump_6', time: 75 },
                { sprite: 'jump_7', time: 75 }
            ],
            data: Sprites.player
        });
    };

    Animations.runJump = function () {
        return Animation.animation({
            frames: [
                { sprite: 'run_jump_1', time: 150 },
                { sprite: 'run_jump_2', time: 150 },
                { sprite: 'run_jump_3', time: 150 }
            ],
            data: Sprites.player
        });
    };

    Animations.climbing = function () {
        return Animation.animation({
            frames: [
                { sprite: 'climb_1', time: 75 },
                { sprite: 'climb_2', time: 75 },
                { sprite: 'climb_3', time: 75 },
                { sprite: 'climb_4', time: 75 }
            ],
            loop: true,
            data: Sprites.player
        });
    };

    Animations.rope = function () {
        return Animation.animation({
            frames: [
                { sprite: 'climb_5', time: 1 }
            ],
            data: Sprites.player
        });
    };

    Animations.standFall = function () {
        return Animation.animation({
            frames: [
                { sprite: 'stand_fall', time: 1 }
            ],
            data: Sprites.player
        });
    };

    Animations.empty = function () {
        return Animation.animation({
            frames: [
                { sprite: 'empty', time: 1}
            ],
            data: Sprites.player
        });
    };

    return Animations;
};

if (typeof define !== 'undefined') {
    define([
        'mduel/sprites',
        'mduel/animation',
        'mduel/debug'
    ], defineAnimations);
} else if (typeof module !== 'undefined') {
    module.exports = defineAnimations(
        require('./sprites'),
        require('./animation'),
        require('./debug')
    );
}
