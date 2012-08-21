Contacts.List = new Class({
	toString: 'List',
	extend: F.ListComponent,
	
	/*
	F.CollectionComponent (which F.List inherits from) can send params when it fetches the collection.
	Provide default params as options.params in the prototype of the component.
	
	Params passed to subsequent calls to this.fetch(params) will be merged with default params below
	*/
	options: {
		params: {
			sort: 'name'
		}
	},
	
	// The collection we'll be using
	Collection: Contacts.Collections.Contacts,
	
	// Our custom template
	ItemTemplate: Contacts.Templates.ContactListItem,
	
	handleSelect: function(evt) {
		// Delegating events using Backbone's events property doesn't work with Hammer.js taps, so delegate manually
		if ($(evt.srcElement).hasClass('unlockDelete') || $(evt.srcElement).hasClass('icon-minus')) {  // if the delete button was tapped
			this.handleLockUnlock(evt.currentTarget);
			evt.stopPropagation();
		}
		else if ($(evt.srcElement).hasClass('doDelete')) { // if the delete button was tapped
			this.doDelete(evt.currentTarget);
			evt.stopPropagation();
		}
		else if (!this.deleteMode) { // if anything else was tapped, do standard behavior
			this.endDeleteMode();
			this.inherited(arguments);
		}
	},
	
	endDeleteMode: function() {
		this.view.$('.unlockDelete,.doDelete').hide();
		this.view.$('.view').show();
		this.view.$('.unlockDelete').removeClass('unlocked');
		this.deleteMode = false;
	},
	
	startDeleteMode: function() {
		// Reset state of unlocker
		this.view.$('.unlockDelete').removeClass('unlocked');
		
		// Hide the do view button
		this.view.$('.view').hide();
		
		// Show delete buttons
		this.view.$('.unlockDelete').show();
		
		// Set flat
		this.deleteMode = true;
	},
	
	handleLockUnlock: function(listItem) {
		// Toggle locked/unlocked state
		if ($(listItem).find('.unlockDelete').hasClass('unlocked'))
			this.lockDelete(listItem);
		else
			this.unlockDelete(listItem);
	},
	
	lockDelete: function(listItem) {
		// Hide delete button
		$(listItem).find('.doDelete').fadeOut(75);
		$(listItem).find('.unlockDelete').removeClass('unlocked');
	},
	
	unlockDelete: function(listItem) {
		// Show delete button
		$(listItem).find('.doDelete').fadeIn(75);
		$(listItem).find('.unlockDelete').addClass('unlocked');
	},
	
	doDelete: function(listItem) {
		// Perform actual delete
		this.trigger('deleteItem', this.getModelFromLi(listItem));
	},
	
	show: function() {
		// Make sure the list is always up to date
		if (!this.visible)
			this.refresh();

		// Call the super class' show method
		this.inherited(arguments);
	}
});
