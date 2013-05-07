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
		 * @param {Object} options			Options for this component and its view. Options not listed below will be passed to the view.
		 *
		 * @property {Backbone.Model} Model	The model class that the form will manipulate. Not an instance of the model, but the model class itself
		 * @property {Backbone.View} View	The view class that the form will be rendered to
		 * @property {Template} Template	The template that the form will be rendered with
		 */
		construct: function(options) {
			// Create a new edit view that responds to submit events
			this.view = new this.View(_.extend({
				component: this,
				template: this.Template
			}, options));
		
			// Create a blank model
			this.model = new this.Model();
			
			this.bind(this.handleSubmit);
		},

		View: FormView,
	
		Template: null,

		/**
		 * Clears the form by rendering it with a new, empty model
		 *
		 * @returns {F.Component}	this, chainable
		 */
		clear: function() {
			// Create a new model instead of resetting the old one
			this._setModel(new this.Model());

			// Call the load success function
			var trigger = true;
			if (typeof this.handleLoadSuccess === 'function')
				this.handleLoadSuccess(this.model);
			
			// Render the view so it will be blank again
			this.render();
		
			return this;
		},
		
		/**
		 * Blurs focus from the form, mostly for iOS
		 */
		doBlur: function() {
			// Blur focus to the submit button in order to hide keyboard on iOS
			// This won't work for every situation, such as forms that don't have submit buttons
			var $button = this.view.$('[type="submit"], button').filter(':visible').last().focus();
			setTimeout(function() {
				$button.blur();
			}, 10);
		},
	
		/**
		 * Handles form submit events
		 *
		 * @param {Event} evt	The jQuery event object
		 */
		handleSubmit: function(evt) {
			this.doBlur();
			
			// Since this is a DOM event handler, prevent form submission
			if (evt && evt.preventDefault)
				evt.preventDefault();
			
			this.saveForm();
		},
		
		/**
		 * Read data from the form. Override this function customization of extracting your form data
		 *
		 * @returns {Object}	Data read from form
		 */
		extractValuesFromForm: function() {
			// Get the data from the form fields
			var $form = this.view.$el;
			if (this.view.el.tagName !== 'FORM')
				$form = this.view.$('form');
				
			var fields = $form.filter(':not([data-serialize="false"])').serializeArray();
			
			// Build a data object from fields
			var data = {};
			_.each(fields, function(field) {
				F.set(data, field.name, field.value, true);
			});
			
			return data;
		},
		
		/**
		 * Read the data from the form and store it in the model
		 */
		setValuesFromForm: function() {
			this.model.set(this.extractValuesFromForm());
		},
		
		/**
		 * Read the data from the form and perform the save
		 *
		 * @param {Function} callback	A callback to execute when the save is complete
		 */
		saveForm: function(callback) {
			// Perform the save, passing our new, modified data
			this.save(this.extractValuesFromForm(), callback);
		}
		
	});
}());
