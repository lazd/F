ItemManager.Details = new Class({
	toString: 'Details',
	
	// Extending model component gives is load and an augmented show method which takes options.id or options.model
	extend: F.ModelComponent,
	
	construct: function(options) {
		// Just create a view here and we're done; F.ModelComponent takes care of loading and rendering
		this.view = new this.View(_.extend(options, {
			template: this.ItemTemplate,
			component: this
		}));
	},
	
	// Model, View, and Template are in prototype so they can be overridden
	Model: ItemManager.Models.Item,
	View: F.View.extend({
		tagName: 'div',
		className: 'itemDetails'
	}),
	ItemTemplate: ItemManager.Templates['Item']
});
