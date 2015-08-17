function Drag(element, classNameWhileDragging) {

  // private vars

  var that = this,
      _element,
      _options,
      _pointerx,
      _pointery,
      _translatex = 0,
      _translatey = 0,
      _draggingClassName;

  // broadcasters

  this.onSetElement = new Broadcaster();
  this.onStartDrag  = new Broadcaster();
  this.onDrag       = new Broadcaster();
  this.onEndDrag    = new Broadcaster();

  // private methods

  var _startDragAt = function(x, y) {
    _pointerx = x;
    _pointery = y;

    if(_draggingClassName) _element.classList.add(_draggingClassName);

    that.onStartDrag.broadcast(new Signal(this, { x: _pointerx, y: _pointery }));
  }

  var _dragTo = function(x, y) {
    _translatex += x - _pointerx;
    _translatey += y - _pointery;
    _pointerx = x;
    _pointery = y;

    _element.style.transform =
    _element.style.webkitTransform = 'translate3d(' + _translatex + 'px, ' + _translatey + 'px, 0)';

    that.onDrag.broadcast(new Signal(this, { x: _pointerx, y: _pointery }));
  }

  var _endDrag = function() {
    _element.classList.remove(_draggingClassName);
    that.onDrag.broadcast(new Signal(this, { x: _pointerx, y: _pointery }));
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
    _element.addEventListener('touchend', _handleTouchEnd, false);
  }


  // getter/setters

  this.element = function(element) {
      if(element instanceof HTMLElement) {
      _element = element;
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
      _draggingClassName = s;
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return _draggingClassName;
  }

  // initialise it

  if(classNameWhileDragging) this.classNameWhileDragging(classNameWhileDragging);
  if(element) this.element(element);

}

Drag.prototype.toString = function() {
  return '[Drag]';
}