(function() {
	function decapitalize(str) {
		return str.slice(0, 1).toLowerCase()+str.slice(1);	
	}
	
	F.Component = new Class(/** @lends F.Component# */{
		toString: 'Component',
		extend: F.EventEmitter,
		
		options: {
			singly: false,		// If true, show only one subcomponent at a time
			visible: false,		// If true, this component is visible immediately
			debug: false,		// If true, enable debug mode for this component
			independent: false	// If true, parent component is never notified when shown
		},
		
		/**
			Generic component class
			
			@extends F.EventEmitter
			@constructs
			
			@param {Object}		[options]					Component options
			@param {Boolean}	[options.singly=false]		Whether this component will allow multiple sub-components to be visible at once. If true, only one component will be visible at a time.
			@param {Boolean}	[options.visible=false]		If true, this component will be visible immediately.
			@param {Boolean}	[options.debug=false]		If true, show debug messages for this component.
			@param {Boolean}	[options.independent=false]	If true, the parent component will never be notified that this component has been shown. Useful for children of singly components that should not cause their siblings to be hidden when they are shown
			
			@property {Object}	options			Default options for this component. These will be merged with options passed to the constructor.
		*/
		construct: function(options) {
			// Merge options up the prototype chain, with passed options overriding
			this.mergeOptions(options);

			// Sub components
			this.components = {};
			
			// Hold the bubbled event listeners
			this._bubbledEvts = {};
			
			// Make sure the following functions are always called in scope
			// They are used in event handlers, and we want to be able to remove them
			this.bind('_handleSubComponentShown');
			this.bind('render');
		},
		
		/**
			Performs initialization operations after all constructors have been called
		*/
		init: function() {
			// Hide view by default
			if (this.view) {
				if (this.view.el) {
					if (this.options.visible === true) {
						// Call show method so view is rendered
						this.show({ silent: true });
					}
					else {
						// Just hide the el
						this.view.$el.hide();
					}
				}
				else {
					console.warn('Component %s has a view without an element', this.toString, this, this.view, this.view.options);
				}
				
				var self = this;
				this.listenTo(this.view, 'renderComplete', function() {
					if (typeof this.handleRenderComplete === 'function')
						this.handleRenderComplete();
					
					self.trigger('view:rendered', {
						component: self,
						view: self.view
					});
				});
			}
		},

		/**
			Perform setup operations before this component is shown for the first time, such as adding sub-components
			
			@name setup
			@memberOf F.Component.prototype
			@function
		*/

		/**
			Perform tear-down operations after this component is hidden, such as removing sub-components. This method will not be called unless the setup() method is defined and the component has been shown previously
			
			@name teardown
			@memberOf F.Component.prototype
			@function
		*/
		
		/**
			Destroy this instance and free associated memory
		*/
		destruct: function() {
			// If this module has a view in this.view, destroy it automatically
			if (this.view)
				this.view.remove();
			
			this.teardownIfSetup();

			// Destroy sub-components
			this.removeComponents();
			
			// Stop listening, we're done
			this.stopListening();
		
			// Clear references to components
			delete this.components;
		},
		
		/**
			Render the view associated with this component, if it has one
			
			@returns {F.Component}	this, chainable
		*/
		render: function() {
			if (this.view) {
				this.view.render();
			}
			
			// Hide our element after render if we're not visible
			if (!this.isVisible())
				this.view.$el.hide();
			
			return this;
		},

		/**
			Binds a method to the execution scope of this instance
			
			@name bind
			@memberOf F.Component.prototype
			@function
			
			@param {String}		name		The name of the method to bind. For example, to bind <code>this.handleClick</code>, you would use <code>this.bind('handleClick')</code>
		*/
		bind: function(name) {
			if (typeof this[name] === 'function')
				this[name] = this[name].bind(this);
		},

		/**
			Destroy the unbind function
			@ignore
		*/
		unbind: undefined,
	
		/**
			Set an event to bubble up the component chain by re-triggering it when the given sub-component triggers it
			
			@param {String}		componentName	Name of the component whose event to bubble
			@param {String}		evt				Name of event to bubble up
			
			@returns {F.Component}	this, chainable
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
			Discontinue bubbling of a given event
			
			@param {String}		componentName	Name of the component whose event to stop bubbling
			@param {String}		evt				Name of event that was set to bubble
			
			@returns {F.Component}	this, chainable
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
			Add an instance of another component as a sub-component.
			
			<code>this[subComponent.toString()]</code> is used to reference the sub-component:
			
			  <code>this.List.show();</code>
			
			You can give a component an optional custom name as the second argument, then reference as such:
			
			 <code>this.myCustomComponent.show();</code>
			
			@param {F.Component}	component		Instance of component
			@param {String}			[componentName]	Optional custom name for this component
			
			@returns {F.Component}	The sub-component that was added
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
		
			// Store this component as the parent
			component.parent = this;
			
			// Show a sub-component when it shows one of it's sub-components
			this.listenTo(component, 'component:shown', this._handleSubComponentShown);
			
			return component;
		},
	
		/**
			Remove and destroy a sub-component
			
			@param {String}		componentName	Component name
			
			@returns {F.Component}	this, chainable
		*/
		removeComponent: function(componentName) {
			var component = this.components[componentName];
		
			if (component !== undefined) {
				this.stopListening(component);
		
				delete this[componentName];
				delete this.components[componentName];
				
				if (typeof component.destruct === 'function')
					component.destruct();
			}
		
			return this;
		},
		
		/**
			Remove and destroy all sub-components
			
			@returns {F.Component}	this, chainable
		*/
		removeComponents: function() {
			for (var componentName in this.components) {
				this.removeComponent(componentName);
			}
			
			return this;
		},
	
		/**
			Handles showing/hiding components in singly mode, triggering of events
			
			@param {Object}		evt		Event object from component:shown
			@ignore
		*/
		_handleSubComponentShown: function(evt) {
			var subComponent = this.components[evt.name];

			if (subComponent !== undefined) {
				// Hide current component(s) if the shown component isn't independent
				if (this.options.singly && !subComponent.options.independent) {
					this.hideAllSubComponents([evt.name]);
					
					// Store currently visible subComponent
					this.currentSubComponent = subComponent;
				}

				this.trigger('subComponent:shown', {
					name: evt.name,
					component: subComponent
				});
			}
		},
	
		/**
			Show this component and emit an event so parent components can show themselves.
			
			@param {Object}		[options]				Options object
			@param {Boolean}	[options.silent=false]	If true, events will not be triggered
			
			@returns {F.Component}	this, chainable
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
			
			// Call setup if we're not setup
			if (!this.options.isSetup && typeof this.setup === 'function') {
				this.setup(options);
				this.options.isSetup = true;
			}
			
			this.options.visible = true;
	
			return this;
		},
	
		/**
			Hide this component
			
			@param {Object}		[options]						Options object
			@param {Boolean}	[options.silent=false]			If true, events will not be triggered
			@param {Boolean}	[options.hideChildren=true]		If false, children will not be hidden automatically
			
			@returns {F.Component}	this, chainable
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
			
			// Perform teardown if necessary
			this.teardownIfSetup();
		
			// Hide children unless otherwise specified
			if (this.options.hideChildren !== false)
				this.hideAllSubComponents();
		
			this.options.visible = false;
	
			return this;
		},

		/**
			Calls teardown() if necessary
		*/
		teardownIfSetup: function() {
			// Call teardown if we're setup
			if (this.options.isSetup && typeof this.teardown === 'function') {
				this.teardown();
				this.options.isSetup = false;
			}
		},
	
		/**
			Check if this component, or F as a whole, is in debug mode and should output debug messages
			
			@returns {Boolean} Component or F is in debug mode
		*/
		inDebugMode: function() {
			return this.options.debug || F.options.debug;
		},
		
		/**
			Check if this component is currently visible
			
			@returns {Boolean} Component is visible
		*/
		isVisible: function() {
			return this.options.visible;
		},

		/**
			Show all sub-components
			
			@param {String[]}	[except]	List of component names not to show. These components will not be hidden if they are already shown
			
			@returns {F.Component}	this, chainable
		*/
		showAllSubComponents: function(except) {
			except = _.isArray(except) ? except : false;
			for (var componentName in this.components) {
				if (except && ~except.indexOf(componentName))
					continue;
				this.components[componentName].show();
			}

			return this;
		},
		
		/**
			Hide all sub-components
			
			@param {String[]}	[except]	List of component names not to hide. These components will not be shown if they are already hidden
			
			@returns {F.Component}	this, chainable
		*/
		hideAllSubComponents: function(except) {
			except = _.isArray(except) ? except : false;
			for (var componentName in this.components) {
				if (except && ~except.indexOf(componentName))
					continue;
				this.components[componentName].hide();
			}
		
			return this;
		},
		
		/**
			Set a custom name for this component. Only useful before passing to {@link F.Component.addComponent}
			
			@param {String}		componentName	Component name
			
			@returns {F.Component}	this, chainable
		*/
		setName: function(customName) {
			/**
				Get this component's name
				
				@returns {String}	Component's name; either a custom name given when added with {@link F.Component.addComponent}, or toString method or string from prototype
			*/
			this.toString = function() {
				return customName;
			};
			
			return this;
		},
		
		/**
			Set properties of this instance from an options object, then remove the properties from the options object
			
			@param {Object}		options		Options object with many properties
			@param {String[]}	props		Properties to copy from options object
			
			@returns {F.Component}	this, chainable
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
			Merge options up the prototype chain. Options defined in the child class take precedence over those defined in the parent class.
		*/
		mergeOptions: function(options) {
			// Create a set of all options in the correct order
			var optionSets = [];
			var proto = this.constructor.prototype;
			while (proto) {
				if (proto.hasOwnProperty('options')) {
					optionSets.unshift(proto.options);
				}
				
				proto = proto.superPrototype;
			}
			
			// All options should end up merged into a new object to avoid overwriting prototype.options
			optionSets.unshift({});
			
			// Add in instance options
			if (options) {
				optionSets.push(options);
			}

			// Perform the merge and store the new options object on the instance
			this.options = _.extend.apply(_, optionSets);
		}

		/**
			Called when view rendering is complete
			
			@name handleRenderComplete
			@memberOf F.Component.prototype
			@function
		*/
		
		/**
			Triggered when a subcomponent is shown
			
			@name F.Component#subComponent:shown
			@event
			
			@param {Object}			evt					Event object
			@param {String}			evt.name			The subcomponent's name
			@param {F.Component}	evt.component		The subcomponent
		*/

		/**
			Triggered when this component is shown
			
			@name F.Component#component:shown
			@event
			
			@param {Object}			evt					Event object
			@param {String}			evt.name			This component's name
			@param {F.Component}	evt.component		This component
		*/

		/**
			Triggered when this component is hidden
			
			@name F.Component#component:hidden
			@event
			
			@param {Object}			evt					Event object
			@param {String}			evt.name			This component's name
			@param {F.Component}	evt.component		This component
		*/
	});
}());
