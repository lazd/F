IM.Components.Details = new Class({
	toString: 'Details',
	
	// Extending model component gives us an augmented show(options) method
	// We'll pass options.id or options.model to this show method to fetch or use as is
	extend: F.ModelComponent,
	
	construct: function(options) {
		// Let implementors specify the following properties as options
		this.setPropsFromOptions(options, [
			'ItemTemplate'
		]);
		
		// Just create a view here and we're done; F.ModelComponent takes care of loading and rendering
		this.view = new this.View(_.extend({
			template: this.ItemTemplate,
			component: this
		}, options));
	},
	
	// Model, View, and Template are in prototype so they can be overridden
	Model: IM.Models.Item,
	
	// Create a view and delegate the events
	View: F.View.extend({
		tagName: 'div',
		className: 'itemDetails',
		events: {
			'click .close': "hide"
		}
	}),
	
	// Use the template we've defined to render the review
	ItemTemplate: IM.Templates['ViewItem']
});
