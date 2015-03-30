Contacts.Details = new PseudoClass({
	toString: 'Details',
	
	/*
	Extending F.ModelComponent gives us an augmented show(options) method
	We'll pass options.id to show() from the router to fetch the model automatically
	*/
	extend: F.ModelComponent,
	
	construct: function(options) {
		// Overwrite defaults directly into options
		_.extend(options, {
			component: this,
			el: options.el,	// Tell it where to render
			template: this.Template
		});
		
		// Just create a view here and we're done; F.ModelComponent takes care of loading and rendering
		this.view = new this.View(options);
	},

	// Note: Always put the Model, Template, and View in the prototype so they can be overridden
	
	// We'll be displaying details for contacts, so indicate we're using that model
	Model: Contacts.Models.Contact,
	
	// Use the template we've defined to render the review
	Template: Contacts.Templates['ContactDetails'],
	
	// Create a view and delegate the events
	View: F.View.extend({
		tagName: 'div',
		events: {
			'click .back': 'navigateBack',
			'click .edit': 'showEditor'
		}
	}),
	
	showEditor: function() {
		// Pass the model with the event
		this.trigger('showEditor', this.model);
	},
	
	navigateBack: function() {
		// Pass ourselves with the event so App.navigateBack knows what to do
		this.trigger('navigateBack', this);
	}
});
