/**
 * A component that can load and render a model
 *
 * @class
 * @extends F.Component
 */
F.ModelComponent = new Class({
	toString: 'ModelComponent',
	extend: F.Component,
	
	/** @constructor */
	construct: function(config) {
		this.Model = this.Model || config.Model;
	},
	
	/** @lends F.ModelComponent# */
	
	/***
	 * Refresh the model
	 *
	 * @param {Function} Callback to call after successful refresh
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	refresh: function(callback) {
		this.model.fetch({
			success: function() {
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
	setModel: function(model) {
		this.model = model;
		
		if (this.view) {
			// Tell the view to re-render the next time it loads
			this.view.rendered = null;
		}
		
		return this;
	},
	
	/**
	 * Load an item's model by ID
	 *
	 * @param {Function} itemId	ID of the item to fetch
	 * @param {Function} callback	Callback to execute on successful fetch
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	loadModel: function(itemId, callback) {
		// Create a model
		var model = new this.Model({
			id: itemId
		});
		
		// Assign the model to the view
		this.setModel(model);
		
		// Fetch model contents
		model.fetch({
			// TBD: add fetch options
			success: function() {
				this.trigger('modelLoaded');
				if (typeof callback === 'function')
					callback.call(this, model);
			}.bind(this)
		});
		
		return this;
	},
	
	/**
	 * Show this component, optionally fetching an item by ID or assiging a new model before render
	 *
	 * @param {Object} options
	 *
	 * @returns {F.ModelComponent}	this, chainable
	 */
	show: function(options) {
		options = options || {};
		if (options.id) {
			if (F.config.debug) {
				console.log('ModelComponent %s: fetching item with ID %s', this.toString(), options.id);
			}
			
			// Load the model by itemId, then show
			this.loadModel(options.id, function(model) {
				if (F.config.debug) {
					console.log('ModelComponent %s: fetch complete!', this.toString());
				}
				this.show(); // pass nothing to show and the view will re-render
			});
		}
		else if (options.model) {
			console.log('ModelComponent %s: showing with new model', this.toString(), options.model);
			this.setModel(options.model);
			this.show();
		}
		else
			this.inherited(arguments);
			
		return this;
	}
});
