Contacts.Editor = new Class({
	toString: 'Editor',
	extend: F.FormComponent,
	
	construct: function(options) {
		// Overwrite defaults directly into options
		_.extend(options, {
			template: this.Template,
			component: this
		});
		
		this.view = new this.View(options);
	},
	
	Model: Contacts.Models.Contact,
	
	View: F.FormComponent.prototype.View.extend({
		events: _.extend({}, F.FormComponent.prototype.View.prototype.events, {
			'click .back': "navigateBack"
		})
	}),
	
	Template: Contacts.Templates['ContactEditor'],
	
	navigateBack: function() {
		this.trigger('navigateBack', this);
	}
});
