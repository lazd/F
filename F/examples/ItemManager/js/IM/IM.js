/*
	Declare a namespace for your app
	
	Using a namespace keeps your code out of the global scope
	A namespace also helps keep your organized. Large apps only get larger
*/
var IM = {
	// Store your components in your namespace as IM.Components
	Components: {},
	
	// Models go in IM.Models
	Models: {},
	
	// Collections as well
	Collections: {},
	
	// And templates
	Templates: {},
	
	// It's not required, but having init() in your namespace gives you a nice place to setup your application
	init: function() {
		// Prevent multiple calls to init from creating new Apps
		if (!IM.app) {
			IM.app = new IM.Components.App({
				parent: '#itemManager',
				visible: true // show immediately
			});
		}
		return IM.app;
	},
	
	// Hold the instance of IM.App
	app: null
};


// Define your models
IM.Models.Item = Backbone.Model.extend({
	urlRoot: 'api/items'
});


// Define your collections
IM.Collections.Items = Backbone.Collection.extend({
	url: 'api/items.json',
	model: IM.Models.Item
});


// Define your templates
IM.Templates['Manager'] = Handlebars.compile([
	'<div class="index"></div>',
	'<div class="details"></div>',
	'<div class="editor"></div>'
].join(''));

IM.Templates['ViewItem'] = Handlebars.compile([
	'<button class="close" type="button">Close</button>',
	'<h1>{{name}}</h1>',
	'<p>{{info}}</p>'
].join(''));

IM.Templates['ListItem'] = Handlebars.compile([
	'<strong>{{name}}</strong>'
].join(''));
