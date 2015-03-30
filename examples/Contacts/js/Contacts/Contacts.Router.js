Contacts.Router = Backbone.Router.extend({
	/*
	Route definitions
	
	The valid routes that our application will respond to and their parameters
	*/
	routes: {
		"": "showIndex",

		"details/:id": "showDetails",
		
		"edit/:id": "showEditor",
		
		"new": "showEditorNewContact",
		
		"search/:query": "search"
    },
    
	/*
	Routing functions
	
	These functions should only pass parameters to component methods
	*/
	showIndex: function() {
		Contacts.app.index.show();
	},
	
	showDetails: function(id) {
		Contacts.app.details.show({
			id: id
		});
	},
	
	showEditorNewContact: function(id) {
		Contacts.app.newContact();
	},
	
	showEditor: function(id) {
		Contacts.app.editor.show({
			id: id
		});
	},
	
	search: function(query) {
		Contacts.app.index.show().search(query);
	}
});
