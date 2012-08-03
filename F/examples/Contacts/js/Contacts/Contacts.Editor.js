Contacts.Editor = new Class({
	toString: 'Editor',
	
	/*
	Extending F.FormComponent also gives us an augmented show(options) method
	We'll pass options.id to show() from the router to fetch the model
	automatically for editing
	*/
	extend: F.FormComponent,
	
	construct: function(options) {
		// Overwrite defaults directly into options
		_.extend(options, {
			template: this.Template,
			component: this
		});
		
		this.view = new this.View(options);
	},
	
	// We'll be loading and saving contacts, so indicate we're using that model
	Model: Contacts.Models.Contact,
	
	// Our template and view should go in the prototype so they can be overridden
	Template: Contacts.Templates['ContactEditor'],

	//Extend the default form component's view
	View: F.FormComponent.prototype.View.extend({
		// Not only do we extend the View, but we also extend its events
		events: _.extend({}, F.FormComponent.prototype.View.prototype.events, {
			'click .back': "navigateBack"
		})
	}),
	
	navigateBack: function() {
		// Pass ourselves with the event so App.navigateBack knows what to do
		this.trigger('navigateBack', this);
	}
});
