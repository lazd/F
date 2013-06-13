/**
 * Provides observer pattern for basic eventing. Directly uses <a href="http://backbonejs.org/#Events">Backbone.Events</a>
 *
 * @class
 */
F.EventEmitter = new Class(
	Backbone.Events

	/**
		Bind one or more space separated events, or an events map,
		to a <code>callback</code> function. Passing <code>"all"</code> will bind the callback to
		all events fired.
	
		@name on
		@memberOf F.EventEmitter.prototype
		@function

		@param {String}		event		Event to listen to
		@param {Function}	callback	Callback to execute when the event is triggered
		@param {Object}		[context]	The value of <code>this</code> when the callback runs
	*/
	
	/**
		Bind events to only be triggered a single time. After the first time
		the callback is invoked, it will be removed.
		
		@name once
		@memberOf F.EventEmitter.prototype
		@function

		@param {String}		event		Name of the event to listen to
		@param {Function}	callback	Callback to execute when the event is triggered
		@param {Object}		[context]	The value of <code>this</code> when the callback runs
	*/
	
	/**
		Remove one or many callbacks. If <code>context</code> is null, removes all
		callbacks with that function. If <code>callback</code> is null, removes all
		callbacks for the event. If <code>events</code> is null, removes all bound
		callbacks for all events.
		
		@name off
		@memberOf F.EventEmitter.prototype
		@function

		@param {String}		[event]		Name of the event that is being listened to
		@param {Function}	[callback]	Callback to remove
		@param {Object}		[context]	Remove callbacks with the specified context
	*/
	
	/**
		Trigger one or many events, firing all bound callbacks. Callbacks are
		passed the same arguments as <code>trigger</code> is, apart from the event name
		(unless you're listening on <code>"all"</code>, which will cause your callback to
		receive the true name of the event as the first argument).
		
		@name trigger
		@memberOf F.EventEmitter.prototype
		@function

		@param {String}		event		Name of the event to trigger
		@param {...Mixed}	[args]		Arguments to pass to callback functions
	*/
	
	/**
		An inversion-of-control version of <code>on</code>. Tell <b>this</b> object to listen to
		an event in another object keeping track of what it's listening to.
		
		@name listenTo
		@memberOf F.EventEmitter.prototype
		@function

		@param {Object}		other		The object to listen to
		@param {String}		event		Name of the event to listen to
		@param {Function}	callback	Callback to execute when the event is triggered
	*/

	/**
		Tell this object to stop listening to either specific events or
		to every object it's currently listening to.
	
		@name stopListening
		@memberOf F.EventEmitter.prototype
		@function

		@param {Object}		[other]		The object that is being listened to
		@param {String}		[event]		Name of the event that is being listened to
		@param {Function}	[callback]	Callback to remove
	*/
);