/**
 * Provides observer pattern for basic eventing. Directly uses Backbone.Events
 *
 * @class
 */
F.EventEmitter = new Class(
	Backbone.Events

	/**
		Bind one or more space separated events, or an events map,
		to a `callback` function. Passing `"all"` will bind the callback to
		all events fired.
	
		@name on
		@memberOf F.EventEmitter.prototype
		@function
	*/
	
	/**
		Bind events to only be triggered a single time. After the first time
		the callback is invoked, it will be removed.
		
		@name once
		@memberOf F.EventEmitter.prototype
		@function
	*/
	
	/**
		Remove one or many callbacks. If `context` is null, removes all
		callbacks with that function. If `callback` is null, removes all
		callbacks for the event. If `events` is null, removes all bound
		callbacks for all events.
		
		@name off
		@memberOf F.EventEmitter.prototype
		@function
	*/
	
	/**
		Trigger one or many events, firing all bound callbacks. Callbacks are
		passed the same arguments as `trigger` is, apart from the event name
		(unless you're listening on `"all"`, which will cause your callback to
		receive the true name of the event as the first argument).
		
		@name trigger
		@memberOf F.EventEmitter.prototype
		@function
	*/
	
	/**
		An inversion-of-control version of `on`. Tell *this* object to listen to
		an event in another object ... keeping track of what it's listening to.
		
		@name listenTo
		@memberOf F.EventEmitter.prototype
		@function
	*/

	/**
		Tell this object to stop listening to either specific events ... or
		to every object it's currently listening to.
	
		@name stopListening
		@memberOf F.EventEmitter.prototype
		@function
	*/
);