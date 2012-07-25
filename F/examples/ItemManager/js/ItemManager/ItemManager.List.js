ItemManager.List = new Class({
	toString: 'List',
	extend: F.CollectionComponent,
	
	// F.CollectionComponent can send params when it fetches the collection, provide defaults here
	// Subsequent calls to loadCollection(params, callback) will be merged with default params provided here
	config: {
		params: {
			sort: 'name'
		}
	},
	
	// Collection component expects to have prototype.Collection or config.collection
	Collection: ItemManager.Collections.Items,
		
	// Create a view for our list
	ListTemplate: ItemManager.Templates.List,
	ListView: F.View.extend({
		tagName: 'ul',
		className: 'itemList',
		render: function() {
			if (this.parent && !$(this.el.parentNode).is(this.parent))
				$(this.parent).append(this.el);
				
			// Clear the list
			this.$el.children().remove();
	
			// Add and render each list item
			this.model.each(function(model) {
				var view = new this.component.ItemView({
					model: model,
					template: this.component.ListItemTemplate
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
	}),
	
	// Create a view for our items
	ListItemTemplate: ItemManager.Templates.ListItem,
	ItemView: F.View.extend({
		tagName: 'li',
		className: 'listItem'
	}),
	
	construct: function(config) {
		this.view = new this.ListView({
			el: config.el,
			parent: config.parent,
			model: this.collection,
			template: this.ListItemTemplate,
			component: this,
			events: {
				'click li': 'selectItem'
			}
		});
		
		this.selectedItem = null;
	},
	
	selectItem: function(evt) {
		var listItem = $(evt.currentTarget);
		var model = listItem.data('model');
		this.selectedItem = model.get('_id');
		
		this.trigger('itemSelected', {
			listItem: listItem,
			model: model
		});
	}
});