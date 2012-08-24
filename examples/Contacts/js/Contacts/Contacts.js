/*
First, declare a namespace for your app

Using a namespace keeps your code out of the global scope.
A namespace also helps keep your large app organized.
*/
var Contacts = {
	// Models go in Contacts.Models
	Models: {},
	
	// Collections as well
	Collections: {},
	
	// And templates
	Templates: {},
	
	// It's not required, but having init() in your namespace gives you a nice place to setup your application
	init: function() {
		// Prevent multiple calls to init from creating new Apps
		if (!Contacts.app) {
			// Create a router
			Contacts.router = new Contacts.Router();

			// Start the app
			Contacts.app = new Contacts.App({
				el: '#contacts',	// directly use the #contacts element as the container
				visible: true 		// show immediately
			});
			
			// Start watching history
			Backbone.history.start();
		}
		
		return Contacts.app;
	},
	
	// Hold the instance of Contacts.App
	app: null
};


// Define your models
Contacts.Models.Contact = Backbone.Model.extend({
	urlRoot: 'api/contacts',

	/*
	Note: the following code is necessary to allow fake saves
	*/
	// Normally, you wouldn't need to store a dirty bit
	change: function() {
	    this.dirty = true;
	},
	// Normally, you would not do this at all
	url: function() {
		// Deliver the correct URL unless the model has been changed, in which case we force the save to fail
		return this.urlRoot + (!this.dirty ? '/'+this.id : '_dontActuallySaveOrThisDemoDoesntWork');
	}
});


// Define your collections
Contacts.Collections.Contacts = Backbone.Collection.extend({
	url: 'api/contacts.json',
	model: Contacts.Models.Contact,
	
	/*
	Note: the following code is only here to simulate server-side filtering
	*/
	// Normally, you wouldn't worry about storing the search query on the model level
	fetch: function(options) {
		// Store the search query so we can manually filter in parse
		this.searchQuery = options.data.query;
		Backbone.Collection.prototype.fetch.apply(this, arguments);
	},
	// Normally, you'll just take what the server gives according to the search query you passed
	parse: function(response) {
		// Manually filter the collection as our fake API does not return subsets
		return this.searchQuery ? _.filter(response, function(record, index) {
			return ~record.name.toLowerCase().indexOf(this.searchQuery.toLowerCase());
		}.bind(this)) : response;
	}
});


// Define your templates
Contacts.Templates['App'] = Handlebars.compile([
	'<div class="index"></div>',
	'<div class="details"></div>',
	'<form class="editor"></form>'
].join(''));

Contacts.Templates['Index'] = Handlebars.compile([
	'<div class="header">',
		'<div><button class="edit" type="button">Edit</button></div>',
		'<h1>Contacts</h1>',
		'<div><button class="new" type="button"><i class="icon-plus"></i></button></div>',
	'</div>',
	'<div class="scroller">',
		'<form class="search" autocomplete="off">',
			'<i class="icon-search"></i>',
			'<input type="text" name="search" class="searchField" autocomplete="off" placeholder="Search">',
			'<i style="display: none;" class="clearButton icon-remove-sign"></i>',
		'</form>',
		'<ul class="list"></ul>',
	'</div>'
].join(''));

Contacts.Templates['ContactEditor'] = Handlebars.compile([
	'<div class="frame">',
		'<div class="header">',
	 	   '<div><button class="back" type="button">Cancel</button></div>',
	 	   '<h1>{{# if name}}Edit Contact{{else}}New Contact{{/if}}</h1>',
	 	   '<div><button class="default" type="submit">Done</button></div>',
		'</div>',
		'<div class="scroller">',
	 	   '<div class="well fields">',
	 	   	'<div class="field"><label>name</label><input type="text" name="name" value="{{name}}"></div>',
	 	   	'<div class="field"><label>e-mail</label><input type="text" name="email" value="{{email}}"></div>',
	 	   	'<div class="field"><label>phone</label><input type="text" name="phone" value="{{phone}}"></div>',
	 	   '</div>',
		'</div>',
	'</div>'
].join(''));

Contacts.Templates['ContactDetails'] = Handlebars.compile([
	'<div class="frame">',
	'	<div class="header">',
	 	   '<div><button class="back" type="button">All Contacts</button></div>',
	 	   '<h1>Info</h1>',
	 	   '<div><button class="edit" type="button">Edit</button></div>',
		'</div>',
		'<div class="scroller">',
	 	   '<div class="well">',
	 	   	'<h2>{{name}}</h2>',
	 	   	'{{#if phone}}<p>{{phone}}</p>{{/if}}',
	 	   	'{{#if email}}<p><a href="mailto:{{email}}">{{email}}</a></p>{{/if}}',
	 	   '</div>',
		'</div>',
	'</div>'
].join(''));

Contacts.Templates['ContactListItem'] = Handlebars.compile([
	'<button class="round red unlockDelete" style="display: none;"><i class="icon-minus"></i></button><strong>{{name}}</strong><div><button class="round blue view"><i class="icon-chevron-right"></i></button><button class="doDelete red" style="display: none;">Delete</button></div>'
].join(''));
