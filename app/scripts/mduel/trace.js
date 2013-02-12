define([], function() {
	var trace = false;
	if(typeof console !== 'undefined' && console.hasOwnProperty('time')) {
		trace = true;
	}
	return {
		start: function(title) {
			trace && console.time(title);
			return {
				stop: function() {
					trace && console.timeEnd(title);
				}
			}
		}
	};
});