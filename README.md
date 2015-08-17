# oojs
Some object oriented Javascript. Just for fun and learning.

##Animation.js
An animation class with start, current and end values, a duration and an easing equation. It precalculates each frame then scrubs through them over time using requestAnimationFrame.

Animation doesn’t manipulate DOM elements directly. Listen to events from Animation and do what you like with the output — for example, move nodes on an SVG path, adjust the width of a DOM element, individually animate RGB components of a colour…

##Interpolator.js
Interpolates between two numbers. Used by Animation to precalculate frames. Use ```Interpolator.interpolate()``` to calculate a single value somewhere between two numbers, or ```Interpolator.blend``` to get a whole bunch of values. You can pass in an easing equation for non-linear interpolation.

##Easing.js
Based on [Penner’s easing equations](http://robertpenner.com/easing/). 

##Broadcaster.js
Broadcasts events. Use one Broadcaster per type of Event you want to fire. That might seem wasteful, but I find ```this.onSomethingChanged.broadcast()``` easier to debug than ```this.broadcast('onSomethingChanged')``` because you’ll get an error if you type the name of the event incorrectly.

##Event.js
An event with a source and some data. Passed as an argument to ```Broadcaster.broadcast```. For now this is just a container for arbitrary data but in future could be extended to have particular properties.

##AnimationBinding.js
A quick way to hook up an animation to any property of any object. Listens for the current frame of the Animation and changes a property on a third object based on that.
