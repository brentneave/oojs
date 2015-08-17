function Drag(element, options)
{
  // private vars
  var _element,
      _options,
      _startx,
      _starty,
      _pointerx,
      _pointery,
      _translatex,
      _translatey;

  // private methods
  var _startDragAt = function(x, y) {
    _startx = _pointerx = x;
    _starty = _pointery = y;
  }

  var _dragTo = function(x, y) {
    _pointerx = x;
    _pointery = y;
    _translatex = _pointerx - _startx;
    _translatey = _pointery - _starty;

    _element.style.transform =
    _element.style.webkitTransform = 'translate3d(' + _translatex + 'px, ' + _translatey + 'px, 0)';
  }
  var _endDrag = function() {
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
      this.enableDrag();
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return _element;
  }

  this.element(element);

}

Drag.prototype.toString = function() {
  return '[Drag]';
}