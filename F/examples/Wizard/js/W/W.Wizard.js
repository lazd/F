W.Wizard = new Class({
	toString: 'Wizard',
	
	extend: F.Component,
	
	options: {
		singly: true // Show only one component at a time
	},
	
	construct: function(options) {
		// Make sure next step is always called in the scope of this
		this.bind(this.nextStep); // equivalent to: this.nextStep = this.nextStep.bind(this);
		this.bind(this.prevStep);
		
		// The main view for the wizard
		this.view = new this.View({
			parent: options.parent,
			component: this,			// Let this view directly call our functions by name in the Backbones event object
			template: this.Template		// Pass the template from our prototype for rendering
		}).render(); // since our sub-component insert themselves into our element, make sure we've already rendered the template, otherwise we'll erase them
		
		// Add each step
		this.addComponent(new W.Step({
			parent: this.view.el,	// insert it into the wizard's view
			Template: W.Templates['Step1']
		}), 'step1')
		.on('nextStep', this.nextStep)
		.on('prevStep', this.prevStep);
		
		// Step 2 isn't a generic step, so we broke it out into another class
		this.addComponent(new W.Step2({
			parent: this.view.el,	// insert it into the wizard's view
		}))
		.on('nextStep', this.nextStep)
		.on('prevStep', this.prevStep);
		
		this.addComponent(new W.Step({
			parent: this.view.el,	// insert it into the wizard's view
			Template: W.Templates['Step3']
		}), 'step3')
		.on('nextStep', this.nextStep)
		.on('prevStep', this.prevStep);
	},
	
	nextStep: function(currentStep) {
		var currentStepNum = parseInt(currentStep.replace(/[^\d]+/, ''));
		
		if (isNaN(currentStepNum)) {
			console.warn("W: can't switch to step '%s', it's not a number", currentStepNum);
			return false;
		}
		
		var nextStepNum = currentStepNum+1;
		
		// Try to go to the next step
		var nextStep = this.components['step'+nextStepNum];
		if (nextStep) {
			console.log('W: showing step %s', nextStepNum);
			
			// Navigate to the step's hash and make sure thr router triggers the function
			W.router.navigate('wizard/step'+nextStepNum, { trigger: true });
		}
		else {
			console.warn("W: can't show step %s, step not found", nextStepNum)
		}
	},
	
	prevStep: function(currentStep) {
		// It would be ideal to just go back in history, but since it could navigate users away from your page, do it manually
		window.history.go(-1);
	},
	
	// Create a view and delegate the events
	View: F.View.extend({
		tagName: 'div',
		className: 'wizard'
	}),
	
	// Use the template we've defined to render the review
	Template: W.Templates['Wizard']
});
