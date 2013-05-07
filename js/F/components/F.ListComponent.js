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
			if (this.options.ListContainer)
				this.$(this.options.ListContainer).append(view.el);
			else
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
			
			if (this.container && !$(this.el.parentNode).is(this.container))
				$(this.container).append(this.el);
			

			if (this.rendered === null) {
				// Render template
				if (this.template) {
					// First, see if the model exists. If so, see if it has toJSON. If so, use model.toJSON. Otherwise, if model exists, use model. Otherwise, use {}
					this.$el.html(this.template({}));
				}
				// Store the last time this view was rendered
				this.rendered = new Date().getTime();
			}

			// Remove previous views from the DOM
			this.removeSubViews();
			
			// Add and render each list item
			this.collection.each(this.addSubView);
			
			if (this.collection.isEmpty()) {
				var EmptyView = this.ItemView;
				var emptyTemplate;
				
				// Determine if we have searched
				if (_.isEqual(this.component.params, this.component.options.defaultParams) && this.component.ListEmptyTemplate) {
					emptyTemplate = this.component.ListEmptyTemplate;
					if (this.component.ListEmptyView)
						EmptyView = this.component.ListEmptyView;
				}
				else if (this.component.NoResultsTemplate) {
					emptyTemplate = this.component.NoResultsTemplate;
					if (this.component.NoResultsView)
						EmptyView = this.component.NoResultsView;
				}
				
				// Proceed if we have the appropritate template
				if (emptyTemplate) {
					var view = new EmptyView({
						template: emptyTemplate,
						component: this.component,
						model: this.component.params
					}).render();
				
					// Add the empty template item to the list or specified list container
					if (this.options.ListContainer)
						this.$(this.options.ListContainer).append(view.el);
					else
						this.$el.append(view.el);
				
					// Store in views array for removal later
					this.subViews.push(view);
				}
			}
			
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
		 * @property {Backbone.Collection} Collection		The collection class this list will be rendered from
		 * @property {Mixed} ListContainer					The DOM element or jQuery object list items should be appended to
		 * @property {Backbone.View} ListView				The view class this list will be rendered with
		 * @property {Template} ListTemplate				The template this list will be rendered with. Renders to a UL tag by default
		 * @property {Backbone.View} ItemView				The view that individual items will be rendered with
		 * @property {Template} ItemTemplate				The template that individual items will be rendered with
		 */
		construct: function(options) {
			this.view = new this.ListView(_.extend({
				component: this, // pass this as component so ItemView can trigger handleSelect if it likes
				collection: this.collection,
				template: this.ListTemplate,
				ItemView: this.ItemView,
				ItemTemplate: this.ItemTemplate,
				ListContainer: this.ListContainer,
				events: _.extend({}, {
					'click li': 'handleSelect'
				}, this.ListView.prototype.events)
			}, options));
			
			this.selectedItem = null;
		},
	
		Collection: Backbone.Collection, // Collection component expects to have prototype.Collection or options.Collection
	
		/** The template render when there are no results **/
		NoResultsTemplate: null,

		/** The view to render when there are no results. Defaults to using ListView. **/
		NoResultsView: null,

		/**
		 * The view to render when the list is empty
		 * @todo give a default here
		**/
		ListEmptyView: null,

		/**
		 * The template to render when a list is empty. Rendered with ListEmptyView if defined, or ItemView otherwise.
		 * @todo give a default here
		**/
		ListEmptyTemplate: null,

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
			var viewIndex = $(listItem).data('viewIndex');
			return (viewIndex !== undefined && this.view.subViews[viewIndex] && this.view.subViews[viewIndex].model) || null;
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
			
			// Only trigger if the target had a model
			// The empty views do not have a model
			if (model) {
				// Store ID of selected item
				this.selectedItem = model.id;
		
				this.trigger('list:itemSelected', {
					listItem: $(evt.currentTarget),
					model: model
				});
			}
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
