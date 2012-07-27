W.Router = Backbone.Router.extend({
	// Define the valid routes that our application will respond to
    routes: {
		"wizard": "showComponent",

		"wizard/step1": "showComponent",
		
		"wizard/step2": "showComponent",
		
		"wizard/step2/part1": "showComponent",
		
		"wizard/step2/part2": "showComponent",
		
		"wizard/step3": "showComponent"
    },
	
	// Find the component to show, assuming we've designed our 
	// hash hierarchy exactly as we have designed our component hierarchy
	showComponent: function() {
		// Get the hash in terms of it's "folders", removing the # sign first with slice()
		var hashParts = window.location.hash.slice(1).split('/');
		
		// Starting with our app, drill into the hierarchy and find our component
		var component = W;
		_.some(hashParts, function(part) {
			if (component[part]) {
				// Move deeper into the hierarchy
				component = component[part];
			}
			else {
				console.warn('W.Router: route specificy an invalid part: %s', window.location.hash);
				return true;
			}
		});
		
		// Show the component
		component.show();
	},
	
	/*
	// Instead of the above, we could just do this for every step and part:
	
	showStep1Part1: function() {
		W.wizard.step1.part1.show();
	}
	*/
});
