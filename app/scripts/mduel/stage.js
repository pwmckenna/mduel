var defineStage = function (
    Images,
    Animations,
    Util,
    SeedRandom,
    Debug
) {
    'use strict';
    SeedRandom.seedrandom('seed');
    var random = SeedRandom.random;

    Debug.log('stage loaded');
    var Stage = {};

    Stage.stage = function () {
        var that = {};

        var stage = Stage.generateStage();

        that.platforms = stage.platforms;
        that.ropes = stage.ropes;

        that.pit = [
            Animations.pit(0),
            Animations.pit(1),
            Animations.pit(2),
            Animations.pit(3)
        ];

        that.update = function () {
            // TODO
        };

        that.draw = function (ctx, elapsed, width, height) {
            // Right spawn
            ctx.save();

            ctx.translate(width, (height / 2) - (Images.platform.width / 2));
            ctx.rotate(90 * (Math.PI / 180));
            ctx.drawImage(Images.powerup, 0, 0);

            ctx.restore();

            // Left spawn
            ctx.save();

            // 208 is a magic number -- need to figure out the right way to position this image
            ctx.translate(0, 208); //(height / 2) + (Stage.platformImage.width / 2));
            ctx.rotate(270 * (Math.PI / 180));
            ctx.drawImage(Images.powerup, 0, 0);

            ctx.restore();

            // Top spawn
            ctx.drawImage(Images.powerup, (width / 2) - (Images.platform.width / 2), 0);

            // Platforms
            var i, len, w;
            for (i = 0, len = that.platforms.length; i < len; i++) {
                var imageToDraw = that.platforms[i].isSpawn ? Images.spawn : Images.platform;

                ctx.drawImage(imageToDraw, that.platforms[i].x, that.platforms[i].y);
            }

            // Ropes
            for (i = 0, len = that.ropes.length; i < len; i++) {
                var currentRope = that.ropes[i];
                ctx.drawImage(Images.ropeAnchor, currentRope.anchor.x, currentRope.anchor.y);
                ctx.moveTo(currentRope.ropeStart.x, currentRope.ropeStart.y);
                ctx.lineTo(currentRope.ropeEnd.x, currentRope.ropeEnd.y);
            }

            // Rope color
            ctx.strokeStyle = '#926100';
            ctx.stroke();

            // Pit
            for (i = 0, len = that.pit.length; i < len; i++) {
                that.pit[i].animate(elapsed);
            }
            for (i = 0, w = width; i < w; i += (32 * that.pit.length)) {
                var j;
                for (j = 0, len = that.pit.length; j < len; j++) {
                    var frame = that.pit[j].getSprite();

                    ctx.drawImage(Images.mallow,
                        frame.x, frame.y, frame.width, frame.height,
                        i + (j * frame.width), height - (frame.height + 22),
                        frame.width, frame.height);

                    ctx.drawImage(Images.mallowFiller, i + (j * 32), height - frame.height);
                }
            }
        };

        return that;
    };

    Stage.generateStage = function () {

        var levels = [
            Stage.generateTopLevel(),
            Stage.generateLevel(18),
            Stage.generateLevel(18),
            Stage.generateLevel(18)
        ];

        var rval = [];

        var verticalSpacing = 64;
        var verticalOffset = 80;
        var i, ls;
        // Top and Random platforms
        for (i = 0; i < levels.length; i++) {
            var currentLevel = levels[i];

            for (var j = 0; j < currentLevel.length; j++) {
                if (currentLevel[j]) {
                    rval.push({
                        x: (j * 32) + 32,
                        y: (i * verticalSpacing) + verticalOffset,
                        isSpawn: false
                    });
                }
            }
        }

        // Left spawn platforms
        for (ls = 0; ls < 4; ls++) {
            rval.push({
                x: (32 * ls) + 48,
                y: (4 * verticalSpacing) + verticalOffset,
                isSpawn: true
            });
        }

        // Right spawn platforms
        for (ls = 0; ls < 4; ls++) {
            rval.push({
                x: (32 * (ls + 13)) + 48,
                y: (4 * verticalSpacing) + verticalOffset,
                isSpawn: true
            });
        }

        // Generate ropes
        var ropes = Stage.generateRopes(levels, 18);

        return { platforms: rval, ropes: ropes };
    };

    Stage.generateTopLevel = function () {
        var level = [];

        level[0] = { width: 2, isPlatform: false };
        level[1] = { width: 4, isPlatform: true };
        level[2] = { width: 6, isPlatform: false };
        level[3] = { width: 4, isPlatform: true };
        level[4] = { width: 2, isPlatform: false };

        return Stage.convertLevel(level);
    };

    Stage.generateLevel = function (width) {
        var maxPlatformWidth = 7;
        var minPlatformWidth = 2;
        var maxGapWidth = 2;
        var minGapWidth = 1;

        var parts = [];
        var isPlatform = Math.floor(random() * 2);

        var accum = function (l) { return l.width; };

        while (Util.sum(parts, accum) < width) {
            var minWidth = isPlatform ? minPlatformWidth : minGapWidth;
            var maxWidth = isPlatform ? maxPlatformWidth : maxGapWidth;

            var newWidth = Math.floor(random() * (maxWidth + 1 - minWidth)) + minWidth;

            parts.push({ width: newWidth, isPlatform: isPlatform });

            isPlatform = !isPlatform;

            var tempSum = Util.sum(parts, accum);
            if (tempSum > width) {
                parts[parts.length - 1].width -= (tempSum - width);
                parts[parts.length - 1].isPlatform = false;
            }
        }

        return Stage.convertLevel(parts);
    };

    Stage.convertLevel = function (rawLevel) {
        var rval = [];

        for (var i = 0, len = rawLevel.length; i < len; i++) {
            for (var j = 0, currWidth = rawLevel[i].width; j < currWidth; j++) {
                rval.push(rawLevel[i].isPlatform);
            }
        }

        return rval;
    };

    Stage.generateRopes = function (levels, width) {
        var anchors = [];

        // Fixed top ropes
        anchors.push({ x: 4, y: 0, ropeLength: 5 });
        anchors.push({ x: 14, y: 0, ropeLength: 5 });

        var leftRopes = [];
        var otherRopes = [];
        var index;

        var i, len;
        for (i = 1; i < width; i++) {
            var options = [];

            if (levels[1][i] && levels[2][i]) {
                options.push({ x: i, y: 1, ropeLength: 2 });
            }
            if (levels[2][i] && levels[3][i]) {
                options.push({ x: i, y: 2, ropeLength: 2 });
            }
            if (levels[1][i] && levels[3][i]) {
                options.push({ x: i, y: 1, ropeLength: 3 });
            }

            if (options.length > 0) {
                // Only take one possibility from each column
                index = Math.floor(random() * options.length);

                var toAdd = options[index];

                if (i < 4) {
                    leftRopes.push(toAdd);
                }
                else if (i > 4 && i !== 14) {
                    otherRopes.push(toAdd);
                }
            }
        }

        if (leftRopes.length > 0) {
            index = Math.floor(random() * leftRopes.length);
            anchors.push(leftRopes[index]);
        }

        if (otherRopes.length > 0) {
            // Hard max of other ropes is 4
            var max = Math.min(otherRopes.length, Math.floor(random() * 3) + 1);
            var count = 0;
            while (count < max) {
                index = Math.floor(random() * otherRopes.length);
                anchors.push(otherRopes[index]);

                count++;
            }
        }

        var verticalOffset = 26;

        var rval = [];

        var verticalAdjustment = Images.ropeAnchor.height;
        var horizontalAdjustment = Images.ropeAnchor.width / 2;
        // Translate level and columns to x and y coordinates, calculate start and end points of ropes
        for (i = 0, len = anchors.length; i < len; i++) {
            var current = anchors[i];

            var horizontalOffset = (current.x === 4 || current.x === 14) ? 25 : 41;

            current.x = (current.x * 32) + horizontalOffset;
            current.y = (current.y * 64) + verticalOffset;

            rval.push({ anchor : { x : current.x, y : current.y },
                ropeStart : { x : current.x + horizontalAdjustment, y : current.y + verticalAdjustment },
                ropeEnd : { x : current.x + horizontalAdjustment, y : current.y + (current.ropeLength * 64) - (Images.spawn.height + 1) } });
        }

        return rval;
    };

    return Stage;
};

if (typeof define !== 'undefined') {
    define([
        'mduel/images',
        'mduel/animations',
        'mduel/util',
        'vendor/seedrandom',
        'mduel/debug'
    ], defineStage);
} else if (typeof module !== 'undefined') {
    module.exports = defineStage(
        require('./images'),
        require('./animations'),
        require('./util'),
        require('../vendor/seedrandom'),
        require('./debug')
    );
}
