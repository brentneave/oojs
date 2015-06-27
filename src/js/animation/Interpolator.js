var Interpolator =
{
	interpolate : function(start, end, numSteps, step, easingFunction) {
		if(easingFunction == undefined) easingFunction  = Easing.none;

		var t = step, // time, or current step
			b = start, // start value
			c = end - start, // total change in value
			d = numSteps + 1; // duration, or number of steps

		return easingFunction(t, b, c, d);
	},

	blend : function(start, end, numSteps, easingFunction) {
		if(easingFunction == undefined) easingFunction  = Easing.none;

		numSteps = Math.abs(numSteps);

		var i = 0;
			n = numSteps + 1, // duration, or number of steps
			steps = [];

		while(i<=n) {
			steps.push (
				Interpolator.interpolate(start, end, numSteps, i, easingFunction)
			);
			i++;
		}

		return steps;
	}
}