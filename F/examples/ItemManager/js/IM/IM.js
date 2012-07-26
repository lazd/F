// Declare your namespace
var IM = {
	Components: {},
	Models: {},
	Collections: {},
	Templates: {}
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
