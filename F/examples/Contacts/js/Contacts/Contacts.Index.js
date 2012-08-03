Contacts.Index = new Class({
	toString: 'Index',
	extend: F.Component,
	
	construct: function(options) {
		// Overwrite defaults directly into options
		_.extend(options, {
			template: this.Template,
			component: this
		});
		
		/*
		Since we use this as an event listener, don't forget to bind it, rascala!
		Also, since we're going to use handleSearch as a keyup listener, make sure
		it doesn't fire constantly by throttling it
		*/
		this.handleSearch = _.throttle(this.handleSearch.bind(this), 100);
		
		// Create a view for our search/list display
		this.view = new this.View(options).render();
		
		/*
			Item list
			This component will display the list of items
		*/  
		this.addComponent(new this.ListComponent({
			el: this.view.$('.list'),
			Collection: this.Collection,
			visible: true
		}), 'list');
		
		// Hide the search field when the list is done rendering the first time only
		this.list.view.on('renderComplete', _.once(this.hideSearch.bind(this)));
		
		// Bubble the itemSelected event of our list upward
		this.bubble('list', 'itemSelected');
	},
	
	// Our template and view should go in the prototype so they can be overridden
	Template: Contacts.Templates.Index,
	
	View: F.View.extend({
		events: {
			'submit .search': 'handleSearch',		// Search when the user hits enter
			'keyup .searchField': 'handleSearch',	// Filter as the user types
			'click .clearButton': 'clearSearch',	// Clear the search when X is clicked
			'click .new': 'newContact'				// Create a new contact when + is clicked
		}
	}),
	
	// Put the component we'll use in our prototype so it can be overridden
	ListComponent: Contacts.List,
	
	newContact: function() {
		// Tell our parent to switch to the contact editor component with a blank contact
		this.trigger('newContact');
	},
	
	show: function() {
		var wasVisible = this.visible;
		
		this.inherited(arguments);
		
		// Hide the search field on show
		if (!wasVisible)
			this.hideSearch();
	},
	
	hideSearch: function() {
		// Scroll down so search disappears
		this.view.$('.scrollContainer').animate({
			scrollTop: 16*3
		}, 250);
	},
	
	search: function(query) {
		// Update the hash
		Contacts.router.navigate('search/'+query, { trigger: false });
		
		// Set the input field text in case this came from the router
		// Only do this if the value is different to avoid selection issues
		if (this.view.$('input').val() != query)
			this.view.$('input').val(query);
		
		// Show the clear search button
		this.view.$('.clearButton').show();
		
		// Send the query to the server
		this.list.load({
			query: query
		});
	},
	
	clearSearch: function() {
		// Clear the value of the filter field
		this.view.$('input').val('');
		
		// Clears fetch parameters before fetching
		this.list.load();
		
		// Remove the clear button
		this.view.$('.clearButton').hide();	
	},
	
	handleSearch: function(evt) {
		// Get the search term from the form
		var query = this.view.$('input').val();
		
		if (query.length) {
			// NOTE: Search won't find newly added entries or modified entries in this faked API example
			// Perform the fetch on the collection with the query term
			this.search(query);
		}
		else {
			// Clear the search; will fetch collection without params
			this.clearSearch();
		}
		
		return false;
	}
});
