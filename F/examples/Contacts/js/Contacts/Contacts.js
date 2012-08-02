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
			Contacts.app = new Contacts.App({
				parent: '#contacts',
				visible: true // show immediately
			});
		}
		return Contacts.app;
	},
	
	// Hold the instance of Contacts.App
	app: null
};


// Define your models
Contacts.Models.Contact = Backbone.Model.extend({
	urlRoot: 'api/contacts'
});


// Define your collections
Contacts.Collections.Contacts = Backbone.Collection.extend({
	url: 'api/contacts.json',
	model: Contacts.Models.Contact
});


// Define your templates
Contacts.Templates['App'] = Handlebars.compile([
	'<div class="index"></div>',
	'<div class="details"></div>',
	'<form class="editor"></form>'
].join(''));

Contacts.Templates['Index'] = Handlebars.compile([
	'<div class="header">',
		'<div></div>',
		'<h1>Contacts</h1>',
		'<div><button class="new" type="button"><i class="icon-plus"></i></button></div>',
	'</div>',
	'<form class="search" style="display: none;"><i class="icon-search"></i><input type="text" name="search" placeholder="Search"></form>',
	'<ul class="list"></ul>'
].join(''));

Contacts.Templates['ContactEditor'] = Handlebars.compile([
	'<div class="header">',
		'<div><button class="back" type="button">Cancel</button></div>',
		'<h1>{{# if name}}{{name}}{{else}}New Contact{{/if}}</h1>',
		'<div><button class="save">Done</button></div>',
	'</div>',
	'<div class="fields">',
		'<div class="field"><label>name</label><input type="text" name="name" value="{{name}}"></div>',
		'<div class="field"><label>e-mail</label><input type="text" name="email" value="{{email}}"></div>',
		'<div class="field"><label>phone</label><input type="text" name="phone" value="{{phone}}"></div>',
	'</div>'
].join(''));

Contacts.Templates['ContactDetails'] = Handlebars.compile([
	'<div class="header">',
		'<div><button class="back" type="button">Back</button></div>',
		'<h1>{{name}}</h1>',
		'<div><button class="edit" type="button">Edit</button></div>',
	'</div>',
	'<div class="contact">',
		'<h2>{{name}}</h2>',
		'{{#if phone}}<p>{{phone}}</p>{{/if}}',
		'{{#if email}}<p><a href="mailto:{{email}}">{{email}}</a></p>{{/if}}',
	'</div>'
].join(''));

Contacts.Templates['ContactListItem'] = Handlebars.compile([
	'<strong>{{name}}</strong>'
].join(''));
