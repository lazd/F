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
			
			// Hold the bubbled event listeners
			this._bubbledEvts = {};
			
			// Make sure the following functions are always called in scope
			// They are used in event handlers, and we want to be able to remove them
			this.bind(this._setCurrentComponent);
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
					if (component.visible === true) {
						// Call show method so view is rendered
						console.log('calling show with silent', component.toString());
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
		hide: function(options) {
			options = options || {};
			
			if (!this.visible)
				return false;
			
			if (F.options.debug) {
				console.log('%s: hiding self', this.toString());
			}
			
			// Hide the view
			if (this.view)
				this.view.hide();
			
			if (!options.silent) {
				// Trigger event after we hide ourself so we're out of the way before the next action
				this.trigger('component:hidden', this.toString(), this);
			}
		
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
		 * @returns {F.Component}	this, chainable
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
			/**
			 * Get this component's name
			 *
			 * @returns {String}	Component's name; either a custom name given when added with addComponent, or toString method or string from prototype
			 */
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
