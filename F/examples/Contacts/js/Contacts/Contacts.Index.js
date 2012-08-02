Contacts.Index = new Class({
	toString: 'Index',
	extend: F.Component,
	
	construct: function(options) {
		// Overwrite defaults directly into options
		_.extend(options, {
			template: this.Template,
			component: this
		});
		
		this.view = new this.View(options).render();
		
		this.addComponent(new this.ListComponent({
			el: this.view.$('.list'),
			visible: true,
			Collection: this.Collection
		}), 'list');          
		
		// Bubble the itemSelected event of our list upward
		this.bubble('list', 'itemSelected');
	},
	
	Template: Contacts.Templates.Index,
	
	View: F.View.extend({
		events: {
			'submit form': 'doSearch',
			'click .new': 'newContact'
		}
	}),
	
	ListComponent: Contacts.List,
	
	newContact: function() {
		this.trigger('newContact');
	},
	
	doSearch: function(evt) {
		// Get the search term from the form
		var query = this.view.$('input').val();
		
		// Refresh the list with the query
		this.list.fetch({
			query: query
		});
	}
});
