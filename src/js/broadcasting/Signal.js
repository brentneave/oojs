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