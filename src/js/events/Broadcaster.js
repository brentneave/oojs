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
		if(!(e instanceof Event))
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