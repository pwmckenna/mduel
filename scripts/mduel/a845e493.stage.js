var defineStage = function(
   Images,
   Animations,
   Util,
   SeedRandom
) {
   var random = SeedRandom.random;

   console.log('stage loaded');
   if (typeof Mduel == 'undefined') {
      var Mduel = {};
   }
   if (typeof Mduel.Stage == 'undefined') {
      Mduel.Stage = {};
   }

   Mduel.Images = Images;
   Mduel.Animations = Animations;
   Mduel.Util = Util;

   Mduel.Stage.stage = function(spec) {
      var that = {};
      
      var stage = Mduel.Stage.generateStage();
      
      that.platforms = stage.platforms;
      that.ropes = stage.ropes;
      
      that.pit = [
         Mduel.Animations.pit(0),
         Mduel.Animations.pit(1),
         Mduel.Animations.pit(2),
         Mduel.Animations.pit(3)
      ];
      
      that.update = function(elapsed) {
         // TODO
      }
      
      that.draw = function(ctx, elapsed, width, height) {
         // Right spawn
         ctx.save();   
         
         ctx.translate(width, (height / 2) - (Mduel.Images.platform.width / 2));
         ctx.rotate(90 * (Math.PI / 180));
         ctx.drawImage(Mduel.Images.powerup, 0, 0);
         
         ctx.restore();
         
         // Left spawn
         ctx.save();
         
         // 208 is a magic number -- need to figure out the right way to position this image
         ctx.translate(0, 208); //(height / 2) + (Mduel.Stage.platformImage.width / 2));
         ctx.rotate(270 * (Math.PI / 180));
         ctx.drawImage(Mduel.Images.powerup, 0, 0);
         
         ctx.restore();
         
         // Top spawn
         ctx.drawImage(Mduel.Images.powerup, (width / 2) - (Mduel.Images.platform.width / 2), 0);
      
         // Platforms
         for (var i = 0, len = that.platforms.length; i < len; i++) {
            var imageToDraw = that.platforms[i].isSpawn ? Mduel.Images.spawn : Mduel.Images.platform;
         
            ctx.drawImage(imageToDraw, that.platforms[i].x, that.platforms[i].y);
         }
         
         // Ropes
         for (var i = 0, len = that.ropes.length; i < len; i++) {
            var currentRope = that.ropes[i];
            ctx.drawImage(Mduel.Images.ropeAnchor, currentRope.anchor.x, currentRope.anchor.y);
            ctx.moveTo(currentRope.ropeStart.x, currentRope.ropeStart.y);
            ctx.lineTo(currentRope.ropeEnd.x, currentRope.ropeEnd.y);
         }
         
         // Rope color
         ctx.strokeStyle = '#926100';
         ctx.stroke();
         
         // Pit
         for (var i = 0, len = that.pit.length; i < len; i++) {
            that.pit[i].animate(elapsed);
         }   
         
         for (var i = 0, w = width; i < w; i += (32 * that.pit.length)) {
            for (var j = 0, len = that.pit.length; j < len; j++) {
               var frame = that.pit[j].getSprite();

               ctx.drawImage(Mduel.Images.mallow,
                  frame.x, frame.y, frame.width, frame.height,
                  i + (j * frame.width), height - (frame.height + 22),
                  frame.width, frame.height);
                  
               ctx.drawImage(Mduel.Images.mallowFiller, i + (j * 32), height - frame.height);
            }      
         }
      }
         
      return that;
   }

   Mduel.Stage.generateStage = function() {

      var levels = [
         Mduel.Stage.generateTopLevel(),         
         Mduel.Stage.generateLevel(18),
         Mduel.Stage.generateLevel(18),
         Mduel.Stage.generateLevel(18)
      ];      
        
      var rval = new Array();
      
      var verticalSpacing = 64;
      var verticalOffset = 80;
         
      // Top and Random platforms
      for (var i = 0; i < levels.length; i++) {
         var currentLevel = levels[i];
             
         for (var j = 0; j < currentLevel.length; j++) {
            if (currentLevel[j]) {
               rval.push({ x: (j * 32) + 32, y: (i * verticalSpacing) + verticalOffset, isSpawn: false });
            }
         }
      }   
      
      // Left spawn platforms
      for (var ls = 0; ls < 4; ls++) {
         rval.push({ x: (32 * ls) + 48, y: (4 * verticalSpacing) + verticalOffset, isSpawn: true });
      }   
      
      // Right spawn platforms
      for (var ls = 0; ls < 4; ls++) {
         rval.push({ x: (32 * (ls + 13)) + 48, y: (4 * verticalSpacing) + verticalOffset, isSpawn: true });
      }
      
      // Generate ropes
      var ropes = Mduel.Stage.generateRopes(levels, 18);
      
      return { platforms: rval, ropes: ropes };
   }

   Mduel.Stage.generateTopLevel = function() {
      var level = new Array();
      
      level[0] = { width: 2, isPlatform: false };
      level[1] = { width: 4, isPlatform: true };
      level[2] = { width: 6, isPlatform: false };
      level[3] = { width: 4, isPlatform: true };
      level[4] = { width: 2, isPlatform: false };
      
      return Mduel.Stage.convertLevel(level);
   }

   Mduel.Stage.generateLevel = function(width) {
      var maxPlatformWidth = 7;
      var minPlatformWidth = 2;
      var maxGapWidth = 2;
      var minGapWidth = 1;
      
      var parts = new Array();
      var isPlatform = Math.floor(random() * 2);
      
      var accum = function(l) { return l.width; }; 
      
      while (Mduel.Util.sum(parts, accum) < width) {
         var minWidth = isPlatform ? minPlatformWidth : minGapWidth;
         var maxWidth = isPlatform ? maxPlatformWidth : maxGapWidth;
         
         var newWidth = Math.floor(random() * (maxWidth + 1 - minWidth)) + minWidth;
      
         parts.push({ width: newWidth, isPlatform: isPlatform });
         
         isPlatform = !isPlatform;
         
         var tempSum = Mduel.Util.sum(parts, accum);
         if (tempSum > width) {
            parts[parts.length - 1].width -= (tempSum - width);
            parts[parts.length - 1].isPlatform = false;
         }   
      }
      
      return Mduel.Stage.convertLevel(parts);
   }

   Mduel.Stage.convertLevel = function(rawLevel) {
      var rval = new Array();
      
      for (var i = 0, len = rawLevel.length; i < len; i++) {
         for (var j = 0, currWidth = rawLevel[i].width; j < currWidth; j++) {
            rval.push(rawLevel[i].isPlatform);
         }
      }
      
      return rval;
   }

   Mduel.Stage.generateRopes = function(levels, width) {
      var anchors = new Array();
     
      // Fixed top ropes
      anchors.push({ x: 4, y: 0, ropeLength: 5 });
      anchors.push({ x: 14, y: 0, ropeLength: 5 });
      
      var leftRopes = new Array();
      var otherRopes = new Array();
      
      for (var i = 1; i < width; i++) {
         var options = new Array();
      
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
            var index = Math.floor(random() * options.length);
      
            var toAdd = options[index];
            
            if (i < 4) {
               leftRopes.push(toAdd);
            }
            else if (i > 4 && i != 14) {
               otherRopes.push(toAdd);
            }
         }
      }
      
      if (leftRopes.length > 0) {
          var index = Math.floor(random() * leftRopes.length);
          anchors.push(leftRopes[index]);
      }
      
      if (otherRopes.length > 0) {
         // Hard max of other ropes is 4
         var max = Math.min(otherRopes.length, Math.floor(random() * 3) + 1);
         var count = 0;
         while (count < max) {
            var index = Math.floor(random() * otherRopes.length);
            anchors.push(otherRopes[index]);
         
            count++;
         }   
      }
      
      var verticalOffset = 26;
      
      var rval = new Array();
      
      var verticalAdjustment = 10; //Mduel.Images.ropeAnchor.height;
      var horizontalAdjustment = 5; //Mduel.Images.ropeAnchor.width / 2;
      var spawnHeight = 8; //Mduel.Images.spawn.height;      
      // Translate level and columns to x and y coordinates, calculate start and end points of ropes
      for (var i = 0, len = anchors.length; i < len; i++) {
         var current = anchors[i];
      
         var horizontalOffset = (current.x == 4 || current.x == 14) ? 25 : 41;   
      
         current.x = (current.x * 32) + horizontalOffset;
         current.y = (current.y * 64) + verticalOffset;
         
         rval.push({ anchor : { x : current.x, y : current.y },
                     ropeStart : { x : current.x + horizontalAdjustment, y : current.y + verticalAdjustment },
                     ropeEnd : { x : current.x + horizontalAdjustment, y : current.y + (current.ropeLength * 64) - (spawnHeight + 1) } });
      }
      
      return rval;
   }

   return Mduel.Stage;
};

if(typeof define !== 'undefined') {
   define([
      'mduel/images', 
      'mduel/animations',
      'mduel/util',
      'vendor/seedrandom'
   ], defineStage);
} else if(typeof module !== 'undefined') {
   module.exports = defineStage(
      require('./images'),
      require('./animations'),
      require('./util'),
      require('../vendor/seedrandom')
   );
}