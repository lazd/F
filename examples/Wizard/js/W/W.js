/*
	Declare a namespace for your app
	
	Using a namespace keeps your code out of the global scope
	A namespace also helps keep your organized. Large apps only get larger
*/
var W = {
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
		// Create a router
		W.router = new W.Router();
		
		// Create the wizard
		W.wizard = new W.Wizard({
			parent: '#wizard'
		});
		
		// Start watching history
		Backbone.history.start();
	},
	
	// Hold our router instance, in case we need to do W.router.navigate()
	router: null,
	
	// Hold the instance of W.wizard
	wizard: null
};

// Define your templates
W.Templates['Wizard'] = Handlebars.compile([
	'<h1>Wizard of ƒ</h1>'
].join(''));

W.Templates['Step1'] = Handlebars.compile([
	'<button class="next">Next</button>',
	'<h2>Step 1: Acceptance</h1>',
	'<p>First, learn to accept that your process is complicated enough that it needs a wizard.</p>'
].join(''));

W.Templates['Step2'] = Handlebars.compile([
	'<button class="prev">Previous</button>',
	'<button class="next">Next</button>',
	'<h2>Step 2: Planning</h1>',
	'<p>Break your process into logical steps.</p>',
	'<a href="#wizard/step2/part1">Do Part 1</a><br>',
	'<a href="#wizard/step2/part2">Do Part 2</a>',
	'<div class="part1"></div>',
	'<div class="part2"></div>'
].join(''));

W.Templates['Step2_Part'] = Handlebars.compile([
	'<h2>{{name}}</h1>',
	'<p>{{content}}</p>',
	'<button class="done">I did it</button>'
].join(''));

W.Templates['Step3'] = Handlebars.compile([
	'<button class="prev">Previous</button>',
	'<h2>Step 3: Implement</h1>',
	'<p>Just do it!</p>'
].join(''));
