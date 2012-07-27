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
