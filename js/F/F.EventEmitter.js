/**
 * Provides observer pattern for basic eventing
 *
 * @class
 */
F.EventEmitter = new Class(/** @lends F.EventEmitter# */{
	destruct: function() {
		delete this._events;
	},
	
	/**
	 * Attach an event listener
	 *
	 * @param {String} evt		Name of event to listen to
	 * @param {Function} func	Function to execute
	 *
	 * @returns {F.EventEmitter}	this, chainable
	 */
	on: function(evt, func) {
		this._events = this._events || {};
		this._events[evt] = this._events[evt] || [];
		this._events[evt].push(func);
		
		return this;
	},

	/**
	 * Remove an event listener
	 *
	 * @param {String} evt		Name of event that function is bound to
	 * @param {Function} func	Bound function
	 *
	 * @returns {F.EventEmitter}	this, chainable
	 */
	off: function(evt, func) {
		this._events = this._events || {};
		if (evt in this._events === false) return;
		this._events[evt].splice(this._events[evt].indexOf(func), 1);
		
		return this;
	},
	
	/**
	 * Trigger an event
	 *
	 * @param {String} evt		Name of event to trigger
	 * @param {Arguments} args	Additional arguments are passed to the listener functions
	 *
	 * @returns {F.EventEmitter}	this, chainable
	 */
	trigger: function(evt) {
		this._events = this._events || {};
		if (evt in this._events === false) return;
		for (var i = 0; i < this._events[evt].length; i++) {
			this._events[evt][i].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		
		return this;
	}
});
