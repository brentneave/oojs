function Translate2D(element, x, y) {

  // private vars

  var that = this,
      _element,
      _x = 0,
      _y = 0;

  // broadcasters

  this.onSetElement = new Broadcaster();
  this.onSetX       = new Broadcaster();
  this.onSetY       = new Broadcaster();

  // private methods

  var _render = function() {

    var transform,
        indexA,
        indexB;

    if(_element.style.webkitTransform) {
      transform = _element.style.webkitTransform;
      indexA = transform.indexOf('translate(');
      indexB = transform.indexOf(')', indexA) + 1;
      transform = transform.slice(0, indexA) + transform.slice(indexB);
      _element.style.webkitTransform = transform;
    }

    transform = ' translate(' + _x + 'px, ' + _y + 'px)';

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
      that.onSetX.broadcast(new Signal(this, { x: _x }));
      _render();
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
      this.onSetY.broadcast(new Signal(this, { y: _y }));
      _render();
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return _y;
  }

  this.xy = function(x, y) {
    if(parseFloat(x) === x && parseFloat(y) === y) {
      _x = x;
      _y = y;
      this.onSetX.broadcast(new Signal(this, { x: _x }));
      this.onSetY.broadcast(new Signal(this, { y: _y }));
      _render();
      return this;
    }
    else if (arguments.length) {
      throw new Error();
    }
    return {x: _x, y: _y}
  }

  // initialise it
  x = x != undefined ? x : 0;
  y = y != undefined ? y : 0;
  if(element) this.element(element).x(x).y(y);

}

Translate2D.prototype.toString = function() {
  return '[Translate2D]';
}