ItemManager.Details = new Class({
	toString: 'Details',
	
	// Extending model component gives is loadModel and an augmented show method which takes config.id or config.model
	extend: F.ModelComponent,
	
	// Model, View, and Template are in prototype so they can be overridden
	Model: ItemManager.Models.Item,
	View: F.View.extend({
		tagName: 'div',
		className: 'itemDetails'
	}),
	ItemTemplate: ItemManager.Templates['Item'],
	
	construct: function(config) {
		// Just create a view here and we're done; F.ModelComponent takes care of loading and rendering
		this.view = new this.View({
			el: config.el,
			parent: config.parent,
			template: this.ItemTemplate,
			component: this
		});
	}
});
