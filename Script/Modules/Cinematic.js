/*
*	A module that handles camera movement
*	Not a generic module - It does very specific work.
*
*/

function Cinematic() {
	StateMachine.call(this, {
		"unitialized": {},
		"normal": {}
	});
}

Cinematic.prototype = {
	constructor: Cinematic,
	speedMultiplier: 1,
	translations: {
		ease: function(t) {
			var ts = t*t;
			var tc = tc*t;
			return ((6 * tc * ts) + (-15 * ts * ts) + (10 * tc));
		},
		bounce: function(t) {
			return FastInterpolation.any(0, 0, 0.01, -0.03, 0.99, 1.03, 1, 1).at(t)/2;
		}
	},
	update: function(elapsed) {
		
	}
}