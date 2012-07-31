/*
	 A basic component that just renders a view with some data
*/
W.Part = new Class({
	toString: 'Part',
	
	extend: F.Component,
	
	construct: function(options) {
		this.view = new F.View({
			parent: options.parent,
			model: options.model,
			template: this.Template,
			component: this,
			events: {
				'click .done': 'done'
			}
		});
	},
	done: function() {
		this.trigger('done');
		this.hide();
	},
	
	Template: W.Templates['Step2_Part']
});
