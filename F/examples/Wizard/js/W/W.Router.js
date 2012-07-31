/*
The following router is designed to show how the component hierarchy can be made to match
1:1 with the hash path that controls it. That is, instead of mapping routes to functions
in various object, we design our object hierarchy to match our routes.

NOTE: Please note that the routes defined below are not best-practice and are meant to serve
as an illustration of nested components.
*/
W.Router = Backbone.Router.extend({
	// Define the valid routes that our application will respond to
    routes: {
		"*path": "showComponent"
    },
	
	/*
	Given the assumption that we've designed our component hierarchy to match our
	hash path, find the component that should be shown according to the hash path
	*/
	showComponent: function(path) {
		// Get each folder in the hash path
		var hashParts = path.split('/');
		
		// Starting with our app, drill into the hierarchy to find the component
		// that matches the hash path
		var component = W;
		_.some(hashParts, function(part) {
			if (component[part])
				component = component[part];
			else {
				console.warn('W.Router: route specifies an invalid part: %s', path);
				return true;
			}
		});
		
		// Show the component if it has a show() method
		if (component.show)
			component.show();
	},
	
	/*
	The above is an example meant to illustrate the power of nested components, and
	is not what you would do in practice.
	
	In practice, you would do something like what is below for every step and part.
	It may take more code, but it is more direct and allows you to pass named parameters.
	*/
	/*
	routes: {
		"wizard": "showWizard",

		"wizard/step1": "showStep1",
		
		"wizard/step2": "showStep2",
		
		"wizard/step2/part1": "showStep2Part1",
		
		"wizard/step2/part2": "showStep2Part2",
		
		"wizard/step3": "showStep3"
    },
    
	showWizard: function() {
		W.wizard.show();
	},
	showStep1: function() {
		W.wizard.step1.show();
	},
	showStep2: function() {
		W.wizard.step2.show();
	},
	showStep2Part1: function() {
		W.wizard.step2.part1.show();
	},
	showStep2Part2: function() {
		W.wizard.step2.part2.show();
	},
	showStep3: function() {
		W.wizard.step3.show();
	}
	*/
});
