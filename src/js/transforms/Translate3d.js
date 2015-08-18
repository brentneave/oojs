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