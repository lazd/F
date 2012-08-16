F.ModelComponent = new Class(/** @lends F.ModelComponent# */{
	toString: 'ModelComponent',
	extend: F.Component,

	/**
	 * A component that can load and render a model
	 *
	 * @constructs
	 * @extends F.Component
	 *
	 * @param {Object} options	Options for this component
	 * @param {Object} options.Model	Model class this component will be operating on. Sets this.Model
	 *
	 * @property {Backbone.Model} Model		The model class to operate on. Not an instance of a model, but the model class itself.
	 */
	construct: function(options) {
		this.Model = this.Model || options.Model;
	},
	
	Model: Backbone.Model,
	
	/***
	 * Refresh the model
	 *
	 * @param {Function} callback	Callback to call after successful refresh
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	refresh: function(callback) {
		this.model.fetch({
			success: function() {
				// Trigger model event
				this.model.trigger('loaded');

				// Trigger component event
				this.trigger('modelLoaded');
				
				if (typeof callback === 'function')
					callback.call(this, this.model);
			}.bind(this)
		});
		
		return this;
	},
	
	/**
	 * Use a different item model
	 *
	 * @param {Backbone.Model} model
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	_setModel: function(model) {
		if (this.model && this.model.off && this.view) {
			// Unsubscribe from old model's change and render event in case view.remove() was not called
			this.model.off('change', this.view.render);
		}
		
		this.model = model;
		
		if (this.view) {
			// Tell the view to re-render the next time it loads
			this.view.rendered = null;
		}

		return this;
	},
		
	/**
	 * Load an item's model by ID or by model
	 *
	 * @param {Function} itemIdOrModel	ID of the item to fetch or already fetched model
	 * @param {Function} callback	Callback to execute on successful fetch
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	load: function(itemIdOrModel, callback) {
		// Load models 
		if (typeof itemIdOrModel === 'string' || typeof itemIdOrModel === 'number') {
			// Create a blank model
			var data = {};
			data[this.Model.prototype.idAttribute] = itemIdOrModel;
			var model = new this.Model(data);
		
			// Fetch model contents
			model.fetch({
				// TBD: add fetch options
				success: function() {
					// Assign the model to the view
					this._setModel(model);
					
					// Notify
					this.trigger('modelLoaded');
					
					// Call callback
					if (typeof callback === 'function')
						callback.call(this, model);
				}.bind(this)
			});
		}
		else {
			// It must be an object
			this._setModel(itemIdOrModel);
		}
		
		return this;
	},
	
	/**
	 * Save a model to the server
	 *
	 * @param {Function} callback	Callback to execute on successful fetch
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	save: function(data, callback) {
		if (this.model) {
			if (F.options.debug)
				console.log('%s: Saving...', this.toString());
			
			this.model.save(data || {}, {
				success: function() {
					if (F.options.debug)
						console.log('%s: Save successful', this.toString());
					
					if (typeof callback === 'function')
						callback.call(this, this.model);
						
					this.trigger('saved', this.model);
				}.bind(this),
				error: function() {
					// TBD: add meaningful data to event properties
					console.warn('%s: Error saving model', this.toString());
					
					this.trigger('saveFailed', this.model);
				}.bind(this)
			});
		}
		else {
			console.warn('%s: Cannot save, model is not truthy', this.toString());
		}
		return this;
	},
	
	/**
	 * Show this component, optionally fetching an item by ID or assigning a new model before render
	 *
	 * @param {Object} options			Show options
	 * @param {String} options.id		ID of model to fetch from the server before showing
	 * @param {Backbone.Model} options.model	Model to use directly (don't fetch)
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	show: function(options) {
		options = options || {};
		
		if (options.id) {
			if (F.options.debug) {
				console.log('%s: fetching item with ID %s', this.toString(), options.id);
			}
			
			// Load the model by itemId, then show
			this.load(options.id, function(model) {
				if (F.options.debug) {
					console.log('%s: fetch complete!', this.toString());
				}
				this.show({
					silent: options.silent
				}); // pass nothing to show and the view will re-render
			});
		}
		else if (options.model) {
			if (F.options.debug) {
				console.log('%s: showing with new model', this.toString(), options.model);
			}
			
			this.load(options.model);
			this.show({
				silent: options.silent
			});
		}
		else
			this.inherited(arguments);
			
		return this;
	}
});
