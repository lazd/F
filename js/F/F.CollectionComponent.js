/**
 * A component that can load and render a collection
 *
 * @class
 * @extends F.Component
 */
F.CollectionComponent = new Class({
	toString: 'CollectionComponent',
	extend: F.Component,
	
	/** @constructor */
	construct: function(options) {
		this.Collection = this.Collection || options.Collection;
		
		// Create a collection
		this.collection = new this.Collection();
		
		// Re-render when the collection resets
		this.collection.on('reset', this.render);
		
		// Default parameters are the prototype params + optionsuration params
		this.defaultParams = _.extend({}, options.params);
		
		// Parameters to send with the request
		this.params = _.extend({}, this.defaultParams);
	
		// Store if this collection has ever been loaded
		this.collectionLoaded = false;
	},
	
	/** @lends F.CollectionComponent# */
	
	/**
	 * Refresh this collection with the last parameters used
	 *
	 * @param {Function} callback	Optional callback to execute on successful fetch
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	refresh: function(callback) {
		// Just load the colleciton with the current params
		this.loadCollection(this.params, callback);
		
		return this;
	},
	
	/**
	 * Fetch the collection with optional 
	 *
	 * @param {Object} fetchParams	Optional parameters to pass when fetching
	 * @param {Function} callback	Optional callback to execute on successful fetch
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	loadCollection: function(fetchParams, callback) {
		// Combine new params, if any, with defaults and store, overwriting previous params
		if (fetchParams)
			this.params = _.extend({}, this.defaultParams, fetchParams);
		
		// Fetch collection contents
		this.collection.fetch({
			data: this.params,
			success: function() {
				this.trigger('collectionLoaded');
				this.collectionLoaded = true;
				
				if (typeof callback === 'function')
					callback.call(this, this.collection);
			}.bind(this)
		});
		
		return this;
	},
	
	/**
	 * Show this component. Optionally options.params to fetch with new parameters. Will fetch if collection has not already been fetched
	 *
	 * @param {Object} options	Pass fetch parameters with options.params
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	show: function(options) {
		options = options || {};
		if (options.params) {
			// Load the collection by itemId
			this.loadCollection(options.params, function() {
				this.show();
			});
		}
		else if (!this.collectionLoaded) {
			// Perform initial load
			this.refresh(function() {
				this.show(); // show when we're fully loaded
			});
		}
		else
			this.inherited(arguments);
			
		return this;
	}
});
