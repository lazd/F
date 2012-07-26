(function() {
	
	/* Views
	*******************/
	var FormView = F.View.extend({
		tagName: 'form',
		events: {
			'submit': 'handleSubmit'
		}
	});
	
	
	/* Component
	*******************/
	F.Form = new Class(/** @lends F.FormComponent# */{
		toString: 'FormComponent',
		extend: F.ModelComponent,
	
		/**
		 * A component that can display an add/edit form for a model and handle form submission and save events
		 *
		 * @constructs
		 * @extends F.ModelComponent
		 *
		 * @property {Backbone.View} View	The view class that the form will be rendered to
		 * @property {Template} Template	The template that the form will be rendered with
		 */
		construct: function(options) {
			this.setPropsFromOptions(options, [
				'View',
				'Model',
				'Template'
			]);
		
			this.View = this.View || F.Form.View;
		
			// Create a new edit view that responds to submit events
			this.view = new this.View(_.extend({
				component: this,
				template: this.Template
			}, options));
		
			// Create a blank model
			this.model = new this.Model();
		},
	
		View: FormView,
	
		Template: null,

		/**
		 * Clears the form by rendering it with a new, empty model
		 */
		clear: function() {
			// Create a new model instead of resetting the old one
			this.model = new this.Model();

			// Render the view so it will be blank again
			this.render();
		
			return this;
		},
	
		/**
		 * Handles form submit events
		 *
		 * @param {Event} evt	The jQuery event object
		 */
		handleSubmit: function(evt) {
			// Get the data from the form fields
			var fields = this.view.$el.serializeArray();
		
			// Build a data object from fields
			var data = {};
			_.each(fields, function(field) {
				data[field.name] = field.value;
			});
		
			// Perform the save, passing our modified as the second arg
			this.save(data);

			// Since this is a DOM event handler, prevent form submission
			return false;
		}
	});

}());