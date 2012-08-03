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
	
	show: function() {
		// Make sure the list is always up to date
		if (!this.visible)
			this.refresh();

		// Call the super class' show method
		this.inherited(arguments);
	}
});
