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
      _horizontal = true,
      _vertical = true,

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
    if(_horizontal) {
      _transform.x(_transform.x() + (x - _pointerx));
    }

    if(_vertical) {
      _transform.y(_transform.y() + (y - _pointery));
    }

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
        xchange = 0,
        ychange = 0,
        duration;

    if(_horizontal) {
      if(xend > _transform.x() && _xsnap != undefined) { xend = Math.ceil (xend / _xsnap) * _xsnap } else
      if(xend < _transform.x() && _xsnap != undefined) { xend = Math.floor(xend / _xsnap) * _xsnap };
      xchange = xend - _transform.x();
    }
    if(_horizontal) {
      if(yend > _transform.y() && _ysnap != undefined) { yend = Math.ceil (yend / _ysnap) * _ysnap } else
      if(yend < _transform.y() && _ysnap != undefined) { yend = Math.floor(yend / _ysnap) * _ysnap };
      ychange = yend - _transform.y();
    }

    duration = _momentumTimeFactor * Math.sqrt((xchange * xchange) + (ychange * ychange));
console.log(xend);
    if(_horizontal) {
      _animationx
        .easingFunction(_easingFunction)
        .startValue(_transform.x())
        .endValue(xend)
        .duration(duration)
        .rewind().play()
    }

    if(_vertical) {
      _animationy
        .easingFunction(_easingFunction)
        .startValue(_transform.y())
        .endValue(yend)
        .duration(duration)
        .rewind().play()
    }

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

  this.vertical = function(b) {
    if(b === true || b === false) {
      _vertical = b;
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return _vertical;
  }

  this.horizontal = function(b) {
    if(b === true || b === false) {
      _horizontal = b;
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return _horizontal;
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
    this.ySnap(options.ySnap);
  }
  if(options.vertical != undefined) {
    this.vertical(options.vertical);
  }
  if(options.horizontal != undefined) {
    this.vertical(options.horizontal);
  }
  this.element(element);

}

Drag.prototype.toString = function() {
  return '[Drag]';
}