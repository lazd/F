Contacts.Router = Backbone.Router.extend({
	// Define the valid routes that our application will respond to
	routes: {
		"": "showIndex",

		"details/:id": "showDetails",
		
		"edit/:id": "showEditor",
		
		"new": "showEditorNewContact",
		
		"search/:query": "search"
    },
    
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
		Contacts.app.index.search(query);
	}
});
