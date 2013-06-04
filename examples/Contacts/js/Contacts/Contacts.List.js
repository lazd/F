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

	// Extend F.ListComponent's view, adding some custom events
	ListView: F.extendView(F.ListComponent, {
		events: {
			'click .unlock': 'handleLockUnlock',
			'click .doDelete': 'handleDelete'
		}
	}),

	handleSelect: function(_super, evt) {
		// Don't select elements if we're in delete mode
		if (!this.editMode) {
			_super.apply(this, arguments);
		}
	},

	endEditMode: function() {
		this.view.$('.unlock, .doDelete').hide();
		this.view.$('.view').show();
		this.view.$('.unlock').removeClass('unlocked');
		this.EditMode = false;
	},
	
	startEditMode: function() {
		// Reset state of unlocker
		this.view.$('.unlock').removeClass('unlocked');
		
		// Hide the do view button
		this.view.$('.view').hide();
		
		// Show delete buttons
		this.view.$('.unlock').show();
		
		// Set flat
		this.editMode = true;
	},

	handleDelete: function(evt) {
		// Get the list item that contains the clicked element
		var $listItem = $(evt.currentTarget).closest('li');

		// Get the model associatd with the list item
		var model = this.getModelFromLi($listItem);

		// Perform actual delete
		this.trigger('deleteItem', model);
	},
	
	handleLockUnlock: function(evt) {
		// Get the list item that contains the clicked element
		var $listItem = $(evt.currentTarget).closest('li');

		// Toggle locked/unlocked state
		if ($listItem.find('.unlock').hasClass('unlocked'))
			this.lockDelete($listItem);
		else
			this.unlockDelete($listItem);
	},
	
	lockDelete: function($listItem) {
		// Hide delete button
		$listItem.find('.doDelete').fadeOut(75);
		$listItem.find('.unlock').removeClass('unlocked');
	},
	
	unlockDelete: function($listItem) {
		// Show delete button
		$listItem.find('.doDelete').fadeIn(75);
		$listItem.find('.unlock').addClass('unlocked');
	}
});
