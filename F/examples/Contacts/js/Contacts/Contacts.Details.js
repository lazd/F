Contacts.Details = new Class({
	toString: 'Details',
	
	// Extending F.ModelComponent gives us an augmented show(options) method
	// We'll pass options.id or options.model to this show method to fetch or use as is
	extend: F.ModelComponent,
	
	construct: function(options) {
		// Overwrite defaults directly into options
		_.extend(options, {
			template: this.Template,
			component: this
		});
		
		// Just create a view here and we're done; F.ModelComponent takes care of loading and rendering
		this.view = new this.View(options);
	},
	
	// Model, View, and Template are in prototype so they can be overridden
	Model: Contacts.Models.Contact,
	
	// Create a view and delegate the events
	View: F.View.extend({
		tagName: 'div',
		events: {
			'click .back': "navigateBack",
			'click .edit': "showEditor"
		}
	}),
	
	// Use the template we've defined to render the review
	Template: Contacts.Templates['ContactDetails'],
	
	showEditor: function() {
		// Pass the model with the event
		this.trigger('showEditor', this.model);
	},
	
	navigateBack: function() {
		this.trigger('navigateBack', this);
	}
});
