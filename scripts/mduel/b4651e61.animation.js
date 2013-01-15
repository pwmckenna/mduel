var defineAnimation = function(Sprites) {
   console.log('animation loaded');
   if (typeof Mduel == 'undefined') {
      var Mduel = {};
   }
   if (typeof Mduel.Animation == 'undefined') {
      Mduel.Animation = {};
   }

   Mduel.Sprites = Sprites;

   Mduel.Animation.animation = function(spec) {
      var that = {};      
           
      that.frames = spec.frames;
      that.sprites = spec.data;
      
      that.loop = spec.loop;
      that.finished = false;
      
      that.frameDuration = spec.frames[0].time;   
      that.frameIndex = spec.startFrame || 0;
      
      that.animate = function(deltaTime) {
         that.frameDuration -= deltaTime;
               
         if (that.frameDuration <= 0 && !that.finished) {
            that.frameIndex++;
           
            if (that.frameIndex == that.frames.length) {
               if (that.loop) {            
                  that.frameIndex = 0;
               } else {
                  that.finished = true;
                  that.frameIndex = that.frames.length - 1;
               }
            }
       
            that.frameDuration = that.frames[that.frameIndex].time;
         }
      }
      
      that.isFinished = function() {
         return that.finished;
      }
      
      // Return the sprite for the current frame
      that.getSprite = function() {
         return that.sprites.getOffset(that.frames[that.frameIndex].sprite);
      }
      
      return that;
   }

   return Mduel.Animation;
}

if(typeof define !== 'undefined') {
   define(['mduel/sprites'], defineAnimation);   
} else if(typeof module !== 'undefined') {
   module.exports = defineAnimation(
      require('./sprites')
   );
}
