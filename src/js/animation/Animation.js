function Animation(start, end, duration, easingFunction) {

  if(start     !== parseFloat(start))         { throw new Error(); }
  if(end       !== parseFloat(end))           { throw new Error(); }
  if(duration !== parseFloat(duration))      { throw new Error(); }
  if(!(easingFunction instanceof Function))  { throw new Error(); }

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
        new Event(
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
      new Event(
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
      new Event(
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
      new Event(
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
      this.onComplete.broadcast(new Event(this, {}));
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
      this.onComplete.broadcast(new Event(this, {}));
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
