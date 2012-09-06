/*! F - v0.1.0 - 2012-09-05
* http://lazd.github.com/F/
* Copyright (c) 2012 Lawrence Davis; Licensed BSD */

/**
 * Crockford's new_constructor pattern, modified to allow walking the prototype chain, automatic init/destruct calling of super classes, and easy toString methods
 *
 * @function
 *
 * @param {Object} descriptor						Descriptor object
 * @param {String or Function} descriptor.toString	A string or method to use for the toString of this class and instances of this class
 * @param {Object} descriptor.extend				The class to extend
 * @param {Function} descriptor.construct			The constructor (setup) method for the new class
 * @param {Function} descriptor.destruct			The destructor (teardown) method for the new class
 * @param {Anything} descriptor.*					Other methods and properties for the new class
 *
 * @returns {BaseClass} The created class.
*/
var Class;

(function() {
	/**
	 * The class blueprint which contains the methods that all classes will automatically have.
	 * BaseClass cannot be extended or instantiated and does not exist in the global namespace.
	 * If you create a class using <code>new Class()</code> or <code>MyClass.extend()</code>, it will come with BaseClass' methods.
	 *
	 * @class
	 * @name BaseClass
	 *
	 * @param {Object} options	Instance options. Guaranteed to be defined as at least an empty Object
	 */
	
	/**
	 * Destroys this instance and frees associated memory.
	 *
	 * @name destruct
	 * @memberOf BaseClass.prototype
	 * @function
	 */
	
	/**
	 * Binds a method of this instance to the execution scope of this instance.
	 *
	 * @name bind
	 * @memberOf BaseClass.prototype
	 * @function
	 *
	 * @param {Function} func	The this.method you want to bind
	 */
	var bindFunc = function(func) {
		// Bind the function to always execute in scope
		var boundFunc = func.bind(this);

		// Store the method name
		boundFunc._methodName = func._methodName;

		// Store the bound function back to the class
		this[boundFunc._methodName] = boundFunc;

		// Return the bound function
		return boundFunc;
	};
	
	/**
	 * Extends this class using the passed descriptor. 
	 * Called on the Class itself (not an instance), this is an alternative to using <code>new Class()</code>.
	 * Any class created using Class will have this static method on the class itself.
	 *
	 * @name extend
	 * @memberOf BaseClass
	 * @function
	 *
	 * @param {Object} descriptor						Descriptor object
	 * @param {String or Function} descriptor.toString	A string or method to use for the toString of this class and instances of this class
	 * @param {Object} descriptor.extend				The class to extend
	 * @param {Function} descriptor.construct			The constructor (setup) method for the new class
	 * @param {Function} descriptor.destruct			The destructor (teardown) method for the new class
	 * @param {Anything} descriptor.*					Other methods and properties for the new class
	 */
	var extendClass = function(descriptor) {
		return new Class(_.extend({}, descriptor, {
			extend: this
		}));
	};
	
	Class = function(descriptor) {
		descriptor = descriptor || {};

		if (descriptor.hasOwnProperty('extend') && !descriptor.extend) {
			console.warn('Class: %s is attempting to extend a non-truthy thing', descriptor.toString === 'function' ? descriptor.toString : descriptor.toString, descriptor.extend);
		}

		// Extend Object by default
		var extend = descriptor.extend || Object;

		// Construct and destruct are not required
		var construct = descriptor.construct;
		var destruct = descriptor.destruct;

		// Remove special methods and keywords from descriptor
		delete descriptor.bind;
		delete descriptor.extend;
		delete descriptor.destruct;
		delete descriptor.construct;

		// Add toString method, if necessary
		if (descriptor.hasOwnProperty('toString') && typeof descriptor.toString !== 'function') {
			// Return the string provided
			var classString = descriptor.toString;
			descriptor.toString = function() {
				return classString.toString();
			};
		}
		else if (!descriptor.hasOwnProperty('toString') && extend.prototype.hasOwnProperty('toString')) {
			// Use parent's toString
			descriptor.toString = extend.prototype.toString;
		}

		// The remaining properties in descriptor are our methods
		var methodsAndProps = descriptor;

		// Create an object with the prototype of the class we're extending
		var prototype = Object.create(extend && extend.prototype);

		// Store super class as a property of the new class' prototype
		prototype.superClass = extend.prototype;

		// Copy new methods into prototype
		if (methodsAndProps) {	
			for (var key in methodsAndProps) {
				if (methodsAndProps.hasOwnProperty(key)) {
					prototype[key] = methodsAndProps[key];

					// Store the method name so calls to inherited() work
					if (typeof methodsAndProps[key] === 'function') {
						prototype[key]._methodName = key;
						prototype[key]._parentProto = prototype;
					}
				}
			}
		}

		/**
		 * A function that calls an inherited method by the same name as the callee
		 *
		 * @name inherited
		 * @memberOf BaseClass.prototype
		 * @function
		 *
		 * @param {Arguments} args	Unadulterated arguments array from calling function
		 */
		prototype.inherited = function(args) {
			// Get the function that call us from the passed arguments objected
			var caller = args.callee;

			// Get the name of the method that called us from a property of the method
			var methodName = caller._methodName;

			if (!methodName) {
				console.error("Class.inherited: can't call inherited method: calling method did not have _methodName", args.callee);
				return;
			}

			// Start iterating at the prototype that this function is defined in
			var curProto = caller._parentProto;
			var inheritedFunc = null;

			// Iterate up the prototype chain until we find the inherited function
			while (curProto.superClass) {
				curProto = curProto.superClass;
				inheritedFunc = curProto[methodName];
				if (typeof inheritedFunc === 'function')
					break;
			}

			if (typeof inheritedFunc === 'function') {
				// Store our inherited function
				var oldInherited = this.inherited;

				// Overwrite our inherited function with that of the prototype so the called function can call its parent
				this.inherited = curProto.inherited;

				// Call the inherited function our scope, apply the passed args array
				var retVal = inheritedFunc.apply(this, args);

				// Revert our inherited function to the old function
				this.inherited = oldInherited;

				// Return the value called by the inherited function
				return retVal;
			}
			else {
				console.warn("Class.inherited: can't call inherited method for '%s': no method by that name found", methodName);
			}
		};
		
		// Add bind to the prototype of the class
		prototype.bind = bindFunc;

		/**
		 * Call the destruct method of all inherited classes
		 */
		prototype.destruct = function() {
			// Call our destruct method first
			if (typeof destruct === 'function') {
				destruct.apply(this);
			}

			// Call superclass destruct method after this class' method
			if (extend && extend.prototype && typeof extend.prototype.destruct === 'function') {
				extend.prototype.destruct.apply(this);			
			}
		};

		/**
		 * Construct is called automatically
		 */
		// Create a chained construct function which calls the superclass' construct function
		prototype.construct = function() {
			// Add a blank object as the first arg to the constructor, if none provided
			var args = arguments; // get around JSHint complaining about modifying arguments
			if (args[0] === undefined) {
				args.length = 1;
				args[0] = {};
			}

			// call superclass constructor
			if (extend && extend.prototype && typeof extend.prototype.construct === 'function') {
				extend.prototype.construct.apply(this, arguments);			
			}

			// call constructor
			if (typeof construct === 'function') {
				construct.apply(this, arguments);
			}
		};

		// Create a function that generates instances of our class and calls our construct functions
		/** @private */
		var instanceGenerator = function() {
			// Create a new object with the prototype we built
			var instance = Object.create(prototype);

			// Call all inherited construct functions
			prototype.construct.apply(instance, arguments);

			return instance;
		};

		// Set the prototype of our instance generator to the prototype of our new class so things like MyClass.prototype.method.apply(this) work
		instanceGenerator.prototype = prototype;

		// Add extend to the instance generator for the class
		instanceGenerator.extend = extendClass;

		// The constructor, as far as JS is concerned, is actually our instance generator
		prototype.constructor = instanceGenerator;

		return instanceGenerator;
	};

	if (!Object.create) {
		/**
		 * Polyfill for Object.create. Creates a new object with the specified prototype.
		 * 
		 * @author <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create/">Mozilla MDN</a>
		 *
		 * @param {Object} prototype	The prototype to create a new object with
		 */
		Object.create = function (prototype) {
			if (arguments.length > 1) {
				throw new Error('Object.create implementation only accepts the first parameter.');
			}
			function Func() {}
			Func.prototype = prototype;
			return new Func();
		};
	}

	if (!Function.prototype.bind) {
		/**
		 * Polyfill for Function.bind. Binds a function to always execute in a specific scope.
		 * 
		 * @author <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind">Mozilla MDN</a>
		 *
		 * @param {Object} scope	The scope to bind the function to
		 */
		Function.prototype.bind = function (scope) {
			if (typeof this !== "function") {
				// closest thing possible to the ECMAScript 5 internal IsCallable function
				throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
			}

			var aArgs = Array.prototype.slice.call(arguments, 1);
			var fToBind = this;
			/** @ignore */
			var NoOp = function() {};
			/** @ignore */
			var fBound = function() {
				return fToBind.apply(this instanceof NoOp ? this : scope, aArgs.concat(Array.prototype.slice.call(arguments)));
			};

			NoOp.prototype = this.prototype;
			fBound.prototype = new NoOp();

			return fBound;
		};
	}
}());

/** 
 * The main F namespace.
 *	
 * @namespace
 *
 * @property {Object} options						Options for all F components.
 * @param {Boolean} options.debug					If true, show debug messages for all components.
 * @param {Boolean} options.precompiledTemplates	Set to false if you need Handlebars.template() called on your templates
*/
var F = F || {};

try {
	window['ƒ'] = F;
}
catch (err) {
	console.log("ƒ: could not set ƒ variable");
}

F.options = {
	debug: false,
	precompiledTemplates: true
};

/**
 * Provides observer pattern for basic eventing
 *
 * @class	
 * @extends BaseClass
 */
F.EventEmitter = new Class(/** @lends F.EventEmitter# */{
	/** @constructs */
	construct: function() {
		this._events = {};
	},
	
	/**
	 * Destroy references to events and listeners.
	 */
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
		var listeners = this._events[evt] = this._events[evt] || [];
		listeners.push(func);
		
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
		var listeners = this._events[evt];
		if (listeners !== undefined);
			listeners.splice(listeners.indexOf(func), 1);
		
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
		var listeners = this._events[evt];
		if (listeners !== undefined) {
			for (var i = 0, n = listeners.length; i < n; i++) {
				listeners[i].apply(this, Array.prototype.slice.call(arguments, 1));
			}
		}
		
		return this;
	}
});

(function() {
	// A couple functions required to override delegateEvents
	var delegateEventSplitter = /^(\S+)\s*(.*)$/;
	var getValue = function(object, prop) {
		if (!(object && object[prop])) return null;
		return _.isFunction(object[prop]) ? object[prop]() : object[prop];
	};
	
	F.View = Backbone.View.extend(/** @lends F.View# */{
		/**;
		 * Generic view class. Provides rendering and templating based on a model, eventing based on a component, and element management based on a parent
		 *
		 * @constructs
		 * @extends Backbone.View
		 *
		 * @param {Object} options	Options for this view
		 * @param {Template} options.template	The template to render this view with
		 * @param {Element} [options.el]		The element, jQuery selector, or jQuery object to render this view to. Should not be used with options.parent
		 * @param {Element} [options.parent]	The element, jQuery selector, or jQuery object to insert this components element into. Should not be used with options.el
		 * @param {Backbone.Model} [options.model]	Instance of a Backbone model to render this view from
		 * @param {Component} [options.component]	The component that events should be delegated to
		 * @param {Object} [options.events]		Backbone events object indicating events to listen for on this view
		 *
		 * @property {Template} template		The template to render this view with
		 *
		 */
		initialize: function() {
			if (this.template || this.options.template) {
				if (F.options.precompiledTemplates)
					this.template = this.template || this.options.template;
				else // For pre-compiled templates
					this.template = Handlebars.template(this.template || this.options.template);
			}
			
			// Always call in our scope so parents can remove change listeners on models by referencing view.render
			this.render = this.render.bind(this);
			
			if (this.options.el) {
				// Make sure the element is of the right tag
				var actualNodeName = this.$el[0].nodeName.toUpperCase();
				var requiredNodeName =  this.tagName.toUpperCase();
				
				// TBD: Revisit this check later; must be a better way to allow any node
				if (this.tagName !== 'div' && actualNodeName !== requiredNodeName) {
					throw new Error('View: cannot create view, incorrect tag provided. Expected '+requiredNodeName+', but got '+actualNodeName);
				}
			
				// Add the CSS class if it doesn't have it
				this.$el.addClass(this.className);
			}
			
			// Store parent, if provided
			this.parent = this.options.parent;
			
			// Store the model
			this.model = this.options.model;
			
			// Store the controlling component
			this.component = this.options.component;
			
			// Add events
			if (this.options.events)
				this.delegateEvents(this.options.events);

			// Add change listeners to the model, but only if has an on method
			if (this.model && this.model.on) {
				this.model.on('change', this.render);
				
				/*
				// TBD: Should we do these?
				this.model.on('reset', function() {
					console.log("View caught model reset!");
					console.log("%s: Re-rendering view because model was reset!", this.component && this.component.toString() || 'Orphaned view');
					this.render();
				}.bind(this));
				
				// TBD: Should we do these?
				this.model.on('loaded', function() {
					console.log("%s: Re-rendering view because model was loaded!", this.component && this.component.toString() || 'Orphaned view');
					this.render();
				}.bind(this));
				*/
			}
			
			this.rendered = null;
		},
		
		/**
		 * Get the number of milliseconds seconds since the view was last rendered
		 *
		 * @returns {number} Number of milliseconds since this view was rendered
		 */
		age: function() {
			return this.rendered !== null ? new Date().getTime() - this.rendered : -1;
		},
		
		/**
		 * Remove this view from the DOM and stop listening to model change events
		 */
		remove: function() {
			this.$el.remove();
		
			// Remove change listener
			if (this.model && this.model.off)
				this.model.off('change', this.render);
		},
		
		/**
		 * Show the view. The view will be rendered before it is shown if it hasn't already been rendered
		 *
		 * @returns {F.View}	this, chainable
		 */
		show: function() {
			// Ensure the view is rendered
			if (this.template) {
				this.renderOnce();
			}
			
			// Show the view
			this.$el.show();
			
			return this;
		},
	
		/**
		 * Hide the view
		 *
		 * @returns {F.View}	this, chainable
		 */
		hide: function() {
			// Hide the view
			this.$el.hide();
		
			return this;
		},
	
		/**
		 * Render the view only if it has not been rendered before (or has been reset)
		 *
		 * @returns {F.View}	this, chainable
		 */
		renderOnce: function() {
			// Only render the view if it has never been rendered
			if (this.rendered === null) {
				this.render();
			}
		
			return this;
		},

		inDebugMode: function() {
			// Check if the component or F itself is in debug mode
			return F.options.debug || (this.component && this.component.options.debug); 
		},

		/**
		 * Render the view
		 *
		 * @returns {F.View}	this, chainable
		 */
		render: function() {
			if (this.inDebugMode()) {
				console.log('%s: Rendering view...', this.component && this.component.toString() || 'Orphaned view');
			}
			
			if (this.template) {
				// Render template
				
				// Use this view's model, or the model of the component it's part of
				var model = this.model || this.component && this.component.model;
				
				// First, see if the model exists. If so, see if it has toJSON. If so, use model.toJSON. Otherwise, if model exists, use model. Otherwise, use {}
				this.$el.html(this.template(model && model.toJSON && model.toJSON() || model || {}));
			}
			
			// Add to parent, if not already there
			if (this.parent && !$(this.el.parentNode).is(this.parent)) {
				$(this.parent).append(this.el);
			}
		
			// Store the last time this view was rendered
			this.rendered = new Date().getTime();
			
			// Notify render has completed
			this.trigger('renderComplete');
			
			return this;
		},
		
		/**
		 * Delegate events to this view. This overrides Backbone.View.delegateEvents and lets us specify an object to call methods on instead of the view
		 *
		 * @param {Events hash to delegate} events
		 *
		 * @returns {F.View}	this, chainable
		 */
		delegateEvents: function(events) {
			if (!(events || (events = getValue(this, 'events')))) return;
			this.undelegateEvents();
			for (var key in events) {
				var method = events[key];
				
				var base = this.component;
						
				if (!_.isFunction(method)) {
					if (this.component) {
						var parts = events[key].split('.');
						
						if (parts.length > 1) {
							method = this.component;
						
							for (var i = 0; i < parts.length; i++) {
								var part = parts[i];
							
								// console.log('Looking for part ', part, 'in ', method);
								base = method;
								method = method[part];
							
								if (!method) {
									// console.warn('Could not find method %s', key);
									break;
								}
							}
						}
						else
							method = this.component[events[key]];
					}
					else {
						method = this[events[key]];
					}
				}
				
				if (!method) throw new Error('Method "' + events[key] + '" does not exist');
				
				var match = key.match(delegateEventSplitter);
				var eventName = match[1], selector = match[2];

				// Execute in the scope of the base
				// TBD: determine if we ought to execute in the scope of the view itself ever?
				//		or leave that up to implementors to pass a bound function
				method = this.component ? _.bind(method, base) : _.bind(method, this);
				
				eventName += '.delegateEvents' + this.cid;
				if (selector === '') {
					this.$el.bind(eventName, method);
				} else {
					this.$el.delegate(selector, eventName, method);
				}
			}
			
			return this;
		}
	});
}());

(function() {
	function decapitalize(str) {
		return str.slice(0, 1).toLowerCase()+str.slice(1);	
	}
	
	F.Component = new Class(/** @lends F.Component# */{
		toString: 'Component',
		extend: F.EventEmitter,
		
		options: {
			singly: false, // Show only one subcomponent at a time
			visible: false, // Visible immediately or not
			debug: false
		},
		
		/**
		 * Generic component class
		 *
		 * @extends F.EventEmitter
		 * @constructs
		 *
		 * @param {Object} options	Component options
		 * @param {Boolean} options.singly		Whether this component will allow multiple sub-components to be visible at once. If true, only one component will be visible at a time.
		 * @param {Boolean} options.visible		If true, this component will be visible immediately.
		 * @param {Boolean} options.debug		If true, show debug messages for this component.
		 *
		 * @property {Object} options			Default options for this component. These will be merged with options passed to the constructor.
		 */
		construct: function(options) {
			// Merge options up the prototype chain
			this.mergeOptions();
			
			// Add defaults to options arg and make available to other constructors
			// Modify this.options to reflect any modifications the options arg may have made
			this.applyOptions(options);
			
			// Sub components
			this.components = {};
			
			// Hold the bubbled event listeners
			this._bubbledEvts = {};
			
			// Make sure the following functions are always called in scope
			// They are used in event handlers, and we want to be able to remove them
			this.bind(this._handleSubComponentShown);
			this.bind(this.render);
		},
		
		/**
		 * Destroy this instance and free associated memory
		 */
		destruct: function() {
			// If this module has a view in this.view, destroy it automatically
			if (this.view)
				this.view.remove();
			
			// Destroy sub-components
			for (var component in this.components) {
				this.components[component].destruct();
				delete this[component];
			}
		
			// Clear references to components
			delete this.components;
		},
		
		/**
		 * Render the view associated with this component, if it has one
		 *
		 * @returns {F.Component}	this, chainable
		 */
		render: function() {
			if (this.view) {
				this.view.render();
			}
			
			return this;
		},
	
		/**
		 * Set an event to bubble up the component chain by re-triggering it when the given sub-component triggers it
		 * 
		 * @param {String} componentName	Name of the component whose event to bubble
		 * @param {String} evt				Name of event to bubble up
		 *
		 * @returns {F.Component}	this, chainable
		 */
		bubble: function(componentName, evt) {
			if (!this[componentName]) {
				console.error("%s: cannot set event '%s' for bubbling from component '%s', component does not exist", this.toString(), evt, componentName);
				return this;
			}
			
			if (!this._bubbledEvts[componentName])
				this._bubbledEvts[componentName] = {};
			
			// Create a handler
			var handler = this._bubbledEvts[componentName][evt] = function() {
				// Turn the event arguments into an array
				var args = Array.prototype.slice.call(arguments);
				
				// Add the name of the event to the arguments array
				args.unshift(evt);
				
				// Call to bubble the event up
				this.trigger.apply(this, args);
			}.bind(this);
			
			// Add the listener
			this[componentName].on(evt, handler);
			
			return this;
		},
	
		/**
		 * Discontinue bubbling of a given event
		 * 
		 * @param {String} componentName	Name of the component whose event to stop bubbling
		 * @param {String} evt				Name of event that was set to bubble
		 *
		 * @returns {F.Component}	this, chainable
		 */
		unbubble: function(componentName, evt) {
			if (!this._bubbledEvts[componentName] || !this._bubbledEvts[componentName][evt]) {
				console.warn("%s: cannot discontinue bubbling of event '%s' for component '%s', event was not set for bubbling", this.toString(), evt, componentName);
				return this;
			}

			// Remove the listener
			this[componentName].off(evt, this._bubbledEvts[componentName][evt]);

			return this;
		},

		/**
		 * Add an instance of another component as a sub-component.
		 *
		 * this[subComponent.toString()] is used to reference the sub-component:
		 * 
		 *   this.List.show();
		 * 
		 * You can give a component an optional custom name as the second argument, then reference as such:
		 * 
		 *  this.myCustomComponent.show();
		 * 
		 * @param {F.Component} component	Instance of component
		 * @param {Function} componentName	Optional custom name for this component
		 *
		 * @returns {F.Component}	The sub-component that was added
		 */
		addComponent: function(component, componentName) {
			// Get the name of the component
			if (componentName) {
				// Tell component its new name, if provided
				componentName = decapitalize(componentName);
			}
			else {
				// Use lowercase of toString
				componentName = decapitalize(component.toString());
			}
			
			// Give component its new name
			component.setName(componentName);
			
			// Store component
			this[componentName] = this.components[componentName] = component;
		
			// Hide view by default
			if (component.view) {
				if (component.view.el) {
					if (component.options.visible === true) {
						// Call show method so view is rendered
						component.show({ silent: true });
					}
					else {
						// Just hide the el
						component.view.$el.hide();
					}
				}
				else {
					console.warn('Component %s has a view without an element', componentName, component, component.view, component.view.options);
				}
			}
			
			// Show a sub-component when it shows one of it's sub-components
			component.on('component:shown', this._handleSubComponentShown);
			
			return component;
		},
	
		/**
		 * Remove a sub-component
		 *
		 * @param {Function} componentName	Component name
		 *
		 * @returns {F.Component}	this, chainable
		 */
		removeComponent: function(componentName) {
			var component = this[componentName];
		
			if (component !== undefined) {
				component.off('component:shown', this._handleSubComponentShown);
		
				delete this[componentName];
				delete this.components[componentName];
			}
		
			return this;
		},
	
	
		/**
		 * Handles showing/hiding components in singly mode
		 *
		 * @param {Function} evt	Event object from component:shown
		 */
		_handleSubComponentShown: function(evt) {
			var newComponent = this.components[evt.name];
		
			if (newComponent !== undefined) {
				// hide current component(s) for non-overlays
				if (this.options.singly && !newComponent.overlay) {
					this.hideAllSubComponents([evt.name]);
				}
			
				// Show self
				this.show();
			}
		},
	
		/**
		 * Show this component and emit an event so parent components can show themselves. Use options.silent to prevent component:shown event from firing
		 *
		 * @param {Object} options	Options object
		 *
		 * @returns {F.Component}	this, chainable
		 */
		show: function(options) {
			options = options || {};
			
			// Debug output
			if (this.inDebugMode()) {
				// Don't show if already shown
				if (this.isVisible())
					console.log('%s: not showing self; already visible', this.toString());
				else
					console.log('%s: showing self', this.toString());
			}
		
			if (!options.silent) {
				// Always trigger event before we show ourself so others can hide/show
				this.trigger('component:shown', {
					name: this.toString(),
					component: this
				});
			}
		
			// Always call show on the view so it has a chance to re-render
			if (this.view) {
				this.view.show();
			}
		
			this.options.visible = true;
	
			return this;
		},
	
		/**
		 * Hide this component
		 *
		 * @returns {F.Component}	this, chainable
		 */
		hide: function(options) {
			options = options || {};
			
			if (!this.isVisible())
				return false;
			
			if (this.inDebugMode()) {
				console.log('%s: hiding self', this.toString());
			}
			
			// Hide the view
			if (this.view)
				this.view.hide();
			
			if (!options.silent) {
				// Trigger event after we hide ourself so we're out of the way before the next action
				this.trigger('component:hidden', {
					name: this.toString(),
					component: this
				});
			}
		
			this.options.visible = false;
	
			return this;
		},
	
		/**
		 * Check if this component, or F as a whole, is in debug mode and should output debug messages
		 *
		 * @returns {Boolean} Component or F is in debug mode
		 */
		inDebugMode: function() {
			return this.options.debug || F.options.debug;
		},
		
		/**
		 * Check if this component is currently visible
		 *
		 * @returns {Boolean} Component is visible
		 */
		isVisible: function() {
			return this.options.visible;
		},

		/**
		 * Show all sub-components
		 *
		 * @param {String[]} [except]	List of component names not to show. These components will not be hidden if they are already shown
		 *
		 * @returns {F.Component}	this, chainable
		 */
		showAllSubComponents: function(except) {
			except = !_.isArray(except) ? [] : except;
			for (var componentName in this.components) {
				if (~except.indexOf(componentName))
					continue;
				this.components[componentName].show();
			}

			return this;
		},
		
		/**
		 * Hide all sub-components
		 *
		 * @param {String[]} [except]	List of component names not to hide. These components will not be shown if they are already hidden
		 *
		 * @returns {F.Component}	this, chainable
		 */
		hideAllSubComponents: function(except) {
			except = !_.isArray(except) ? [] : except;
			for (var componentName in this.components) {
				if (~except.indexOf(componentName))
					continue;
				this.components[componentName].hide();
			}
		
			return this;
		},
		
		/**
		 * Set a custom name for this component. Only useful before passing to {@link F.Component.addComponent}
		 *
		 * @param {Function} componentName	Component name
		 *
		 * @returns {F.Component}	this, chainable
		 */
		setName: function(customName) {
			/**
			 * Get this component's name
			 *
			 * @returns {String}	Component's name; either a custom name given when added with {@link F.Component.addComponent}, or toString method or string from prototype
			 */
			this.toString = function() {
				return customName;
			};
			
			return this;
		},
		
		/**
		 * Set properties of this instance from an options object, then remove the properties from the options object
		 *
		 * @param {Object} options		Options object with many properties
		 * @param {String[]} props		Properties to copy from options object
		 *
		 * @returns {F.Component}	this, chainable
		 */
		setPropsFromOptions: function(options, props) {
			_.each(props, function(prop) {
				// Add the property to this instance, or use existing property if it's already there
				this[prop] = options[prop] || this[prop];
				// Delete the property from the options object
				delete options[prop];
			}.bind(this));
			
			return this;
		},
		
		/**
		 * Merge options up the prototype chain. Options defined in the child class take precedence over those defined in the parent class.
		 */
		mergeOptions: function() {
			// Create a set of all options in the correct order
			var optionSets = [];
			var proto = this.constructor.prototype;
			while (proto) {
				if (proto.hasOwnProperty('options')) {
					optionSets.unshift(proto.options);
				}
				proto = proto.superClass;
			}
			
			// All options should end up merged into a new object
			// That is, move our reference out of the prototype before we modify it
			optionSets.unshift({});
			
			// Perform the merge and store the new options object
			this.options = _.extend.apply(_, optionSets);
		},
		
		/**
		 * Applies passed options to instance options and applies instance options to passed options.
		 * Individual passed options will not be applied to instance options unless they are defined in default options for the class or parent class.
		 * <br>Note: The options merge is one level deep.
		 * <br>Note: This function assumes that <code>this.options</code> does not refer to an object in the prototype.
		 *
		 * @param {Object} options	Instance options object (usually argument to constructor)
		 *
		 * @returns {Object}	Merged options object
		 */
		applyOptions: function(options) {
			// Assume we already have moved our reference to this.options out of the prototype
			// Apply options from passed object to this.options
			for (var option in options) {
				if (this.options.hasOwnProperty(option))
					this.options[option] = options[option];
			}
			
			// Apply any missing defaults back to passed options object
			_.extend(options, this.options);

			return options;
		}
		
		/**
		 * Triggered when this component is shown
		 *
		 * @name F.Component#component:shown
		 * @event
		 *
		 * @param {Object}	evt					Event object
		 * @param {String}	evt.name			This component's name
		 * @param {F.Component}	evt.component	This component
		 */

		/**
		 * Triggered when this component is hidden
		 *
		 * @name F.Component#component:hidden
		 * @event
		 *
		 * @param {Object}	evt					Event object
		 * @param {String}	evt.name			This component's name
		 * @param {F.Component}	evt.component	This component
		 */
	});
}());

F.ModelComponent = new Class(/** @lends F.ModelComponent# */{
	toString: 'ModelComponent',
	extend: F.Component,
	/**
	 * A component that can load and render a model
	 *
	 * @constructs
	 * @extends F.Component
	 *
	 * @param {Object} options	Options for this component
	 * @param {Object} options.Model	Model class this component will be operating on. Sets this.Model
	 *
	 * @property {Backbone.Model} Model		The model class to operate on. Not an instance of a model, but the model class itself.
	 */
	construct: function(options) {
		this.Model = this.Model || options.Model;
	},
	
	Model: Backbone.Model,
	
	/***
	 * Refresh the model
	 *
	 * @param {Function} callback	Callback to call after successful refresh
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	refresh: function(callback) {
		this.model.fetch({
			success: function() {
				// Trigger model event
				this.model.trigger('loaded');
				
				// Trigger component event
				this.trigger('model:loaded', this.model);
				
				if (typeof callback === 'function')
					callback.call(this, this.model);
			}.bind(this)
		});
		
		return this;
	},
	
	/**
	 * Use a different item model
	 *
	 * @param {Backbone.Model} model
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	_setModel: function(model) {
		if (this.model && this.model.off && this.view) {
			// Unsubscribe from old model's change and render event in case view.remove() was not called
			this.model.off('change', this.view.render);
		}
		
		this.model = model;
		
		if (this.view) {
			// Tell the view to re-render the next time it loads
			this.view.rendered = null;
		}

		return this;
	},
		
	/**
	 * Fetch a model with the given ID
	 *
	 * @param {String} itemId		ID of the item to fetch
	 * @param {Function} [callback]	Callback to execute on successful fetch
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	fetch: function(itemId, callback) {
		var data = {};
		if (itemId !== undefined) { // add the ID passed to the model data
			data[this.Model.prototype.idAttribute] = itemId;
		}
		
		// Create a blank model
		var model = new this.Model(data);
	
		// Fetch model contents
		model.fetch({
			// TBD: add fetch options?
			success: function() {
				// Assign the model to the view
				this._setModel(model);
				
				// Notify
				this.trigger('model:loaded', this.model);
				
				// Call callback
				if (typeof callback === 'function')
					callback.call(this, model);
			}.bind(this)
		});
		
		return this;
	},
	
	/**
	 * Load a Backbone.Model directly or create a model from data
	 *
	 * @param {mixed} modelOrData	Backbone.Model to load or Object with data to create model from
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	load: function(modelOrData) {
		if (modelOrData instanceof Backbone.Model)
			this._setModel(modelOrData);
		else
			this._setModel(new this.Model(modelOrData));
		
		// Notify
		this.trigger('model:loaded', this.model);
		
		return this;
	},
	
	/**
	 * Save a model to the server
	 *
	 * @param {Object} data			Data to apply to model before performing save
	 * @param {Function} callback	Callback to execute on successful fetch
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	save: function(data, callback) {
		if (this.model) {
			if (this.inDebugMode())
				console.log('%s: Saving...', this.toString());
			
			this.model.save(data || {}, {
				success: function() {
					if (this.inDebugMode())
						console.log('%s: Save successful', this.toString());
					
					if (typeof callback === 'function')
						callback.call(this, this.model);
						
					this.trigger('model:saved', this.model);
				}.bind(this),
				error: function(model, error) {
					console.warn('%s: Error saving model', this.toString());
					
					this.trigger('model:saveFailed', {
						model: this.model,
						error: error
					});
				}.bind(this)
			});
		}
		else {
			console.warn('%s: Cannot save, model is not truthy', this.toString());
		}
		return this;
	},
	
	/**
	 * Show this component, optionally fetching an item by ID or assigning a new model before render
	 *
	 * @param {Object} options			Show options
	 * @param {String} options.id		ID of model to fetch from the server before showing
	 * @param {Backbone.Model} options.model	Model to use directly (don't fetch)
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	show: function(options) {
		options = options || {};
		
		if (options.id) {
			if (this.inDebugMode()) {
				console.log('%s: fetching item with ID %s', this.toString(), options.id);
			}
			
			// Load the model by itemId, then show
			this.fetch(options.id, function(model) {
				if (this.inDebugMode()) {
					console.log('%s: fetch complete!', this.toString());
				}
				this.show({
					silent: options.silent
				}); // pass nothing to show and the view will re-render
			});
		}
		else if (options.model) {
			if (this.inDebugMode()) {
				console.log('%s: showing with new model', this.toString(), options.model);
			}
			
			this.load(options.model);
			this.show({
				silent: options.silent
			});
		}
		else
			this.inherited(arguments);
			
		return this;
	}
	
	/**
	 * Triggered after a successful save
	 *
	 * @name F.ModelComponent#model:saved
	 * @event
	 *
	 * @param {Object} evt					Event object
	 * @param {Backbone.Model} evt.model	The model that was saved
	 */
	
	/**
	 * Triggered when save is unsuccessful
	 *
	 * @name F.ModelComponent#model:saveFailed
	 * @event
	 *
	 * @param {Object} evt					Event object
	 * @param {Backbone.Model} evt.model	The model that failed to save
	 */
	
	/**
	 * Triggered when the model is loaded from the server or passed to load()
	 *
	 * @name F.ModelComponent#model:loaded
	 * @event
	 *	
	 * @param {Object} evt					Event object
	 * @param {Backbone.Model} evt.model	The model that was loaded
	 */
});

F.CollectionComponent = new Class(/** @lends F.CollectionComponent# */{
	toString: 'CollectionComponent',
	extend: F.Component,
	options: {
		defaultParams: {}
	},
	
	/**
	 * A component that can load and render a collection
	 *
	 * @constructs
	 * @extends F.Component
	 *
	 * @param {Object} options							Options for this component
	 * @param {Object} [options.defaultParams]			Default parameters to use when fetching this collection
	 *
	 * @property {Object} defaultParams				Default parameters to send with fetches for this collection. Can be overridden at instantiation. Calls to load(fetchParams) will merge fetchParams with defaultParams.
	 * @property {Backbone.Collection} Collection	The collection class to operate on. Not an instance of a collection, but the collection class itself.
	 */
	construct: function(options) {
		// Bind for use as listeners
		this.bind(this.addModel);
		this.bind(this.removeModel);
		this.bind(this.render);
		
		this._useCollection(new this.Collection());
		
		// Default parameters are the prototype params + options params
		this.options.defaultParams = _.extend({}, this.options.defaultParams, options.defaultParams);
		
		// Parameters to send with the request: just copy the default params
		this.params = _.extend({}, this.options.defaultParams);
	
		// Store if this collection has ever been loaded
		this.collectionLoaded = false;
	},
	
	destruct: function() {
		this._releaseCollection();
	},
	
	Collection: Backbone.Collection,
	
	_useCollection: function(collection) {
		// Store collection
		this.collection = collection;
		
		// Re-render when the collection is fetched, items are added or removed
		this.collection.on('add', this.addModel);
		this.collection.on('remove', this.removeModel);
		this.collection.on('loaded', this.render); // custom event we call after fetches
		// this.collection.on('change', this.render); // Don't re-render on change! let the sub-views do that
	},
	
	_releaseCollection: function() {
		// Unbind events
		this.collection.off('add', this.addModel);
		this.collection.off('remove', this.removeModel);
		this.collection.off('loaded', this.render); // custom event we call after fetches
		
		// Remove reference to collection
		this.collection = null;
	},
	
	/**
	 * Refresh this collection with the last parameters used
	 *
	 * @param {Function} callback	Optional callback to execute on successful fetch
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	refresh: function(callback) {
		// Just fetch the collection with the current params
		this.fetch(this.params, callback);
		
		return this;
	},
	
	/**
	 * Callback called when model is added to collection
	 */
	addModel: function(model) {},
	
	/**
	 * Callback called when model is removed from collection
	 */
	removeModel: function(model) {},
	
	/**
	 * Clear the parameters from the last fetch. Useful when using refresh() on a filtered list.
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	clearParams: function() {
		this.params = {};
		
		return this;
	},
	
	/**
	 * Fetch the collection by fetching it from the server
	 *
	 * @param {Object} [fetchParams]	Parameters to pass when fetching
	 * @param {Function} [callback]		Callback to execute on successful fetch
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	fetch: function(fetchParams, callback) {
		// Combine new params, if any, with defaults and store, overwriting previous params
		if (fetchParams)
			this.params = _.extend({}, this.options.defaultParams, fetchParams);
		else // Overwrite old params with defaults and send a request with only default params
			this.params = _.extend({}, this.options.defaultParams);
		
		// Fetch collection contents
		this.collection.fetch({
			data: this.params,
			success: function() {
				// Collection event
				this.collection.trigger('loaded');

				// Component event
				this.trigger('collection:loaded', this.collection);
				this.collectionLoaded = true;
				
				if (typeof callback === 'function')
					callback.call(this, this.collection);
			}.bind(this)
		});
		
		return this;
	},
	
	
	/**
	 * Load a Backbone.Collection directly or create a collection from an array of data
	 *
	 * @param {mixed} collectionOrData	Backbone.Collection to load or Array of Objects with data to create the collection from
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	load: function(collectionOrData) {
		this._releaseCollection();

		if (collectionOrData instanceof Backbone.Collection)
			this._useCollection(collectionOrData);
		else
			this._useCollection(new this.Collection(collectionOrData));
		
		return this;
	},
	
	
	/**
	 * Show this component. Provide options.params to fetch with new parameters. The collection will be fetched before showing if it hasn't already
	 *
	 * @param {Object} options	Pass fetch parameters with options.params
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	show: function(options) {
		options = options || {};
		if (options.params) {
			// Fetch the collection from the server
			this.fetch(options.params, function() {
				this.show({
					silent: options.silent
				});
			});
		}
		else if (!this.collectionLoaded) {
			// Perform initial load
			this.refresh(function() {
				this.show({
					silent: options.silent
				}); // show when we're fully loaded
			});
		}
		else
			this.inherited(arguments);
		
		return this;
	}
	
	
	/**
	 * Triggered when the collection is loaded from the server
	 *
	 * @name F.CollectionComponent#collection:loaded
	 * @event
	 *
	 * @param {Backbone.Collection}	collection	The collection that was loaded
	 */
});

(function() {
	
	/* Views
	*******************/
	// Available as F.FormComponent.prototype.View
	var FormView = F.View.extend(/** @lends F.FormComponent.prototype.View# */{
		tagName: 'form',
		events: {
			// 'submit': 'handleSubmit'	// Can't do it this way: submit event is fired twice!
		}
	});
	
	
	/* Component
	*******************/
	F.FormComponent = new Class(/** @lends F.FormComponent# */{
		toString: 'FormComponent',
		extend: F.ModelComponent,
	
		/**
		 * A component that can display an add/edit form for a model and handle form submission and save events
		 *
		 * @constructs
		 * @extends F.ModelComponent
		 *
		 * @param {Object} options			Options for this component and its view. Options not listed below will be passed to the view.
		 *
		 * @property {Backbone.Model} Model	The model class that the form will manipulate. Not an instance of the model, but the model class itself
		 * @property {Backbone.View} View	The view class that the form will be rendered to
		 * @property {Template} Template	The template that the form will be rendered with
		 */
		construct: function(options) {
			// Create a new edit view that responds to submit events
			this.view = new this.View(_.extend({
				component: this,
				template: this.Template
			}, options));
		
			// Create a blank model
			this.model = new this.Model();
			
			// Have to do it this way: with delegate, submit event is fired twice!
			this.view.$el.on('submit', this.handleSubmit.bind(this));
		},
	
		View: FormView,
	
		Template: null,

		/**
		 * Clears the form by rendering it with a new, empty model
		 *
		 * @returns {F.Component}	this, chainable
		 */
		clear: function() {
			// Create a new model instead of resetting the old one
			this.model = new this.Model();

			// Render the view so it will be blank again
			this.render();
		
			return this;
		},
	
		/**
		 * Handles form submit events
		 *
		 * @param {Event} evt	The jQuery event object
		 */
		handleSubmit: function(evt) {
			// Blur focus to the submit button in order to hide keyboard on iOS
			// This won't work for every situation, such as forms that don't have submit buttons
			this.view.$el.find('[type="submit"]').first().focus();
			
			// Since this is a DOM event handler, prevent form submission
			evt.preventDefault();
			
			// Get the data from the form fields
			var fields = this.view.$el.serializeArray();
		
			// Build a data object from fields
			var data = {};
			_.each(fields, function(field) {
				data[field.name] = field.value;
			});
		
			// Perform the save, passing our modified as the second arg
			this.save(data);
		}
	});

}());
(function() {
	
	/* Views
	*******************/
	
	// Available as F.ListComponent.prototype.View
	var ListView = F.View.extend({
		tagName: 'ul',

		initialize: function(options) {
			options = options || {};

			// Clumsy standard way of calling parent class' initialize method
			F.View.prototype.initialize.apply(this, arguments);

			this.collection = options.collection;
			this.ItemView = options.ItemView || this.ItemView;
			this.ItemTemplate = options.ItemTemplate || this.ItemTemplate;
			
			// Views array for subviews
			this.subViews = [];
			
			// Bind addSuView permanently
			this.addSubView = this.addSubView.bind(this);
		},

		addSubView: function(model) {
			// Create view
			var view = new this.ItemView({
				model: model,
				template: this.ItemTemplate,
				component: this.component
			});
			view.render();
			
			// Add the list item to the List
			this.$el.append(view.el);
			
			// Store the position in the views array
			// Don't store the actual view to prevent circular references
			view.$el.data('viewIndex', this.subViews.length);
			
			// Store in views array for removal later
			this.subViews.push(view);
		},
		
		remove: function() {
			this.removeSubViews();
			
			F.View.prototype.remove.call(this, arguments);
		},

		removeSubView: function(modelOrViewIndex) {
			var view = null;
			var viewIndex = -1;
			if (typeof viewIndex !== 'Number') {
				_.some(this.subViews, function(tmpView, index) {
					if (tmpView && tmpView.model === modelOrViewIndex) {
						view = tmpView;
						viewIndex = index;
					}
				}.bind(this));
			}
			else // get from view index
				view = this.subViews[viewIndex];
				
			if (view) {
				view.remove();
				this.subViews[viewIndex] = undefined;
			}
		},
		
		removeSubViews: function() {
			if (this.subViews.length) {
				_.each(this.subViews, function(view) {
					if (view)
						view.remove();
				});
				
				this.subViews = [];
			}
		},

		render: function() {
			if (this.inDebugMode()) {
				console.log('%s: rendering list view...', this.component && this.component.toString() || 'List view');
			}
			
			if (this.parent && !$(this.el.parentNode).is(this.parent))
				$(this.parent).append(this.el);

			// Remove previous views from the DOM
			this.removeSubViews();
			
			// Add and render each list item
			this.collection.each(this.addSubView);
			
			// Store the last time this view was rendered
			this.rendered = new Date().getTime();

			this.trigger('renderComplete');
			
			return this;
		}
	});

	// Available as F.ListComponent.prototype.ItemView
	var ItemView = F.View.extend({
		tagName: 'li',
		className: 'listItem'
	});

	/* Component
	*******************/
	F.ListComponent = new Class(/** @lends F.ListComponent# */{
		toString: 'ListComponent',
		extend: F.CollectionComponent,
	
		/**
		 * A component that can load and render a collection as a list
		 *
		 * @constructs
		 * @extends F.CollectionComponent
		 *
		 * @param {Object} options						Options for this component and its view. Options not listed below will be passed to the view.
		 *
		 * @property {Backbone.Collection} Collection	The collection class this list will be rendered from
		 * @property {Backbone.View} ListView			The view class this list will be rendered with
		 * @property {Template} ListTemplate			The template this list will be rendered with. Renders to a UL tag by default
		 * @property {Backbone.View} ItemView			The view that individual items will be rendered with
		 * @property {Template} ItemTemplate			The template that individual items will be rendered with
		 */
		construct: function(options) {
			this.view = new this.ListView(_.extend({
				component: this, // pass this as component so ItemView can trigger handleSelect if it likes
				collection: this.collection,
				ItemView: this.ItemView,
				ItemTemplate: this.ItemTemplate,
				events: {
					'click li': 'handleSelect'
				}
			}, options));
			
			this.selectedItem = null;
		},
	
		Collection: Backbone.Collection, // Collection component expects to have prototype.Collection or options.Collection
	
		ListTemplate: null,
		ListView: ListView,
	
		ItemTemplate: null,
		ItemView: ItemView,
	
		addModel: function(model) {
			// Add a subview for this model
			this.view.addSubView(model);
		},
		
		removeModel: function(model) {
			// Add a subview for this model
			this.view.removeSubView(model);			
		},
	
		/**
		 * Get the model associated with a list item
		 *
		 * @param {Node}	Node or jQuery Object to get model from
		 *
		 * @returns {Backbone.Model}	The model associated with the passed DOM element
		 */
		getModelFromLi: function(listItem) {
			return this.view.subViews[$(listItem).data('viewIndex')].model;
		},
	
		/**
		 * Get the view associated with a list item
		 *
		 * @param {Node}	Node or jQuery Object to get model from
		 *
		 * @returns {Backbone.View}	The view associated with the passed DOM element
		 */
		getViewFromLi: function(listItem) {
			return this.view.subViews[$(listItem).data('viewIndex')];
		},
		
		/**
		 * Handles item selection events
		 *
		 * @param {Event} evt	The jQuery event object
		 */
		handleSelect: function(evt) {
			// Get model from DOM el's data
			var model = this.getModelFromLi(evt.currentTarget);
			
			// Store ID of selected item
			this.selectedItem = model.id;
		
			this.trigger('list:itemSelected', {
				listItem: $(evt.currentTarget),
				model: model
			});
		}
		
		
		/**
		 * Triggered when and item in the list is selected by tapping or clicking
		 *
		 * @name F.ListComponent#list:itemSelected
		 * @event
		 *
		 * @param {Object}	evt					Event object
		 * @param {jQuery}	evt.listItem		The list item that was touched
		 * @param {Backbone.Model}	evt.model	The model representing the item in the list
		 */
	});
}());
