W.Step = new Class({
	toString: 'Step',
	
	extend: F.Component,
	
	construct: function(options) {
		this.view = new this.View({
			container: options.container,
			template: options.template || this.Template,
			component: this
		}).render(); // render right away so subclasses can add other views and components to this templates
	},
	
	// Create a view and delegate the events
	View: F.View.extend({
		tagName: 'div',
		className: 'step',
		events: {
			'click .next': "nextStep",
			'click .prev': "prevStep"
		}
	}),
	
	// Tell the parent to go to the next step
	nextStep: function() {
		this.trigger('nextStep', this.toString());
	},
	
	// Tell the parent to go to the prev step
	prevStep: function() {
		this.trigger('prevStep', this.toString());
	}
});
