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
				this.template = this.template || this.options.template;
				// For pre-compiled templates: this.template = Handlebars.template(this.template || this.options.template);
			}
			
			if (this.options.el) {
				// Make sure the element is of the right tag
				var actualNodeName = this.$el[0].nodeName.toUpperCase();
				var requiredNodeName =  this.tagName.toUpperCase();
				
				if (actualNodeName != requiredNodeName) {
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
			if (F.options.debug) {
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
