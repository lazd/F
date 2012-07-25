/**
 * A component that can display an add/edit form for a model and handle form submission and save events
 *
 * @class
 * @extends F.ModelComponent
 */
F.FormComponent = new Class({
	toString: 'FormComponent',
	extend: F.ModelComponent,
	
	/** @constructor */
	construct: function(config) {
		// Use either the model in the prototype of the passed config
		this.Model = this.Model || config.Model;
		
		// Create a new edit view that responds to submit events
		this.view = new this.EditView(_.extend({
			component: this,
			events: {
				'submit': 'doSave'
			}
		}, config));
		
		// Create a blank model
		this.model = new this.Model();
	},
	
	/** @lends F.FormComponent# */
	
	/**
	 * The view that the form will be rendered to
	 */
	EditView: F.View.extend({
		tagName: 'form'
	}),

	/**
	 * The template that the form will be rendered with
	 */
	FormTemplate: null,
	
	/**
	 * Clear the editor form contents
	 */
	clear: function() {
		// Create a new model instead of resetting the old one
		this.model = new this.Model();

		// Render the view so it will be blank again
		this.view.render();
		
		return this;
	},
	
	/**
	 * Handles form submit events 
	 */
	save: function(evt) {
		// Get the data from the form
		var data = this.view.$el.serializeJSON();
		
		// Copy in the new properties
		this.model.set(data);

		// Perform the save
		arguments.length = 0; // don't let the super method think the event is a callback
		this.inherited(arguments);

		// Since this is a DOM event handler, prevent form submission
		return false;
	}
});
