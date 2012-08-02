Contacts.List = new Class({
	toString: 'List',
	extend: F.ListComponent,
	
	// F.CollectionComponent (which F.List inherits from) can send params when it fetches the collection, provide defaults here
	// Params passed to subsequent calls to this.load(params) will be merged with default params provided here
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
		// Call the super class' show method
		this.inherited(arguments);
		
		// Make sure the list is always up to date
		this.refresh();
	}
});
