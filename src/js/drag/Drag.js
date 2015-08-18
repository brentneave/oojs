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

      // params

      _element,
      _momentum = 0,
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

    var xend = (_pointerx - _lastpointerx) * _momentum,
        yend = (_pointery - _lastpointery) * _momentum,
        duration = _momentumTimeFactor * Math.sqrt((xend * xend) + (yend * yend));

    _animationx.easingFunction(_easingFunction);
    _animationy.easingFunction(_easingFunction);

    _animationx.startValue(_transform.x());
    _animationy.startValue(_transform.y());

    _animationx.endValue(_transform.x() + xend);
    _animationy.endValue(_transform.y() + yend);

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
  this.element(element);

}

Drag.prototype.toString = function() {
  return '[Drag]';
}