define([], function() {
	return {
		boundingBoxes: true,
		trace: false,
		log: function() {
			if(typeof console !== 'undefined' && typeof console['log'] === 'function') {
				console.log.apply(console, arguments);
			}
		},
		warn: function() {
			if(typeof console !== 'undefined' && typeof console['warn'] === 'function') {
				console.warn.apply(console, arguments);
			}
		},
		error: function() {
			if(typeof console !== 'undefined' && typeof console['error'] === 'function') {
				console.error.apply(console, arguments);
			}
		}
	};
});