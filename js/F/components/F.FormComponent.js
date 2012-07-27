(function() {
	
	/* Views
	*******************/
	// Available as F.FormComponent.prototype.View
	var FormView = F.View.extend(/** @lends F.FormComponent.prototype.View# */{
		tagName: 'form',
		events: {
			'submit': 'handleSubmit'
		}
	});
	
	
	/* Component
	*******************/
	F.FormComponent = new Class(/** @lends F.FormComponent# */{
		toString: 'FormComponent',
		extend: F.ModelComponent,
	
		/**
		 * A component that can display an add/edit form for a model and handle form submission and save events
		 *
		 * @constructs
		 * @extends F.ModelComponent
		 *
		 * @param {Object} options					Options for this component and its view. Options not listed below will be passed to the view.
		 * @param {Backbone.Model} options.Model	The model class that the form will manipulate. Not an instance of the model, but the model class itself
		 * @param {Backbone.View} options.View		The view class that the form will be rendered to
		 * @param {Template} options.Template		The template that the form will be rendered with
		 *
		 * @property {Backbone.Model} Model	The model class that the form will manipulate. Not an instance of the model, but the model class itself
		 * @property {Backbone.View} View	The view class that the form will be rendered to
		 * @property {Template} Template	The template that the form will be rendered with
		 */
		construct: function(options) {
			this.setPropsFromOptions(options, [
				'Model',
				'View',
				'Template'
			]);
		
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