F.ModelComponent = new Class(/** @lends F.ModelComponent# */{
	toString: 'ModelComponent',
	extend: F.Component,
	/**
		A component that can load and render a model
		
		@constructs
		@extends F.Component
		
		@param {Object}		options			Options for this component
		@param {Object}		options.Model	Model class this component will be operating on. Sets this.Model
		
		@property {Backbone.Model}	Model	The model class to operate on. Not an instance of a model, but the model class itself.
	*/
	construct: function(options) {
		this.Model = this.Model || options.Model;
	},
	
	Model: Backbone.Model,
	
	/**
		Refresh the model
		
		@param {Function}	callback	Callback to call after successful refresh
		
		@returns {F.ModelComponent}	this, chainable
	*/
	refresh: function(callback) {
		this.trigger('model:loading', {
			model: this.model
		});

		this.model.fetch({
			success: function(model, response) {
				// Allow handleLoadSuccess to cancel triggers
				var trigger = true;
				if (typeof this.handleLoadSuccess === 'function')
					trigger = (this.handleLoadSuccess(this.model, response) === false) ? false : true;
					
				if (trigger) {
					// Trigger model event
					this.model.trigger('loaded');
				
					// Trigger component event
					this.trigger('model:loaded', {
						model: this.model
					});
				
					// Call callback
					if (typeof callback === 'function')
						callback.call(this, this.model);
				}
			}.bind(this),
			error: function(model, response) {
				console.warn('%s: Error loading model', this.toString());
				
				this.trigger('model:loadFailed', {
					model: this.model,
					response: response
				});
				
				if (typeof this.handleLoadError === 'function')
					this.handleLoadError(this.model, response);
			}.bind(this)
		});
		
		return this;
	},
	
	/**
		Use a different item model
		
		@param {Backbone.Model}		model	The model to use
		
		@returns {F.ModelComponent}	this, chainable
	*/
	_setModel: function(model) {
		this.model = model;
	
		if (this.model && this.model.off && this.view) {
			this.view.setModel(model);
		}
		
		return this;
	},
		
	/**
		Fetch a model with the given ID
		
		@param {String}		itemId		ID of the item to fetch
		@param {Function}	[callback]	Callback to execute on successful fetch
		
		@returns {F.ModelComponent}	this, chainable
	*/
	fetch: function(itemId, callback) {
		var data = {};
		if (itemId !== undefined) { // add the ID passed to the model data
			data[this.Model.prototype.idAttribute] = itemId;
		}

		this.trigger('model:loading', {
			model: this.model
		});

		// Create a blank model
		var model = new this.Model(data);
	
		// Fetch model contents
		model.fetch({
			// TBD: add fetch options?
			success: function(model, response) {
				// Assign the model to the view
				this._setModel(model);
				
				// Allow handleLoadSuccess to cancel triggers
				var trigger = true;
				if (typeof this.handleLoadSuccess === 'function')
					trigger = (this.handleLoadSuccess(this.model, response) === false) ? false : true;
					
				if (trigger) {
					// Notify
					this.trigger('model:loaded', {
						model: this.model
					});
				
					// Call callback
					if (typeof callback === 'function')
						callback.call(this, this.model);
				}
			}.bind(this),
			error: function(model, response) {
				console.warn('%s: Error loading model', this.toString());
				
				this.trigger('model:loadFailed', {
					model: this.model,
					response: response
				});
				
				if (typeof this.handleLoadError === 'function')
					this.handleLoadError(this.model, response);
			}.bind(this)
		});
		
		return this;
	},
	
	/**
		Load a Backbone.Model directly or create a model from data
		
		@param {mixed}	modelOrData		Backbone.Model to load or Object with data to create model from
		
		@returns {F.ModelComponent}	this, chainable
	*/
	load: function(modelOrData) {
		if (modelOrData instanceof Backbone.Model)
			this._setModel(modelOrData);
		else
			this._setModel(new this.Model(modelOrData));
		
		// Notify
		this.trigger('model:loaded', {
			model: this.model
		});
		
		return this;
	},
	
	/**
		Save a model to the server
		
		@param {Object}		data		Data to apply to model before performing save
		@param {Function}	callback	Callback to execute on success/failure. Passed an error, the model, and the response from the server
		@param {Object}		options		Options to pass when calling model.save
		
		@returns {F.ModelComponent}	this, chainable
	*/
	save: function(data, callback, options) {
		if (this.model) {
			if (this.inDebugMode())
				console.log('%s: Saving...', this.toString());
			
			this.trigger('model:saving', {
				model: this.model
			});
			
			this.model.save(data || {}, _.extend({
				success: function(model, response) {
					if (this.inDebugMode())
						console.log('%s: Save successful', this.toString());
					
					if (typeof callback === 'function')
						callback.call(this, null, this.model, response);
					
					if (typeof this.handleSaveSuccess === 'function')
						this.handleSaveSuccess(this.model, response);
					
					this.trigger('model:saved', {
						model: this.model,
						response: response
					});
				}.bind(this),
				error: function(model, response) {
					console.warn('%s: Error saving model', this.toString());
					
					if (typeof callback === 'function')
						callback.call(this, new Error('Error saving model'), this.model, response);
					
					if (typeof this.handleSaveError === 'function')
						this.handleSaveError(this.model, response);
						
					this.trigger('model:saveFailed', {
						model: this.model,
						response: response
					});
				}.bind(this)
			}, options));
		}
		else {
			console.warn('%s: Cannot save, model is not truthy', this.toString());
		}
		return this;
	},
	
	/**
		Show this component, optionally fetching an item by ID or assigning a new model before render
		
		@param {Object}			options			Show options
		@param {String}			options.id		ID of model to fetch from the server before showing
		@param {Backbone.Model}	options.model	Model to use directly (don't fetch)
		
		@returns {F.ModelComponent}	this, chainable
	*/
	show: function(_super, options) {
		options = options || {};
		
		if (options.id) {
			if (this.inDebugMode()) {
				console.log('%s: fetching item with ID %s', this.toString(), options.id);
			}
			
			// Load the model by itemId, then show
			this.fetch(options.id, function(model) {
				if (this.inDebugMode()) {
					console.log('%s: fetch complete!', this.toString());
				}
				this.show({
					silent: options.silent
				}); // pass nothing to show and the view will re-render
			});
		}
		else if (options.model) {
			if (this.inDebugMode()) {
				console.log('%s: showing with new model', this.toString(), options.model);
			}
			
			this.load(options.model);
			this.show({
				silent: options.silent
			});
		}
		else {
			_super.apply(this, arguments);
		}
			
		return this;
	}

	/**
		Called when a model has been loaded successfully
		
		@param {Backbone.Model}	model		The model that was to loaded
		@param {Object}			response	The response from Backbone

		@returns {Boolean}	If false is returned, events will not be triggered and the callback will not be called

		@name handleLoadSuccess
		@memberOf F.ModelComponent.prototype
		@function
	*/

	/**
		Called when a model fails to load
		
		@param {Backbone.Model}	model		The model that failed to load
		@param {Object}			response	The response from Backbone
		
		@name handleLoadError
		@memberOf F.ModelComponent.prototype
		@function
	*/
	
	/**
		Called when a model has been saved successfully
		
		@param {Backbone.Model}	model		The model that was saved
		@param {Object}			response	The response from Backbone

		@name handleSaveSuccess
		@memberOf F.ModelComponent.prototype
		@function
	*/
	
	/**
		Called when a model fails to save
		
		@param {Backbone.Model}	model		The model that failed to save
		@param {Object}			response	The response from Backbone

		@name handleSaveError
		@memberOf F.ModelComponent.prototype
		@function
	*/
	
	/**
		Triggered when a model is saving
		
		@name F.ModelComponent#model:saving
		@event
		
		@param {Object}			evt			Event object
		@param {Backbone.Model}	evt.model	The model that was saved
	*/
	
	/**
		Triggered when save is unsuccessful
		
		@name F.ModelComponent#model:saveFailed
		@event
		
		@param {Object}			evt				Event object
		@param {Backbone.Model}	evt.model		The model that failed to save
		@param {Object}			evt.response	Response from the server
	*/
	
	/**
		Triggered after a successful save
		
		@name F.ModelComponent#model:saved
		@event
		
		@param {Object}			evt				Event object
		@param {Backbone.Model}	evt.model		The model that was saved
		@param {Object}			evt.response	Response from the server
	*/
	
	/**
		Triggered when the model is being loaded from the server
		
		@name F.ModelComponent#model:loading
		@event
			
		@param {Object}			evt			Event object
		@param {Backbone.Model}	evt.model	The model that was loaded
	*/
	 
	/**
		Triggered when load is unsuccessful
		
		@name F.ModelComponent#model:loadFailed
		@event
		
		@param {Object}			evt				Event object
		@param {Backbone.Model}	evt.model		The model that failed to load
		@param {Object}			evt.response	Response from the server
	*/
	
	/**
		Triggered when the model is loaded from the server or passed to load()
		
		@name F.ModelComponent#model:loaded
		@event
			
		@param {Object}			evt			Event object
		@param {Backbone.Model}	evt.model	The model that was loaded
	*/
});
