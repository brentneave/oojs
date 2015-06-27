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