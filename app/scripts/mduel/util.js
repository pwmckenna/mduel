var defineUtil = function(_) {
   console.log('util loaded');
   if (typeof Mduel == 'undefined') {
      var Mduel = {};
   }
   if (typeof Mduel.Util == 'undefined') {
      Mduel.Util = {};
   }

   Mduel.Util.sum = function(arr, accum) {
      var sum = 0;
      
      for (var i = 0, len = arr.length; i < len; i++) {
         sum += accum(arr[i]);
      }   
      
      return sum;
   };

   Mduel.Util.where = function(arr, pred) {
      var rval = new Array();

      for (var i = 0, len = arr.length; i < len; i++) {
         if (pred(arr[i]))
         {
            rval.push(arr[i]);
         }
      }
      
      return rval;
   }

   Mduel.Util.colliding = function(box1, box2) {
      return box1.x < (box2.x + box2.width)
         && (box1.x + box1.width) > box2.x
         && box1.y < (box2.y + box2.height)
         && (box1.y + box1.height) > box2.y;
   }

   Mduel.Util.removeAt = function(arr, index) {
      arr.splice(index, 1);
      return arr;
   }

   Mduel.Util.calculateBoundingBox = _.memoize(function(image, flip, frame) {
      var x = frame.x;
      var y = frame.y;
      var width = frame.width;
      var height = frame.height;
      var left = width, 
         top = height, 
         right = 0, 
         bottom = 0;

      var canvas = document.createElement('canvas');
      canvas.height = image.height;
      canvas.width = image.width;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
      var myImageData = ctx.getImageData(0, 0, image.width, image.height); // Parameters are left, top, width and height
      for(var x = 0; x < myImageData.width; x++) {
         for(var y = 0; y < myImageData.height; y++) {
            var idx = (x + y * myImageData.width) * 4;
            if(myImageData.data[idx + 3]) {
               if(x < left) left = x;
               if(y < top) top = y;
               if(x > right) right = x;
               if(y > bottom) bottom = y;
            }
         }
      }
      if(flip) {
         return {
            x: width - left - (right - left),
            y: top,
            width: right - left,
            height: bottom - top
         };         
      } else {
         return {
            x: left,
            y: top,
            width: right - left,
            height: bottom - top
         };         
      }
   }, function(image, flip, frame) { return '' + image.src + flip + JSON.stringify(frame); });

   return Mduel.Util;
};

if(typeof define !== 'undefined') {
   define([], _.partial(defineUtil, _));   
} else if(typeof module !== 'undefined') {
   module.exports = defineUtil(require('underscore'));
}
