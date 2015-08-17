function Animation(start, end, duration, easingFunction) {

  if(start     !== parseFloat(start))         { throw new Error(); }
  if(end       !== parseFloat(end))           { throw new Error(); }
  if(duration  !== parseFloat(duration))      { throw new Error(); }
  if(!(easingFunction instanceof Function))   { throw new Error(); }

  var that = this,
    _animationFrameID,
    _currentFrame = 0,
    _start = start,
    _end = end,
    _values,
    _duration = duration,
    _easingFunction = easingFunction,
    _frameLength = 1000/100;

  this.onEnterFrame    = new Broadcaster();
  this.onPlay          = new Broadcaster();
  this.onPlayBackwards = new Broadcaster();
  this.onPause          = new Broadcaster();
  this.onComplete       = new Broadcaster();

  var _recalculate = function() {
    var numFrames = Math.round(_duration/_frameLength);
    _values = Interpolator.blend(_start, _end, numFrames, _easingFunction);
  }

  _recalculate();

  this.currentFrame = function(n)
  {
    if(!isNaN(n))
    {
      if(n < 0) { n = 0; }
      else
      if(n > _values.length - 1) n = _values.length - 1;
      _currentFrame = n;
      this.onEnterFrame.broadcast(
        new Signal(
          this,
          {
            frame: _currentFrame,
            value: _values[_currentFrame]
          }
        )
      );

      return this;
    }
    else if(arguments.length)
    {
      throw new Error();
    }
    return _currentFrame;
  }

  this.play = function() {

    this.nextFrame(true);

    this.onPlay.broadcast(
      new Signal(
        this,
        {
          frame: _currentFrame,
          value: this.currentValue()
        }
      )
    );

    return this;
  }

  this.playBackwards = function() {

    if(_currentFrame == 0) _currentFrame = _values.length - 1;

    this.prevFrame(true);

    this.onPlayBackwards.broadcast(
      new Signal(
        this,
        {
          frame: _currentFrame,
          value: this.currentValue()
        }
      )
    );

    return this;
  }

  this.pause = function()
  {
    cancelAnimationFrame(_animationFrameID);
    this.onPause.broadcast(
      new Signal(
        this,
        {
          frame: _currentFrame,
          value: this.currentValue()
        }
      )
    );
    return this;
  }

  this.rewind = function() {
    this.currentFrame(0);
    return this;
  }

  this.fastForward = function()
  {
    this.currentFrame(_values.length - 1);
    return this;
  }

  this.nextFrame = function(repeat)
  {

  	if(repeat) {
      _animationFrameID = requestAnimationFrame(this.nextFrame.bind(this));
    }

    this.currentFrame(_currentFrame + 1);

    if(_currentFrame == _values.length - 1)
    {
      cancelAnimationFrame(_animationFrameID);
      this.onComplete.broadcast(new Signal(this, {}));
    }

    return this;
  }

  this.prevFrame = function(repeat)
  {
  	if(repeat) {
      _animationFrameID = requestAnimationFrame(this.prevFrame.bind(this));
    }

    this.currentFrame(_currentFrame - 1);

    if(_currentFrame == 0) {
      cancelAnimationFrame(_animationFrameID);
      this.onComplete.broadcast(new Signal(this, {}));
    }

    return this;
  }

  this.currentValue = function() {
    return _values[_currentFrame];
  }

  this.values = function() {
    return _values.splice();
  }

  this.startValue = function(n) {
    if(!isNaN(n)) {
      _start = n;
      _recalculate();
      return this;
    }
    else if (arguments.length) throw new Error();
    return _start;
  }

  this.endValue = function(n)  {
    if(!isNaN(n)) {
      _end = n;
      _recalculate();
      return this;
    }
    else if (arguments.length) throw new Error();
    return _end;
  }

  this.easingFunction = function(f) {
    if(arguments.length) {
      if(f instanceof Function) {
        _easingFunction = f;
        _recalculate();
        return this;
      }
      else { throw new Error(); }
    }

    return _easingFunction;
  }

  return this;
}

Animation.prototype.toString = function()
{
  return '[Animation]';
}

function AnimationBinding(animation, object, getterSetterMethod) {

  if(!(animation instanceof Animation))         throw new Error();
  if(!(object instanceof Object))               throw new Error();
  if(!(getterSetterMethod instanceof Function)) throw new Error();

  var _animation = animation,
      _object = object,
      _getterSetterMethod = getterSetterMethod;

  var _update = function() {
    _getterSetterMethod.apply(_object, [_animation.currentValue()]);
  }

  var _request = function() {
    requestAnimationFrame(_update);
  }

  this.unbind = function() {
    _animation.onEnterFrame.removeListener(this, _request);
  }

  this.bind = function() {
    _animation.onEnterFrame.addListener(this, _request);
  }

  this.bind();
}
Easing =
{
  none : function(t, b, c, d) {
      return c * t / d + b;
  },
    easeInQuad: function (t, b, c, d) {
        return c*(t/=d)*t + b;
    },
    easeOutQuad: function (t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
    },
    easeInOutQuad: function (t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
    },
    easeInCubic: function (t, b, c, d) {
            return c*(t/=d)*t*t + b;
    },
    easeOutCubic: function (t, b, c, d) {
            return c*((t=t/d-1)*t*t + 1) + b;
    },
    easeInOutCubic: function (t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
    },
    easeInQuart: function (t, b, c, d) {
            return c*(t/=d)*t*t*t + b;
    },
    easeOutQuart: function (t, b, c, d) {
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },
    easeInOutQuart: function (t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },
    easeInQuint: function (t, b, c, d) {
            return c*(t/=d)*t*t*t*t + b;
    },
    easeOutQuint: function (t, b, c, d) {
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
    },
    easeInOutQuint: function (t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
    },
    easeInSine: function (t, b, c, d) {
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    },
    easeOutSine: function (t, b, c, d) {
            return c * Math.sin(t/d * (Math.PI/2)) + b;
    },
    easeInOutSine: function (t, b, c, d) {
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    },
    easeInExpo: function (t, b, c, d) {
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
    },
    easeOutExpo: function (t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    },
    easeInOutExpo: function (t, b, c, d) {
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (t, b, c, d) {
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
    },
    easeOutCirc: function (t, b, c, d) {
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
    },
    easeInOutCirc: function (t, b, c, d) {
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
    },
    easeInElastic: function (t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },
    easeOutElastic: function (t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    },
    easeInOutElastic: function (t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },
    easeInBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
    },
    easeOutBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    easeInOutBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158; 
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },
    easeInBounce: function (t, b, c, d) {
            return c - Easing.easeOutBounce (d-t, 0, c, d) + b;
    },
    easeOutBounce: function (t, b, c, d) {
            if ((t/=d) < (1/2.75)) {
                    return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                    return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                    return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                    return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
    },
    easeInOutBounce: function (t, b, c, d) {
            if (t < d/2) return Easing.easeInBounce (t*2, 0, c, d) * .5 + b;
            return Easing.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
    }
}
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
function Broadcaster()
{
  // private vars
  var _listeners = [];

  // privileged methods

  this.addListener = function(listener, handler)
  {
    if(listener == undefined) {
      // console.log(arguments.callee.caller.toString());
      throw new Error();
    }
    else if(!(handler instanceof Function)) {
      // console.log(arguments.callee.caller.toString());
      throw new Error();
    }
    _listeners.push ({
      listener : listener,
      handler  : handler
    });
    return this;
  }

  this.removeListener = function(listener, handler)
  {
    var a = _listeners, i = _listeners.length;
    while(i--)
    {
      o = a[i];
      if(o.listener == listener && o.handler == handler)
      {
        a.splice(i,1);
      }
    }
    return this;
  }

  this.hasListener = function(listener, handler)
  {
    var i = _listeners.length;
    while(i--)
    {
      o = _listeners[i];
      if(o.listener == listener && o.handler == handler)
      {
        return true;
      }
    }
    return false;
  }

  this.listeners = function() {
    return _listeners.splice(0);
  }

  this.broadcast = function(e) {
    if(!(e instanceof Signal))
    {
      throw new Error();
    }

    var i = _listeners.length;
    var o;
    while(i--)
    {
      o = _listeners[i];
      o.handler.call(o.listener, e);
    }

    return this;
  }

  return this;
}
function Signal(source, data)
{
  var _source,
      _data;

  this.source = function(o)
  {
    if(o != undefined)
    {
      _source = o;
      return this;
    }
    else
    {
      return _source;
    }
  }

  this.data = function(o)
  {
    if(o != undefined)
    {
      _data = o;
      return this;
    }
    else
    {
      return _data;
    }
  }

  this.source(source).data(data);

  return this;
}

Signal.prototype.toString = function() {
  return '[Signal]';
}