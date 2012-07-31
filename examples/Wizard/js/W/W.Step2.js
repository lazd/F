W.Step2 = new Class({
	toString: 'Step2',
	
	extend: W.Step,
	
	options: {
		singly: true // only show one part at a time
	},
	
	construct: function(options) {
		// Hide the next button; we'll show it when the other parts are done
		this.view.$('.next').hide();
		
		// Add the components that make up step 2's parts
		this.addComponent( 
			new W.Part({
				parent: this.view.$('.part1'),
				model: {
					name: 'Part 1',
					content: 'Do the dew.'
				}
			}), 
			'part1'
		)
		.on('done', function() { this.part1Done = true; this.showNextButton() }.bind(this)); // react to the done event from this part
		
		// To reference this component: W.wizard.step2.part2
		this.addComponent( 
			new W.Part({
				parent: this.view.$('.part2'),
				model: {
					name: 'Part 2',
					content: 'Write the code.'
				}
			}), 
			'part2'
		)
		.on('done', function() { this.part2Done = true; this.showNextButton() }.bind(this)); // react to the done event from this part
	},
	
	// Use the template we've defined to render the review
	Template: W.Templates['Step2'],
	
	// When both parts are done, we'll show the next button
	showNextButton: function() {
		if (this.part1Done && this.part2Done) {
			this.view.$('.next').show();
		}
	}
});
