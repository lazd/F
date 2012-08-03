(function() {
	
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
			
			// Views array for subviews
			this.views = [];
		},

		remove: function() {
			this.removeSubViews();
			
			F.View.prototype.remove.call(this, arguments);
		},

		removeSubViews: function() {
			if (this.views.length) {
				_.each(this.views, function(view) {
					view.remove();
				});
				
				this.views = [];
			}
		},

		render: function() {
			if (F.options.debug) {
				console.log('%s: rendering list view...', this.component && this.component.toString() || 'List view');
			}
			
			if (this.parent && !$(this.el.parentNode).is(this.parent))
				$(this.parent).append(this.el);

			// Remove previous views from the DOM
			this.removeSubViews();
			
			// Add and render each list item
			this.collection.each(function(model) {
				var view = new this.ItemView({
					model: model,
					template: this.ItemTemplate,
					component: this.component
				});
				view.render();
				
				// Store model
				view.$el.data('model', model);
				
				// Add the list item to the List
				this.$el.append(view.el);
				
				// Store in views array for removal later
				this.views.push(view);
			}.bind(this));
			
			// Store the last time this view was rendered
			this.rendered = new Date().getTime();

			_.defer(function() {
				this.trigger('renderComplete');
			}.bind(this));
			
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
	
		/**
		 * Get the model associated with a list item
		 *
		 * @param {Node}	Node or jQuery Object to get model from
		 *
		 * @returns {Backbone.Model}	The model associated with the passed DOM element
		 */
		getModelFromLi: function(listItem) {
			return $(listItem).data('model');
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
		
			this.trigger('itemSelected', {
				listItem: $(evt.currentTarget),
				model: model
			});
		}
	});
}());
