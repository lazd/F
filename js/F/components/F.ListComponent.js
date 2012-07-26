(function() {
	
	/* Views
	*******************/
	
	// Available as F.ListComponent.prototype.View
	var ListView = F.View.extend(/** @lends F.ListComponent.prototype.View# */{
		tagName: 'ul',

		/**
		 * View class that renders a collection as a list
		 *
		 * @constructs
		 * @extends F.View
		 */
		initialize: function(options) {
			options = options || {};

			// Clumsy backbone way of calling parent class' constructor
			F.View.prototype.initialize.apply(this, arguments);

			this.collection = options.collection;
			this.ItemView = options.ItemView || this.ItemView;
			this.ItemTemplate = options.ItemTemplate || this.ItemTemplate;
		},

		/**
		 * Render the list as individual item
		 */
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
	var ItemView = F.View.extend(/** @lends F.ListComponent.prototype.ItemView# */{
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
		 * @property {Backbone.Collection} Collection	The collection class this list will be rendered from
		 * @property {Backbone.View} View				The view class this list will be rendered to
		 * @property {Template} ListTemplate			The template this list will be rendered with, optional if you just want a bare <ul>
		 * @property {Backbone.View} ItemView			The view that individual items will be rendered to
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

