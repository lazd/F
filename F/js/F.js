/**
 * Crockford's new_constructor pattern, modified to allow walking the prototype chain, automatic init/destruct calling of super classes, and easy toString methods
 *
 * @param {Object} descriptor						Descriptor object
 * @param {String or Function} descriptor.toString	A string or method to use for the toString of this class and instances of this class
 * @param {Object} descriptor.extend				The class to extend
 * @param {Function} descriptor.construct			The constructor (setup) method for the new class
 * @param {Function} descriptor.destruct			The destructor (teardown) method for the new class
 * @param {Anything} descriptor.*					Other methods and properties for the new class
 *
 * @returns {Class} The created class.
*/
function Class(descriptor) {
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
	 * @param {Arguments} args	Unadultrated arguments array from calling function
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
			// Store our inherted function
			var oldInherited = this.inherited;
			
			// Overwrite our inherted function with that of the prototype so the called function can call its parent
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
	
	/**
	 * Binds a method to the execution scope of this instance
	 *
	 * @param {Function} func	The this.method you want to bind
	 */
	prototype.bind = function(func) {
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
	
	// The constructor, as far as JS is concerned, is actually our instance generator
	prototype.constructor = instanceGenerator;
	
	return instanceGenerator;
}

if (!Object.create) {
	/**
	 * Polyfill for Object.create. Creates a new object with the specified prototype object.
	 * 
	 * @author Mozilla MDN https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create/
	 *
	 * @param {Object} o	The prototype to create a new object with
	 */
	Object.create = function (o) {
		if (arguments.length > 1) {
			throw new Error('Object.create implementation only accepts the first parameter.');
		}
		function F() {}
		F.prototype = o;
		return new F();
	};
}
/** 
 * The main F namespace.
 *	
 * @property {Object} options	Options for all F components. Set F.options.debug=true to see debug messages.
 *@namespace 
*/
var F = F || {};

try {
	window['ƒ'] = F;
}
catch (err) {
	console.log("ƒ: could not set ƒ variable");
}

F.options = {
	debug: false
};
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
(function() {
	// A couple functions required to override delegateEvents
	var delegateEventSplitter = /^(\S+)\s*(.*)$/;
	var getValue = function(object, prop) {
		if (!(object && object[prop])) return null;
		return _.isFunction(object[prop]) ? object[prop]() : object[prop];
	};
	
	F.View = Backbone.View.extend(/** @lends F.View# */{
		/**
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
		 * @param {Component} [options.component]	The compnent that events should be delegated to
		 * @param {Object} [options.events]		Backbone events object indicating events to listen for on this view
		 *
		 * @property {Template} template		The template to render this view with
		 *
		 */
		initialize: function() {
			if (this.template || this.options.template) {
				this.template = this.template || this.options.template;
				// For preocompiled templates: this.template = Handlebars.template(this.template || this.options.template);
			}
			
			if (this.options.el) {
				// TBD: validate options.el has proper tag based on this.tag
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
			
			this.rendered = null;
		},
		
		/**
		 * Get the number of miliseconds seconds since the view was last rendered
		 *
		 * @returns {number} Number of miliseconds since this view was rendered
		 */
		age: function() {
			return this.rendered !== null ? new Date().getTime() - this.rendered : -1;
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

		/**
		 * Render the view
		 *
		 * @returns {F.View}	this, chainable
		 */
		render: function() {
			if (this.template) {
				// Render template
				var model = this.model || this.component && this.component.model;
				this.$el.html(this.template(model && model.toJSON() || {}));
			}
			
			// Add to parent, if not already there
			if (this.parent && !$(this.el.parentNode).is(this.parent))
				$(this.parent).append(this.el);
		
			// Store the last time this view was rendered
			this.rendered = new Date().getTime();
			
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
		/**
		 * Generic component class
		 *
		 * @extends F.EventEmitter
		 * @constructs
		 *
		 * @param {Object} options	Component options
		 * @param {Boolean} options.singly		Whether this component will allow multiple sub-components to be visible at once. If true, only one component will be visible at a time.
		 * @param {Boolean} options.visible		If true, this component will be visible immediately.
		 *
		 * @property {Object} options	Default options for this component. These will be merged with options passed to the constructor.
		 */
		construct: function(options) {
			// Looks funny, but it modifies options with defaults and makes them available to other constructors
			this.mergeOptions({
				singly: false, // Show only one subcomponent at a time
				visible: false // Visible immediately or not
			}, options);
			
			// Store options into object
			// TBD: figure out what to do with these props if set on the object already
			this.setPropsFromOptions(options, [
				'singly', 
				'visible'
			]);
			
			// Sub components
			this.components = {};
			
			// Make sure the following functions are always called in scope
			// They are used in event handlers, and we want to be able to remove them
			this.bind(this._setCurrentComponent);
			this.bind(this.render);
			
			if (this.visible) {
				// Show the component once the call chain has returned
				_.defer(function() {
					this.show({
						silent: true
					});
				}.bind(this));
			}
		},
		
		/**
		 * Destroy this instance and free associated memory
		 */
		destruct: function() {
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
				if (F.options.debug)
					console.warn('%s: Rendering', this.toString());
					
				this.view.render();
			}
			
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
					component.view.$el.hide();
				}
				else {
					console.warn('Component %s has a view without an element', componentName, component, component.view, component.view.options);
				}
			}
		
			// Show a sub-component when it shows one of it's sub-components
			component.on('component:shown', this._setCurrentComponent);
			
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
				component.off('component:shown', this._setCurrentComponent);
		
				delete this[componentName];
				delete this.components[componentName];
			}
		
			return this;
		},
	
	
		/**
		 * Handles showing/hiding components in singly mode
		 *
		 * @param {Function} componentName	Component name
		 */
		_setCurrentComponent: function(componentName) {
			var newComponent = this.components[componentName];
		
			if (newComponent !== undefined) {
				// hide current component(s) for non-overlays
				if (this.singly && !newComponent.overlay) {
					this.hideComponents();
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
			if (F.options.debug) {
				// Don't show if already shown
				if (this.visible) {		
					console.log('%s: not showing self; already visible', this.toString());
				}
				else
					console.log('%s: showing self', this.toString());
			}
		
			if (!options.silent) {
				// Always trigger event before we show ourself so others can hide/show
				this.trigger('component:shown', this.toString(), this);	
			}
		
			// Always call show on the view so it has a chance to re-render
			if (this.view) {
				this.view.show();
			}
		
			this.visible = true;
	
			return this;
		},
	
		/**
		 * Hide this component
		 *
		 * @returns {F.Component}	this, chainable
		 */
		hide: function() {
			if (!this.visible)
				return false;
			
			if (F.options.debug) {
				console.log('%s: hiding self', this.toString());
			}
			
			// Hide the view
			if (this.view)
				this.view.hide();
			
			// Trigger event after we hide ourself so we're out of the way before the next action
			this.trigger('component:hidden', this.toString(), this);
		
			this.visible = false;
	
			return this;
		},
	
		/**
		 * Check if this component is currently visible
		 *
		 * @returns {Boolean} Component is visible
		 */
		isVisible: function() {
			return this.visible;
		},
	
		/**
		 * Hide all sub-components
		 *
		 */
		hideComponents: function() {
			for (var componentName in this.components) {
				this.hideComponent(componentName);
			}
		
			return this;
		},
		
		/**
		 * Hide a sub-component of this component by name. Only useful if options.singly is false
		 *
		 * @param {Function} componentName	Component name
		 *
		 * @returns {F.Component}	this, chainable
		 */
		hideComponent: function(componentName) {
			var component = this.components[componentName];
			if (component !== undefined) {
				if (component.isVisible()) {
					// hide the component's element
					component.hide();
				}
			}
			else {
				console.warn(this.toString()+': cannot hide component %s, component not found', componentName);
			}
		
			return this;
		},
	
		/**
		 * Show a sub-component of this component by name.
		 *
		 * @param {Function} componentName	Component name
		 *
		 * @returns {F.Component}	this, chainable
		 */
		showComponent: function(componentName) {
			// Show the sub section, if not already showing
			var newComponent = this.components[componentName];
		
			if (newComponent !== undefined) {
				if (!newComponent.isVisible()) {
					// Hide the old component and show ourselves
					this._setCurrentComponent(componentName);
			
					// Show new component
					newComponent.show();
				}
				else {
					console.log(this.toString()+': not showing component %s, already visible', componentName);
				}
			}
			else {
				console.warn(this.toString()+': Cannot show component "'+componentName+'", not found');
			}
		
			return this;
		},
		
		/**
		 * Set a custom name for this component. Only useful before passing to addComponent
		 *
		 * @param {Function} componentName	Component name
		 *
		 * @returns {F.Component}	this, chainable
		 */
		setName: function(customName) {
			this.toString = function() {
				return customName;
			};
			
			return this;
		},
		
		/**
		 * Set properties of this instance from an options object, then remove the properties from the options object
		 *
		 * @param {Object} options	Options object with many properties
		 * @param {Array} props		Properties to copy from options object
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
		 * Merges options in the following order:
		 *   Instance Options
		 *   Class options
		 *   Class defaults
		 *
		 * @param {Object} defaults	Default options object
		 * @param {Object} options	Instance options object (argument to constructor)
		 *
		 * @returns {Object}	Merged options object
		 */
		mergeOptions: function(defaults, options) {
			_.extend(
				options, 
				_.extend({}, defaults || {}, this.options || {}, options)
			);
			
			return options;
		}
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
	 * @param {Function} Callback to call after successful refresh
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	refresh: function(callback) {
		this.model.fetch({
			success: function() {
				this.trigger('modelLoaded');
				
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
		if (this.model) {
			// Unsubscribe from old model's change event
			this.model.off('change', this.render);
		}
		
		this.model = model;
		
		if (this.view) {
			// Tell the view to re-render the next time it loads
			this.view.rendered = null;
		}
		
		// Subscribe to new model's change event
		this.model.on('change', this.render);
		
		return this;
	},
		
	/**
	 * Load an item's model by ID or by model
	 *
	 * @param {Function} itemIdOrModel	ID of the item to fetch or already fetched model
	 * @param {Function} callback	Callback to execute on successful fetch
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	load: function(itemIdOrModel, callback) {
		// Load models 
		if (typeof itemIdOrModel === 'string' || typeof itemIdOrModel === 'number') {
			// Create a blank model
			var data = {};
			data[this.Model.prototype.idAttribute] = itemIdOrModel;
			var model = new this.Model(data);
		
			// Fetch model contents
			model.fetch({
				// TBD: add fetch options
				success: function() {
					// Assign the model to the view
					this._setModel(model);
					
					// Noftify
					this.trigger('modelLoaded');
					
					// Call callback
					if (typeof callback === 'function')
						callback.call(this, model);
				}.bind(this)
			});
		}
		else {
			// It must be an object
			this._setModel(itemIdOrModel);
		}
		
		return this;
	},
	
	/**
	 * Save a model to the server
	 *
	 * @param {Function} callback	Callback to execute on successful fetch
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	save: function(data, callback) {
		if (this.model) {
			if (F.options.debug)
				console.log('%s: Saving...', this.toString());
			
			this.model.save(data || {}, {
				success: function() {
					if (F.options.debug)
						console.log('%s: Save successful', this.toString());
					
					if (typeof callback === 'function')
						callback.call(this, this.model);
						
					this.trigger('saved', this.model);
				}.bind(this),
				error: function() {
					// TBD: add meaningful data to event properties
					console.warn('%s: Error saving model', this.toString());
					
					this.trigger('saveFailed', this.model);
				}.bind(this)
			});
		}
		else {
			console.warn('%s: Cannot save, model is not truthy', this.toString());
		}
		return this;
	},
	
	/**
	 * Show this component, optionally fetching an item by ID or assiging a new model before render
	 *
	 * @param {Object} options
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	show: function(options) {
		options = options || {};
		
		if (options.id) {
			if (F.options.debug) {
				console.log('%s: fetching item with ID %s', this.toString(), options.id);
			}
			
			// Load the model by itemId, then show
			this.load(options.id, function(model) {
				if (F.options.debug) {
					console.log('%s: fetch complete!', this.toString());
				}
				this.show(); // pass nothing to show and the view will re-render
			});
		}
		else if (options.model) {
			console.log('%s: showing with new model', this.toString(), options.model);
			this.load(options.model);
			this.show();
		}
		else
			this.inherited(arguments);
			
		return this;
	}
});
F.CollectionComponent = new Class(/** @lends F.CollectionComponent# */{
	toString: 'CollectionComponent',
	extend: F.Component,
	
	/**
	 * A component that can load and render a collection
	 *
	 * @constructs
	 * @extends F.Component
	 *
	 * @param {Object} options							Options for this component
	 * @param {Backbone.Collection} options.Collection	The collection class this component should operate on. Sets this.Collection
	 * @param {Object} [options.defaultParams ]			Default parameters to use when fetching this collection
	 *
	 * @property {Object} defaultParams				Default parameters to send with fetches for this collection. Can be overridden at instantiation. Calls to load(fetchParams) will merge fetchParams with defaultParams.
	 * @property {Backbone.Collection} Collection	The collection class to operate on. Not an instance of a collection, but the collection class itself.
	 */
	construct: function(options) {
		// Store the collection class
		this.setPropsFromOptions(options, [
			'Collection'
		]);
		
		// Create a collection
		this.collection = new this.Collection();
		
		// Re-render when the collection resets
		this.collection.on('reset', this.render);
		
		// Default parameters are the prototype params + options params
		this.defaultParams = _.extend({}, this.defaultParams, options.defaultParams);
		
		// Parameters to send with the request: just copy the default params
		this.params = _.extend({}, this.defaultParams);
	
		// Store if this collection has ever been loaded
		this.collectionLoaded = false;
	},
	
	Collection: Backbone.Collection,
	
	/**
	 * Get the collection associated with this component
	 *
	 * @returns {Backbone.Collection}	The collection associated with this component
	 */
	getCollection: function() {
		return this.collection;
	},
	
	/**
	 * Refresh this collection with the last parameters used
	 *
	 * @param {Function} callback	Optional callback to execute on successful fetch
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	refresh: function(callback) {
		// Just load the colleciton with the current params
		this.load(this.params, callback);
		
		return this;
	},
	
	/**
	 * Fetch the collection with optional 
	 *
	 * @param {Object} fetchParams	Optional parameters to pass when fetching
	 * @param {Function} callback	Optional callback to execute on successful fetch
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	load: function(fetchParams, callback) {
		// Combine new params, if any, with defaults and store, overwriting previous params
		if (fetchParams)
			this.params = _.extend({}, this.defaultParams, fetchParams);
		
		// Fetch collection contents
		this.collection.fetch({
			data: this.params,
			success: function() {
				this.trigger('collectionLoaded');
				this.collectionLoaded = true;
				
				if (typeof callback === 'function')
					callback.call(this, this.collection);
			}.bind(this)
		});
		
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
			// Load the collection by itemId
			this.load(options.params, function() {
				this.show();
			});
		}
		else if (!this.collectionLoaded) {
			// Perform initial load
			this.refresh(function() {
				this.show(); // show when we're fully loaded
			});
		}
		else
			this.inherited(arguments);
			
		return this;
	}
});
(function() {
	
	/* Views
	*******************/
	// Available as F.FormComponent.prototype.View
	var FormView = F.View.extend(/** @lends F.FormComponent.prototype.View# */{
		tagName: 'form',
		events: {
			'submit': 'handleSubmit'
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
		 * @param {Object} options					Options for this component and its view. Options not listed below will be passed to the view.
		 * @param {Backbone.Model} options.Model	The model class that the form will manipulate. Not an instance of the model, but the model class itself
		 * @param {Backbone.View} options.View		The view class that the form will be rendered to
		 * @param {Template} options.Template		The template that the form will be rendered with
		 *
		 * @property {Backbone.Model} Model	The model class that the form will manipulate. Not an instance of the model, but the model class itself
		 * @property {Backbone.View} View	The view class that the form will be rendered to
		 * @property {Template} Template	The template that the form will be rendered with
		 */
		construct: function(options) {
			this.setPropsFromOptions(options, [
				'Model',
				'View',
				'Template'
			]);
		
			// Create a new edit view that responds to submit events
			this.view = new this.View(_.extend({
				component: this,
				template: this.Template
			}, options));
		
			// Create a blank model
			this.model = new this.Model();
		},
	
		View: FormView,
	
		Template: null,

		/**
		 * Clears the form by rendering it with a new, empty model
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
			// Get the data from the form fields
			var fields = this.view.$el.serializeArray();
		
			// Build a data object from fields
			var data = {};
			_.each(fields, function(field) {
				data[field.name] = field.value;
			});
		
			// Perform the save, passing our modified as the second arg
			this.save(data);

			// Since this is a DOM event handler, prevent form submission
			return false;
		}
	});

}());(function() {
	
	/* Views
	*******************/
	
	// Available as F.ListComponent.prototype.View
	var ListView = F.View.extend({
		tagName: 'ul',

		initialize: function(options) {
			options = options || {};

			// Clumsy backbone way of calling parent class' constructor
			F.View.prototype.initialize.apply(this, arguments);

			this.collection = options.collection;
			this.ItemView = options.ItemView || this.ItemView;
			this.ItemTemplate = options.ItemTemplate || this.ItemTemplate;
		},

		render: function() {
			if (this.parent && !$(this.el.parentNode).is(this.parent))
				$(this.parent).append(this.el);

			// Clear the list
			this.$el.children().remove();

			// Add and render each list item
			this.collection.each(function(model) {
				var view = new this.ItemView({
					model: model,
					template: this.ItemTemplate
				});
				view.render();

				// Store model
				view.$el.data('model', model);

				// Add the list item to the List
				this.$el.append(view.el);
			}.bind(this));

			// Store the last time this view was rendered
			this.rendered = new Date().getTime();

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
		 * @param {Object} options							Options for this component and its view. Options not listed below will be passed to the view.
		 * @param {Backbone.Collection} options.Collection	The collection class this list will be rendered from
		 * @param {Backbone.View} options.ListView			The view class this list will be rendered with
		 * @param {Template} [options.ListTemplate]			The template this list will be rendered with. Renders to a UL tag by default
		 * @param {Backbone.View} options.ItemView			The view that individual items will be rendered with
		 * @param {Template} options.ItemTemplate			The template that individual items will be rendered with
		 *
		 * @property {Backbone.Collection} Collection	The collection class this list will be rendered from
		 * @property {Backbone.View} ListView			The view class this list will be rendered with
		 * @property {Template} ListTemplate			The template this list will be rendered with. Renders to a UL tag by default
		 * @property {Backbone.View} ItemView			The view that individual items will be rendered with
		 * @property {Template} ItemTemplate			The template that individual items will be rendered with
		 */
		construct: function(options) {
			// Set object properties from options object, removing them from the object thereafter
			this.setPropsFromOptions(options, [
				'Collection',
				'ListTemplate',
				'ListView',
				'ItemTemplate',
				'ItemView'
			]);
			
			this.view = new this.ListView(_.extend({
				component: this,
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
	
		/**
		 * Handles item selection events
		 *
		 * @param {Event} evt	The jQuery event object
		 */
		handleSelect: function(evt) {
			var listItem = $(evt.currentTarget);
			var model = listItem.data('model');
			this.selectedItem = model.id;
		
			this.trigger('itemSelected', {
				listItem: listItem,
				model: model
			});
		}
	});
}());

