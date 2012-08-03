Contacts.Index = new Class({
	toString: 'Index',
	extend: F.Component,
	
	construct: function(options) {
		// Overwrite defaults directly into options
		_.extend(options, {
			template: this.Template,
			component: this
		});
		
		// Since we use this as an event listener, don't forget to bind it, rascala!
		// Also, since we're going to use handleSearch as a keyup listener, make sure
		// it doesn't fire constantly by throttling it
		this.handleSearch = _.throttle(this.handleSearch.bind(this), 100);
		
		// Create a view for our search/list display
		this.view = new this.View(options).render();
		
		// Add the list component
		this.addComponent(new this.ListComponent({
			el: this.view.$('.list'),
			Collection: this.Collection,
			visible: true
		}), 'list');
		
		this.list.view.on('renderComplete', function() {
			// Scroll to under search
			this.view.$('.scrollContainer').animate({
				scrollTop: 16*3
			}, 250);
		}.bind(this));
		
		// Bubble the itemSelected event of our list upward
		this.bubble('list', 'itemSelected');
	},
	
	Template: Contacts.Templates.Index,
	
	View: F.View.extend({
		events: {
			'submit .search': 'handleSearch',
			'keyup .searchField': 'handleSearch',
			'click .clearButton': 'clearSearch',
			'click .new': 'newContact'
		}
	}),
	
	ListComponent: Contacts.List,
	
	newContact: function() {
		// Tell our parent to switch to the contact editor component with a blank contact
		this.trigger('newContact');
	},
	search: function(query) {
		// Update the hash
		Contacts.router.navigate('search/'+query, { trigger: false });
		
		// Set the input field text in case this came from the router
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
