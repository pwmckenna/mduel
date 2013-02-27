var definePickups = function (
    _,
    Backbone,
    Animations,
    Images,
    Util,
    MovingObject,
    Debug,
    Constants
) {
    'use strict';
    Debug.log('pickups loaded');
    var Pickups = {};

    Pickups.Types = [
        'skull',
        'lightning',
        'invisibility',
        'mine',
        'gun',
        'explode'
    ];

    Pickups.Pickup = MovingObject.extend({
        initialize: function () {
            var bubble = Animations.bubble();
            var type = Pickups.Types[Math.floor(Math.random() * Pickups.Types.length)];
            this.set('type', type);
            var image = Animations[this.get('type')]();
            this.set('bubble', bubble);
            this.set('image', image);
        },

        setBoundingBox: function () {
            var image = Images.pickups;
            var frame = this.get('bubble').getSprite();
            var box = Util.calculateBoundingBox(image, false, frame);
            this.set({
                bx: this.getPositionX() + box.x,
                by: this.getPositionY() + box.y,
                bw: box.width,
                bh: box.height
            });
        },

        drawAnimation: function (ctx, elapsed, animation) {
            animation.animate(elapsed);
            var frame = animation.getSprite();
            ctx.drawImage(Images.pickups,
                // Source X and Y coordinates
                frame.x, frame.y,
                // Source Width and Height
                frame.width, frame.height,
                // Destination X and Y coordinates
                this.getPositionX(), this.getPositionY(),
                // Destination Width and Height
                frame.width, frame.height
            );
        },

        update: function (elapsed) {
            var updatePercentage =  elapsed / Constants.UPDATE_RATE;
            // Update position
            var vx = this.getVelocityX();
            var vy = this.getVelocityY();
            if (vx !== 0) {
                this.changePositionX(vx * updatePercentage);
            }
            if (vy !== 0) {
                this.changePositionY(vy * updatePercentage);
            }
            if (this.getPositionX() < 0) {
                this.setVelocityX(Math.abs(this.getVelocityX()));
            } else if (this.getPositionX() > (640 - 30)) {
                this.setVelocityX(-Math.abs(this.getVelocityX()));
            }
            if (this.getPositionY() < 0) {
                this.setVelocityY(Math.abs(this.getVelocityY()));
            } else if (this.getPositionY() > (400 - 30 - 30)) {
                this.setVelocityY(-Math.abs(this.getVelocityY()));
            }
            this.setBoundingBox();
        },

        draw: function (ctx, elapsed) {
            this.drawAnimation(ctx, elapsed, this.get('bubble'));
            this.drawAnimation(ctx, elapsed, this.get('image'));
            if (Debug.boundingBoxes) {
                var box = this.getBoundingBox();
                //draw the bounding box so we can work on collision detection
                //draw the bounding box so we can work on collision detection
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.strokeRect(box.x, box.y, box.width, box.height);
            }
        },

        killPlayer: function (player) {
            player.get('playerState').set('state', 'disintegrate');
            player.setVelocity(0, 0);
        },

        bestowAbility: function (player) {
            player.set('pickup', this.get('type'));
        },

        handleCollisions: function (elapsedTime, players, stage) {
            switch (this.get('type')) {
            case 'skull':
                players.any(function (player) {
                    if (Util.colliding(this.getBoundingBox(), player.getBoundingBox())) {
                        this.killPlayer(player);
                        this.collection.remove(this);
                        return true;
                    } else {
                        return false;
                    }
                }, this);
                break;
            case 'lightning':
            case 'invisibility':
            case 'mine':
            case 'gun':
                players.any(function (player) {
                    if (Util.colliding(this.getBoundingBox(), player.getBoundingBox())) {
                        this.bestowAbility(player);
                        this.collection.remove(this);
                        return true;
                    } else {
                        return false;
                    }
                }, this);
                break;
            case 'explode':
                var getPlatformBox = function (platform) {
                    return {
                        x: platform.x,
                        y: platform.y,
                        width: 28,
                        height: 16
                    };
                };
                var box = this.getBoundingBox();
                var collided = false;
                var i, platform, platformBox;
                for (i = stage.platforms.length - 1; i >= 0; --i) {
                    platform = stage.platforms[i];
                    platformBox = getPlatformBox(platform);
                    if (Util.colliding(box, platformBox)) {
                        collided = true;
                    }
                }
                if (collided) {
                    box.x -= box.width;
                    box.width *= 3;
                    var letPlayerFall = function (player) {
                        player.get('playerState').set('state', 'runJump');
                    };
                    var isPlayerOnPlatform = function (platform, player) {
                        return _.isEqual(player.isOnPlatform(), platform) && (
                            player.isStanding() ||
                            player.isRunning() ||
                            player.isCrouching() ||
                            player.isUncrouching() ||
                            player.isRolling()
                        );
                    };
                    for (i = stage.platforms.length - 1; i >= 0; --i) {
                        platform = stage.platforms[i];
                        platformBox = getPlatformBox(platform);
                        if (Util.colliding(box, platformBox)) {
                            var affectedPlayers = players.filter(_.partial(isPlayerOnPlatform, platform));
                            stage.platforms.splice(i, 1);
                            _.each(affectedPlayers, letPlayerFall);
                        }
                    }

                    this.collection.remove(this);
                }

                //do something with the stage
                break;
            }
        }
    });

    Pickups.Pickups = Backbone.Collection.extend({
        initialize: function () {
        },

        update: function (elapsed) {
            this.each(function (pickup) {
                pickup.update(elapsed);
            });
            _.times(3 - this.length, function () {
                if (Math.random() < 0.01) {
                    this.create();
                }
            }, this);
        },

        draw: function (ctx, elapsed) {
            this.each(function (pickup) {
                pickup.draw(ctx, elapsed);
            });
        },

        handleCollisions: function (elapsedTime, players, stage) {
            this.each(function (pickup) {
                pickup.handleCollisions(elapsedTime, players, stage);
            });
        },

        create: function () {
            var vx = Math.random() + 0.4;
            var vy = 1.8 - vx;
            vx = Math.random() < 0.5 ? vx : -vx;
            vy = Math.random() < 0.5 ? vy : -vy;

            var startingLocations = [
                { x: 20, y: 180 },
                { x: 300, y: 20 },
                { x: 590, y: 180 }
            ];
            var startingLocation = startingLocations[Math.floor(Math.random() * 3)];

            var pickup = new Pickups.Pickup({
                //x: 320 - 16,
                //y: 20,
                x: startingLocation.x,
                y: startingLocation.y,
                vx: vx,
                vy: vy
            });
            this.add(pickup);
        }
    });

    return Pickups;
};

if (typeof define !== 'undefined') {
    define([
        'underscore',
        'backbone',
        'mduel/animations',
        'mduel/images',
        'mduel/util',
        'mduel/movingObject',
        'mduel/debug',
        'mduel/constants'
    ], definePickups);
} else if (typeof module !== 'undefined') {
    module.exports = definePickups(
        require('underscore'),
        require('backbone'),
        require('../mduel/animations'),
        require('../mduel/images'),
        require('../mduel/util'),
        require('../mduel/movingObject'),
        require('../mduel/debug'),
        require('../mduel/constants')
    );
}
