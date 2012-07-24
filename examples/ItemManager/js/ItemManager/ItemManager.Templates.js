ItemManager.Templates = {};

ItemManager.Templates['Manager'] = Handlebars.compile([
	'<div class="index"></div>',
	'<div class="details"></div>'
].join(''));

ItemManager.Templates['Item'] = Handlebars.compile([
	'<h1>{{name}}</h1>',
	'<p>{{info}}</p>'
].join(''));

ItemManager.Templates['ListItem'] = Handlebars.compile([
	'<strong>{{name}}</strong>'
].join(''));
