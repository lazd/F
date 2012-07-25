(function() {
	function decapitalize(str) {
		return str.slice(0, 1).toLowerCase()+str.slice(1);	
	}
	
	/**
	 * Generic component class
	 *
	 * @class
	 * @extends F.EventEmitter
	 */
	F.Component = new Class({
		toString: 'Component',
		extend: F.EventEmitter,
		
		/** @constructor */
		construct: function(config) {
			// Looks funny, but it modified config back to the arguments object
			$.extend(
				config, 
				$.extend({}, {
					singly: true,
					visible: false
				}, this.config || {}, config)
			);
		
			// Sub components
			this.components = {};
		
			// Show only one subcomponent at a time
			this.singly = config.singly;
		
			// Visible or not
			this.visible = config.visible;
		
			// Make sure the following functions are always called in scope
			this.bind(this._setCurrentComponent); // shorthand for this._setCurrentComponent = this._setCurrentComponent.bind(this);
			this.bind(this.render);
		
			if (this.visible) {
				// Show the component once the call chain has returned
				_.defer(function() {
					this.show({
						silent: true
					});
				}.bind(this));
			}
			else {
				// Hide the component once the call chain has returned
				_.defer(function() {
					if (this.view && this.view.el) {
						this.view.$el.hide();
					}
				}.bind(this));
			}
		},
		
		/** @lends F.Component# */
		
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
		 */
		render: function() {
			if (this.view)
				this.view.render();
		},
	
		/**
		 * Add an instance of another component as a sub-component.
		 *
		 *  this[subComponent.toString()] is used to reference the sub-component:
		 *  		
		 *  		this.List.show();
		 *  		
		 *  You can give a component an optional custom name as the second argument, then reference as such:
		 *  		
		 *  		this.myCustomComponent.show();
		 *  		
		 *
		 * @param {F.Component} component	Instance of component
		 * @param {Function} componentName	Optional custom name for this component
		 *
		 * @returns {F.Component}	The sub-component that was added
		 */
		addComponent: function(component, componentName) {
			// Tell component its new name, if provided
			if (componentName)
				component.setName(componentName);
		
			// Get the name of the component
			componentName = decapitalize(component.toString());
		
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
				component.off('component:shown', this._componentShowHandler);
		
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
				// this.show(); // should not be necessary?
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
			if (F.config.debug) {
				// Don't show if already shown
				if (this.visible) {		
					console.log('%s: not showing self; already visible', this.toString());
				}
				else
					console.log('%s: showing self', this.toString());
			}
		
			if (!this.visible && !options.silent) {
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
		
			if (F.config.debug) {
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
		 * Hide a sub-component of this component by name. Only useful if config.singly is false
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
		}
	});
}());
