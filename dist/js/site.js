function Animation(start, end, duration, easingFunction) {

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
  this.onPause         = new Broadcaster();
  this.onComplete      = new Broadcaster();

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

  this.duration = function(n)  {
    if(!isNaN(n)) {
      _duration = n;
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


  if(start          != undefined) this.startValue(start);
  if(end            != undefined) this.endValue(end);
  if(duration       != undefined) this.duration(duration);
  if(easingFunction != undefined) this.easingFunction(easingFunction);

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
function Drag(element, options) {

  // private vars

  var that = this,
      _pointerx,
      _pointery,
      _lastpointerx,
      _lastpointery,
      _translatex = 0,
      _translatey = 0,
      _transform = new Translate3d(),
      _animationx = new Animation(),
      _animationy = new Animation(),
      _animationxBinding = new AnimationBinding(_animationx, _transform, _transform.x),
      _animationyBinding = new AnimationBinding(_animationy, _transform, _transform.y),
      _xsnap = undefined,
      _ysnap = undefined,

      // params
      _element,
      _momentum = 7,
      _momentumTimeFactor = 2,
      _easingFunction = Easing.easeOutCubic,
      _classNameWhileDragging;

  // broadcasters

  this.onSetElement = new Broadcaster();
  this.onStartDrag  = new Broadcaster();
  this.onDrag       = new Broadcaster();
  this.onEndDrag    = new Broadcaster();

  // private methods

  var _startDragAt = function(x, y) {

    _animationx.pause();
    _animationy.pause();

    _pointerx = x;
    _pointery = y;

    _translatex = _transform.x();
    _translatey = _transform.y();

    if(_classNameWhileDragging) _element.classList.add(_classNameWhileDragging);

    that.onStartDrag.broadcast(new Signal(this, { x: _pointerx, y: _pointery }));
  }

  var _dragTo = function(x, y) {

    _transform.xyz(
      _transform.x() + (x - _pointerx),
      _transform.y() + (y - _pointery),
      0
    );

    _lastpointerx = _pointerx,
    _lastpointery = _pointery,
    _pointerx = x;
    _pointery = y;

    that.onDrag.broadcast(new Signal(this, { x: _pointerx, y: _pointery }));
  }

  var _endDrag = function() {

    _element.classList.remove(_classNameWhileDragging);

    var xdrift = ((_pointerx - _lastpointerx) * _momentum),
        ydrift = ((_pointery - _lastpointery) * _momentum),
        xend = _transform.x() + xdrift,
        yend = _transform.y() + ydrift,
        xchange,
        ychange,
        duration;

    if(xend > _transform.x() && _xsnap != undefined) { xend = Math.ceil (xend / _xsnap) * _xsnap } else
    if(xend < _transform.x() && _xsnap != undefined) { xend = Math.floor(xend / _xsnap) * _xsnap };
    if(yend > _transform.y() && _ysnap != undefined) { yend = Math.ceil (yend / _ysnap) * _ysnap } else
    if(yend < _transform.y() && _ysnap != undefined) { yend = Math.floor(yend / _ysnap) * _ysnap };

    xchange = xend - _transform.x();
    ychange = yend - _transform.y();
    duration = _momentumTimeFactor * Math.sqrt((xchange * xchange) + (ychange * ychange));

    _animationx.easingFunction(_easingFunction);
    _animationy.easingFunction(_easingFunction);

    _animationx.startValue(_transform.x());
    _animationy.startValue(_transform.y());

    _animationx.endValue(xend);
    _animationy.endValue(yend);

    _animationx.duration(duration);
    _animationy.duration(duration);

    _animationx.rewind().play();
    _animationy.rewind().play();

    that.onEndDrag.broadcast(new Signal(this, { x: _pointerx, y: _pointery }));
  }

  // mouse handlers

  var _handleMouseDown = function(e) {
    _startDragAt(e.screenX, e.screenY);
    window.addEventListener('mousemove', _handleMouseMove, false);
  }

  var _handleMouseMove = function(e) {
    _dragTo(e.screenX, e.screenY);
  }

  var _handleMouseUp = function(e) {
    window.removeEventListener('mousemove', _handleMouseMove);
    _endDrag();
  }

  // touch handlers

  var _handleTouchStart = function(e) {
    e.stopPropagation();
    _startDragAt(e.targetTouches[0].screenX, e.targetTouches[0].screenY);
    window.addEventListener('touchmove', _handleTouchMove, false);
  }

  var _handleTouchMove = function(e) {
    e.stopPropagation();
    _dragTo(e.changedTouches[0].screenX, e.changedTouches[0].screenY);
  }

  var _handleTouchEnd = function(e) {
    e.stopPropagation();
    window.removeEventListener('touchmove', _handleTouchMove);
    _endDrag();
  }

  // privileged methods

  this.enableDrag = function() {
    // for mice
    _element.addEventListener('mousedown', _handleMouseDown, false);
    window.addEventListener('mouseup', _handleMouseUp, false);
    // for fingers
    _element.addEventListener('touchstart', _handleTouchStart, false);
    window.addEventListener('touchend', _handleTouchEnd, false);
  }


  // getter/setters

  this.element = function(element) {
      if(element instanceof HTMLElement) {
      _element = element;
      _transform.element(_element);
      this.onSetElement.broadcast(new Signal(this, { element: _element }));
      this.enableDrag();
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return _element;
  }

  this.classNameWhileDragging = function(s) {
      if(s.toString() === s) {
      _classNameWhileDragging = s;
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return _classNameWhileDragging;
  }

  this.momentum = function(n) {
      if(parseFloat(n) === n) {
      _momentum = n;
      console.log('momentum = ' + _momentum);
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return _momentum;
  }

  this.easingFunction = function(f) {
    if(arguments.length) {
      if(f instanceof Function) {
        _easingFunction = f;
        return this;
      }
      else { throw new Error(); }
    }

    return _easingFunction;
  }

  this.xSnap = function(n) {
      if(parseFloat(n) === n) {
      _xsnap = n;
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return _xsnap;
  }

  this.ySnap = function(n) {
      if(parseFloat(n) === n) {
      _ysnap = n;
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return _ysnap;
  }

  // initialise it
  if(options.classNameWhileDragging) {
    this.classNameWhileDragging(options.classNameWhileDragging);
  }
  if(options.momentum) {
    this.momentum(options.momentum);
  }
  if(options.easingFunction) {
    this.easingFunction(options.easingFunction);
  }
  if(options.xSnap) {
    this.xSnap(options.xSnap);
  }
  if(options.ySnap) {
    this.xSnap(options.ySnap);
  }
  this.element(element);

}

Drag.prototype.toString = function() {
  return '[Drag]';
}
function Translate3d(element, x, y, z) {

  // private vars

  var that = this,
      _element,
      _x = 0,
      _y = 0,
      _z = 0;

  // broadcasters

  this.onSetElement = new Broadcaster();
  this.onSetX       = new Broadcaster();
  this.onSetY       = new Broadcaster();
  this.onSetZ       = new Broadcaster();

  // private methods

  var _render = function() {

    var transform,
        indexA,
        indexB;

    if(_element.style.webkitTransform) {
      transform = _element.style.webkitTransform;
      indexA = transform.indexOf('translate3d(');
      indexB = transform.indexOf(')', indexA) + 1;
      transform = transform.slice(0, indexA) + transform.slice(indexB);
      _element.style.webkitTransform = transform;
    }

    transform = ' translate3d(' + _x + 'px, ' + _y + 'px, ' + _z + 'px)';

    _element.style.webkitTransform += transform;
  }

  // privileged methods

  // getter/setters

  this.element = function(element) {
      if(element instanceof HTMLElement) {
      _element = element;
      _render();
      this.onSetElement.broadcast(new Signal(this, { element: _element }));
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return _element;
  }

  this.x = function(n) {
    if(parseFloat(n) === n) {
      _x = n;
      _render();
      this.onSetX.broadcast(new Signal(this, { x: _x }));
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return _x;
  }

  this.y = function(n) {
    if(parseFloat(n) === n) {
      _y = n;
      _render();
      this.onSetY.broadcast(new Signal(this, { y: _y }));
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return _y;
  }

  this.z = function(n) {
    if(parseFloat(n) === n) {
      _z = n;
      _render();
      this.onSetZ.broadcast(new Signal(this, { z: _z }));
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return _z;
  }

  this.xyz = function(x, y, z) {
    if(parseFloat(x) === x && parseFloat(y) === y && parseFloat(z) === z) {
      _x = x;
      _y = y;
      _z = z;
      _render();
      this.onSetX.broadcast(new Signal(this, { x: _x }));
      this.onSetY.broadcast(new Signal(this, { y: _y }));
      this.onSetZ.broadcast(new Signal(this, { z: _z }));
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return {x: _x, y: _y, z: _z}
  }

  // initialise it
  x = x != undefined ? x : 0;
  y = y != undefined ? y : 0;
  z = z != undefined ? z : 0;
  if(element) this.element(element).xyz(x, y, z);

}

Translate3d.prototype.toString = function() {
  return '[Translate3d]';
}