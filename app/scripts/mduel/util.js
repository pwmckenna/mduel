var defineUtil = function() {
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

   return Mduel.Util;
};

if(typeof define !== 'undefined') {
   define([], defineUtil);   
} else if(typeof module !== 'undefined') {
   module.exports = defineUtil();
}
