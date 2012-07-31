IM.Components.App = new Class({
	toString: 'IMApp',
	extend: F.Component,
	
	/*
		Options can be used to insert a rendered view into the DOM:		
			el: options.el,				// Directly use the el provided as this view's container
			parent: options.parent,		// Or, create a container and insert it into the parent
	*/
	construct: function(options) {
		// Hold the listItem and model associated with the currently selected item
		this.selectedItem = null;
		
		// The main view for the item manager
		this.view = new this.View(_.extend({
			component: this,				// Let this view directly call our functions by name in the Backbones event object
			template: this.Template	// Pass the template from our prototype for rendering
		}, options)).render();	// Immediately call render so we can pass child nodes to our subcomponents
		
		/*
			Item list
			This component will display the list of items
		*/  
		this.addComponent(new this.ListComponent({
			parent: this.view.$('.index'),
			visible: true,
			Collection: this.Collection
		}), 'list');          
		
		/*
			Item details
			This component will display the details of the clicked item
		*/
		this.addComponent(new this.DetailsComponent({
			parent: this.view.$('.details'),
			Model: this.Model
		}), 'details');

		// When an item is selected in the "list", tell the "details" component to display it
		// Also, notify any parent components that an item is selected
		this.list.on('itemSelected', this.itemSelected.bind(this));
		
		// Go back to list from details
		this.details.on('component:hidden', this.deselectItem.bind(this));
	},
	
	// Components used for List and Details are referenced in the prototype so they can be overridden
	ListComponent: IM.Components.List,
	DetailsComponent: IM.Components.Details,
	
	// Templates would normally be compiled server-side, then referenced in the prototype so they can be overridden
	Template: IM.Templates.Manager,
	
	// View is defined in the prototype so it can be overridden
	View: F.View.extend({
		tag: 'div',
		className: 'ItemManager'
	}),
	
	// We'll use this function to deselect an item from the list when the details view is closed
	deselectItem: function() {
		if (this.selectedItem) {
			this.selectedItem.listItem.removeClass('selected');
		}
	},
	
	// We'll use this function to pass the itemSelected event up to our parent
	itemSelected: function(info) {
		console.log('%s: selected item %s', this.toString(), info.model.id);
			
		// Give the Details component the id of the model and it will fetch it from the server
		this.details.show({
			id: info.model.id
		});
		
		/*
		// Or, give the Details component the model of the selected item and it will use it as is
		this.details.show({
			model: info.model
		});
		*/
		
		// Unhighlight the old item
		this.deselectItem();
		
		// Make the new item appear highlighted
		info.listItem.addClass('selected');
		
		// Store the selected item's info
		this.selectedItem = info;
	}
});
