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
		
		// Hide the search field when the list is done rendering the first time only, if it's blank
		// It won't be blank if the search was loaded from the hash
		this.list.view.on('renderComplete', _.once(function() {
			if (this.view.$('input').val() == '')
				this.hideSearch();
		}.bind(this)));
		
		// Hide the search field when we show the view
		this.on('component:shown', function() {
			// Defer this so we give the router a chance to set the input field's value
			_.defer(function() {
				if (this.view.$('input').val() == '')
					this.hideSearch();
			}.bind(this));
		});
		
		// Bubble specific events of our list upward to the app
		this.bubble('list', 'list:itemSelected');
		this.bubble('list', 'deleteItem');
	},
	
	// Our template and view should go in the prototype so they can be overridden
	Template: Contacts.Templates.Index,
	
	View: F.View.extend({
		events: {
			'submit .search': 'handleSearch',		// Search when the user hits enter
			'keyup .searchField': 'handleSearch',	// Filter as the user types
			'click .clearButton': 'clearSearch',	// Clear the search when X is clicked
			'click .new': 'newContact',				// Create a new contact when + is clicked
			'click .edit': 'handleDeleteMode'		// Create a new contact when + is clicked
		}
	}),
	
	// Put the component we'll use in our prototype so it can be overridden
	ListComponent: Contacts.List,
	
	show: function() {
		// End delete mode before we're shown
		if (this.deleteMode)
			this.endEditMode();

		// Call the super class' show method
		this.inherited(arguments);

		// Show the list whenever we're shown
		this.list.show();
	},
	
	newContact: function() {
		// Tell our parent to switch to the contact editor component with a blank contact
		this.trigger('newContact');
	},
	
	handleDeleteMode: function() {
		if (this.deleteMode)
			this.endEditMode();
		else
			this.startEditMode();
	},
	
	endEditMode: function() {
		this.view.$('.edit').html('Edit').removeClass('default');
		this.view.$('.new').show();
		this.view.$('.search').show();
		this.list.endEditMode();
		this.deleteMode = false;
	},
	
	startEditMode: function() {
		this.view.$('.edit').html('Done').addClass('default');
		this.view.$('.new').hide();
		this.view.$('.search').hide();
		this.list.startEditMode();
		this.deleteMode = true;
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
		this.list.fetch({
			query: query
		});
	},
	
	clearSearch: function() {
		// Clear the value of the filter field
		this.view.$('input').val('');
		
		// Clear the search from the hash
		Contacts.router.navigate('', { trigger: true });
			
		// Clears fetch parameters before fetching
		this.list.fetch();
		
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
