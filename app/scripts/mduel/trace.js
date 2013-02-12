define(['mduel/debug'], function(Debug) {
	var trace = false;
	if(Debug.trace && typeof console !== 'undefined' && console.hasOwnProperty('time')) {
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