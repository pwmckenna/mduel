var definePlayer = function (
    _,
    Images,
    PlayerState,
    Stage,
    Util,
    MovingObject,
    Debug,
    Constants,
    Trace
) {
    'use strict';
    Debug.log('player loaded');
    var Player = {};

    Player.Player = MovingObject.extend({
        defaults: _.extend({
            flip: false,
            spriteImage: Images.player1,
            id: 0,

            RUN_SPEED: 3.2,
            CLIMB_SPEED: 2.5,
            MAX_FALL_SPEED: 12
        }, MovingObject.prototype.defaults),
        initialize: function (attributes, options) {
            var trace = Trace.start('player initialize');
            this.firebase = options.firebase;
            var playerState = new PlayerState.PlayerState({
                player: this
            });
            this.set({
                defaultSpriteImage: this.get('spriteImage'),
                playerState: playerState
            });
            this.on('change:pickup', this.onPickup, this);

            this.firebase.on('value', this.onValue, this);
            this.setBoundingBox();
            trace.stop();
        },

        onValue: function (valueSnapshot) {
            var trace = Trace.start('player onValue');
            var val = valueSnapshot.val();
            if (!val) {
                return;
            }
            var updates = _.pick(val, [
                'x', 'y', 'vx', 'vy', 'bx', 'by', 'bw', 'bh', 'flip', 'pickup'
            ]);
            this.set(updates);
            trace.stop();
        },

        save: function () {
            var trace = Trace.start('player save');
            var updates = _.pick(this.attributes, [
                'x', 'y', 'vx', 'vy', 'bx', 'by', 'bw', 'bh', 'flip', 'pickup'
            ]);
            this.firebase.update(updates);

            trace.stop();
        },

        onPickup: function (pickup) {
            Debug.log('onPickup', this.get('pickup'), pickup);
            if (this.get('pickup') === 'lightning') {
                this.set('spriteImage', Images.player1000V);
            } else {
                this.set('spriteImage', this.get('defaultSpriteImage'));
            }
        },

        setBoundingBox: function () {
            var trace = Trace.start('player getBoundingBox');
            var image = this.get('spriteImage');
            var flip = this.get('flip');
            var frame = this.get('playerState').get('currentAnimation').getSprite();
            var box = Util.calculateBoundingBox(image, flip, frame);

            var bx = this.getPositionX() + box.x;
            var by = this.getPositionY() + box.y;
            var bw = box.width;
            var bh = box.height;

            if (bx !== this.get('bx')) {
                this.set('bx', bx);
            }
            if (by !== this.get('by')) {
                this.set('by', by);
            }
            if (bw !== this.get('bw')) {
                this.set('bw', bw);
            }
            if (bh !== this.get('bh')) {
                this.set('bh', bh);
            }

            trace.stop();
        },

        celebrateVictory: function () {
            if (this.isOnPlatform()) {
                this.setVelocity(0, 0);
                this.get('playerState').set('state', 'standVictory');
            } else if (this.isOnRope()) {
                this.setVelocity(0, 0);
                this.get('playerState').set('state', 'ropeVictory');
            }
        },

        draw: function (ctx, elapsed) {
            var trace = Trace.start('player draw');
            var posNew = {
                x: this.getPositionX(),
                y: this.getPositionY()
            };

            this.get('playerState').get('currentAnimation').animate(elapsed);
            var frame = this.get('playerState').get('currentAnimation').getSprite();

            if (this.get('flip')) {
                ctx.save();

                posNew.x = -posNew.x - frame.width;

                ctx.transform(-1, 0, 0, 1, 0, 0);
            }

            ctx.drawImage(this.get('spriteImage'),
                // Source X and Y coordinates
                frame.x, frame.y,
                // Source Width and Height
                frame.width, frame.height,
                // Destination X and Y coordinates
                posNew.x, posNew.y,
                // Destination Width and Height
                frame.width, frame.height
            );


            if (this.get('flip')) {
                ctx.restore();
            }

            if (Debug.boundingBoxes) {
                var box = this.getBoundingBox();
                //draw the bounding box so we can work on collision detection
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.strokeRect(box.x, box.y, box.width, box.height);
            }
            trace.stop();
        },

        update: function (elapsed) {
            var trace = Trace.start('player update');
            // Update position
            var updatePercentage =  elapsed / Constants.UPDATE_RATE;
            var vx = this.getVelocityX();
            var vy = this.getVelocityY();
            if (vx !== 0) {
                this.changePositionX(vx * updatePercentage);
            }
            if (vy !== 0) {
                this.changePositionY(vy * updatePercentage);
            }

            this.get('playerState').update(elapsed);
            this.setBoundingBox();
            this.save();
            this.get('playerState').save();
            trace.stop();
        },

        keyUp: function (keyState) {
            var playerState = this.get('playerState');
            if (playerState.get('currentState').keyUp) {
                playerState.get('currentState').keyUp.call(playerState, keyState);
            }
        },

        keyDown: function (keyState) {
            var playerState = this.get('playerState');
            if (playerState.get('currentState').keyDown) {
                playerState.get('currentState').keyDown.call(playerState, keyState);
            }
        },

        isOnPlatform: function () {
            var Game = require('mduel/game');
            var rval;

            var playerCenter = this.getPositionX() + 32;

            var predX = function (p) {
                var CLING_FACTOR = 1;
                return playerCenter >= p.x - CLING_FACTOR &&
                playerCenter <= (p.x + 32) + CLING_FACTOR;
            };

            var columnPlatforms = Util.where(Game.stage.platforms, predX);

            var playerFeet = this.getPositionY() + 56;

            var predY = function (p) {
                var diff = p.y - playerFeet;
                return diff <= 12 && diff >= -8;
            };

            var platform = Util.where(columnPlatforms, predY);

            if (platform.length > 0) {
                rval = platform[0];
            }

            return rval;
        },

        isOnRope: function () {
            var Game = require('mduel/game');
            var rval;

            var x = this.getPositionX() + 32;

            var predX = function (p) {
                return x >= (p.ropeStart.x - 4) && x <= (p.ropeStart.x + 4);
            };

            var ropes = Util.where(Game.stage.ropes, predX);

            if (ropes.length === 1 && ropes[0].ropeEnd.y >= (this.getPositionY() + 56) && ropes[0].ropeStart.y <= (this.getPositionY() + 14)) {
                rval = ropes[0];
            }

            return rval;
        },
        isStanding: function () {
            return this.get('playerState').get('state') === 'stand';
        },
        isRunning: function () {
            return this.get('playerState').get('state') === 'run';
        },
        isRolling: function () {
            return this.get('playerState').get('state') === 'roll';
        },
        isCrouching: function () {
            return this.get('playerState').get('state') === 'crouch';
        },
        isUncrouching: function () {
            return this.get('playerState').get('state') === 'uncrouching';
        },
        getFlip: function () {
            return this.get('flip');
        },
        setFlip: function (flip) {
            this.set('flip', flip);
        }
    });

    return Player;
};

if (typeof define !== 'undefined') {
    define([
        'underscore',
        'mduel/images',
        'mduel/playerState',
        'mduel/stage',
        'mduel/util',
        'mduel/movingObject',
        'mduel/debug',
        'mduel/constants',
        'mduel/trace'
    ], definePlayer);
} else if (typeof module !== 'undefined.') {
    module.exports = definePlayer(
        require('underscore'),
        require('./images'),
        require('./playerState'),
        require('./stage'),
        require('./util'),
        require('./movingObject'),
        require('./debug'),
        require('./constants'),
        require('./trace')
    );
}
