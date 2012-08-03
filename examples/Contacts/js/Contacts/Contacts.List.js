Contacts.List = new Class({
	toString: 'List',
	extend: F.ListComponent,
	
	/*
	F.CollectionComponent (which F.List inherits from) can send params when it fetches the collection.
	Provide default params as options.params in the prototype of the component.
	
	Params passed to subsequent calls to this.load(params) will be merged with default params below
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
	
	ListView: F.ListComponent.prototype.ListView.extend({
		// Remove the click event from ListView, we'll target tap since we have Hammer.js
		events: {}
	}),
	
	// Extend the default list item's view
	// We want to target tap and swipe events on our list
	ItemView: F.ListComponent.prototype.ItemView.extend({
		events: {
			'swipe': 'handleSwipe',
			'tap': 'handleTap'
		}
	}),
	
	handleTap: function(evt) {
		// Delegating events using Backbone's events property doesn't work with Hammer.js taps, so delegate manually
		if ($(evt.originalEvent.target).hasClass('delete')) // if the delete button was tapped
			this.handleDelete(evt.currentTarget);
		else // if anything else was tapped
			this.handleSelect(evt);
	},
	
	handleDelete: function(listItem) {
		this.trigger('deleteItem', this.getModelFromLi(listItem));
	},
	
	handleSwipe: function(evt) {
		if (evt.direction == 'right') {
			$(evt.currentTarget).find('.delete').show();
		}
	},
	
	show: function() {
		// Make sure the list is always up to date
		if (!this.visible)
			this.refresh();

		// Call the super class' show method
		this.inherited(arguments);
	}
});
