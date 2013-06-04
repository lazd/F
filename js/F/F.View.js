(function() {
	// A couple functions required to override delegateEvents
	var delegateEventSplitter = /^(\S+)\s*(.*)$/;
	var getValue = function(object, prop) {
		if (!(object && object[prop])) return null;
		return _.isFunction(object[prop]) ? object[prop]() : object[prop];
	};
	
	F.View = Backbone.View.extend(/** @lends F.View# */{
		/**
		 * Generic view class. Provides rendering and templating based on a model, eventing based on a component, and element management based on a container or existing element
		 *
		 * @constructs
		 *
		 * @param {Object} options	Options for this view
		 * @param {Template} options.template	The template to render this view with
		 * @param {Element} [options.el]		The element, jQuery selector, or jQuery object to render this view to. Should not be used with options.container
		 * @param {Element} [options.container]	The element, jQuery selector, or jQuery object to insert this components element into. Should not be used with options.el
		 * @param {Backbone.Model} [options.model]	Instance of a Backbone model to render this view from
		 * @param {Component} [options.component]	The component that events should be delegated to
		 * @param {Object} [options.events]		Backbone events object indicating events to listen for on this view
		 *
		 * @property {Template} template		The template to render this view with
		 *
		 */
		initialize: function() {
			if (this.options.container !== undefined && this.options.el !== undefined) {
				throw new Error('View: should provide either options.el or options.container, never both');
			}
			
			var template = this.options.template || this.template;
			if (template) {
				if (F.options.precompiledTemplates)
					this.template = template;
				else // For pre-compiled templates
					this.template = Handlebars.template(template);
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
			
			// Store container, if provided
			this.container = this.options.container;
			
			// Store the controlling component
			this.component = this.options.component;
			
			// Add events
			if (this.options.events)
				this.delegateEvents(this.options.events);

			// Store the model
			if (this.options.model)
				this.setModel(this.options.model);
			
			this.rendered = null;
		},
		
		setModel: function(model) {
			// Unsubscribe from old model's change and render event in case view.remove() was not called
			if (this.model && this.model.off)
				this.stopListening(this.model);
			
			this.model = model;
			
			// Either the view or the component can have noRerender
			var noRerender = this.options.noRerender || (this.options.component && this.options.component.options.noRerender);
			
			// Add change listeners to the model, but only if has an on method
			if (this.model && this.model.on && !noRerender)
				this.listenTo(this.model, 'change', this.render);
			
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
		
			// Remove change listeners
			if (this.model && this.model.off)
				this.stopListening();
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
			
			// Render template
			if (this.template) {
				// Use this view's model, or the model of the component it's part of
				var model = this.model || (this.component && this.component.model);
				
				// First, see if the model exists. If so, see if it has toJSON. If so, use model.toJSON. Otherwise, if model exists, use model. Otherwise, use {}
				this.$el.html(this.template(model && model.toJSON && model.toJSON() || model || {}));
			}
			
			// Add to container, if not already there
			if (this.container && !$(this.el.parentNode).is(this.container)) {
				$(this.container).append(this.el);
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
		 * @param {Object} events	Events hash to delegate
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
