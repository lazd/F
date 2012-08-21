Contacts.App = new Class({
	toString: 'Contacts',
	extend: F.Component,
	
	options: {
		singly: true
	},
	
	construct: function(options) {
		// Hold the listItem and model associated with the currently selected item
		this.selectedItem = null;
		
		// The main view for the item manager
		this.view = new this.View(_.extend({
			component: this,				// Let this view directly call our functions by name in the Backbones event object
			template: this.Template	// Pass the template from our prototype for rendering
		}, options)).render();	// Immediately call render so we can pass child nodes to our subcomponents
		
		// Since we'll use these functions as listeners, make sure they always execute in our scope
		this.bind(this.navigateBack);
		this.bind(this.showEditor);
		this.bind(this.showDetails);
		this.bind(this.newContact);
		this.bind(this.deleteContact);
		this.bind(this.handleSave);
		
		/*
			Item index
			This component will display the list of items and the search box
		*/  
		this.addComponent(new this.IndexComponent({
			el: this.view.$('.index')
		}), 'index')
		.on('list:itemSelected', this.showDetails)	// Handle clicks on list items
		.on('deleteItem', this.deleteContact)	// Handle delete operations
		.on('newContact', this.newContact);		// Handle clicks to "+" button
		
		/*
			Item details
			This component will display the details of the clicked item
		*/
		this.addComponent(new this.DetailsComponent({
			el: this.view.$('.details'),
			Model: this.Model
		}), 'details')
		.on('navigateBack', this.navigateBack)	// Handle clicks to "All Contacts" button
		.on('showEditor', this.showEditor);		// Handle clicks to "Edit" button
		
		/*
			Item editor
			This component will allow us to edit a model
		*/
		this.addComponent(new this.EditorComponent({
			el: this.view.$('.editor'),
			Model: this.Model
		}), 'editor')
		.on('navigateBack', this.navigateBack)	// Handle clicks to "Cancel" button
		//.on('saved', this.handleSave)			// Show the details view on successful save. This is needed for real APIs
		.on('model:saveFailed', this.handleSave); 	// Show the details view on failed save. This is needed for our faked API
												// We need this one because we don't have a real API; normally you'd show an error
	},
	
	handleSave: function(evt) {
		console.log('[√] Contact save faked');
		/*
		Because we're not refreshing from a server, we need to add newly created
		contacts to our collection so they render in the list. In real situation,
		you would simply do this.index.list.refresh() to fetch the models from the
		server and re-render the list
		
		*/
		
		// Check if the model is new or old
		var newModel = true;
		this.index.list.collection.some(function(existingModel) {
			if (existingModel == evt.model)
				newModel = false;
			return true;
		});

		// Add it to our collection if it's not there
		if (newModel)
			this.index.list.collection.add(evt.model);
		
		// All saves will fail, so we have to manually trigger the change event
		evt.model.trigger('change'); // This will cause the list to re-render
		
		/*
		Note: We want to operate on the same model as loaded by the editor because we don't have a real API.
			
		However, this approach won't cause the list to refresh if the editor is brought up from the hash
		as the editor loaded the model from the server instead of having it passed to it from the list
		
		IN REAL WORLD SITUATIONS: use trigger: true on the router
		*/
		
		// Pass the model directly to the details component
		// This will cause a re-render, and will use the model we loaded in the editor if editor was brought up by router
		this.details.show({
			model: evt.model
		});
		
		// Update the hash
		Contacts.router.navigate('details/'+evt.model.id, { trigger: false });
		
		/*
		//FOR REAL APIS:
		
		// Show details
		Contacts.router.navigate('details/'+this.editor.model.id, { trigger: true });
		*/
	},
	
	// Components are referenced in the prototype so they can be overridden
	IndexComponent: Contacts.Index,
	DetailsComponent: Contacts.Details,
	EditorComponent: Contacts.Editor,
	
	// Templates would normally be compiled server-side, then referenced in the prototype so they can be overridden
	Template: Contacts.Templates.App,
	
	// View is defined in the prototype so it can be overridden
	View: F.View.extend({
		className: 'Contacts'
	}),
	
	navigateBack: function(component) {
		if (component === this.editor && this.editor.model && this.editor.model.id) {
			// Show the details view if we're coming back from the editor and we're not adding a new model
		
			/*
			Note: We want to operate on the same model as loaded by the editor because we don't have a real API.
			
			However, this approach won't cause the list to refresh if the editor is brought up from the hash
			as the editor loaded the model from the server instead of having it passed to it from the list
			
			IN REAL WORLD SITUATIONS: use trigger: true on the router
			*/
			Contacts.router.navigate('details/'+this.editor.model.id, { trigger: false });
			
			// Show the details view for the model from the editor
			this.details.show({
				model: this.editor.model
			});
		}
		else {
			// Just go to the list otherwise
			Contacts.router.navigate('', { trigger: true });
		}
	},
	
	newContact: function() {
		// Change the hash to reflect the app state
		Contacts.router.navigate('new', { trigger: false });
		
		// Show the editor with a blank model
		this.editor.clear();
		this.editor.show();
	},
	
	deleteContact: function(model) {
		// Destroy the model
		model.destroy();
	},
	
	showEditor: function(model) {
		if (F.options.debug)
			console.log('%s: showing editor for %s', this.toString());

		/*
		Set route, but don't navigate. Normally, you would use trigger: true,
		which causes the component to fetch the model from the server. For this demo,
		we'll just edit the model in place without going to the server
		*/
		Contacts.router.navigate('edit/'+model.id, { trigger: false });

		/*
		Since we have no API, instead of passing the ID for the editor to fetch it,
		Pass the editor component the model we were viewing details for so it operates on it directly
		*/
		this.editor.show({
			model: model
		});
	},
	
	// We'll use this function to pass the itemSelected event up to our parent
	showDetails: function(info) {
		if (F.options.debug)
			console.log('%s: showing details for %s', this.toString(), info.model.name);
		
		// Set route, but don't navigate. Normally, you would navigate and avoid the call below, but we're not fetching models from the server
		Contacts.router.navigate('details/'+info.model.id, { trigger: false });

		// Give the Details component the model of the selected item and it will use it as is
		// Note: we don't generally do this because someone may have edited the contact on the server
		this.details.show({
			model: info.model
		});
		
		/*
		// Normally, we give the Details component the id of the model and it will fetch it from the server
		this.details.show({
			id: info.model.id
		});
		*/
	}
});
