ItemManager.Manager = new Class({
	toString: 'ItemManager',
	extend: F.Component,
	
	// Default optionsuration, passed to parent constructors
	options: {
		singly: false // show both components at once
	},
	
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
			component: this,			// Let this view directly call our functions by name in the Backbones event object
			template: this.Template		// Pass the template from our prototype for rendering
		}, options)).render();	// Immediately call render so we can pass child nodes to our subcomponents
		
		/*
			Item list
			This component will display the list of items
		*/  
		this.addComponent(new this.ListComponent({
			parent: this.view.$('.index')
		}), 'list');          
		
		/*
			Item details
			This component will display the details of the clicked item
		*/
		this.addComponent(new this.DetailsComponent({
			parent: this.view.$('.details')
		}), 'details');

		// Make sure itemSelected always executes in scope
		this.bind(this.itemSelected);

		// When an item is selected in the List, tell the Details component to display it
		// Also, notify any parent components that an item is selected
		this.list.on('itemSelected', this.itemSelected);
	},
	
	// Components used for List and Details are referenced in the prototype so they can be overridden
	ListComponent: ItemManager.List,
	DetailsComponent: ItemManager.Details,
	
	// Templates would normally be compiled serverside, specified in the prototype so they can be overridden
	Template: ItemManager.Templates.Manager,
	
	// View is defined in the prototype so it can be overridden
	View: F.View.extend({
		tag: 'div',
		className: 'ItemManager'
	}),

	show: function() {
		// First, show ourself
		this.inherited(arguments);

		// Next, tell the List to show itself, but don't notify us
		this.list.show({ silent: true });
	},
	
	// We'll use this function to pass the itemSelected event up to our parent
	itemSelected: function(info) {
		console.log('%s: selected item %s', this.toString(), info.model.id);
			
		// Give the Details componment the model of the selected item
		this.details.show({
			id: info.model.id
		});
		
		if (this.selectedItem) {
			// Unhighlight the old item
			this.selectedItem.listItem.removeClass('selected');
		}
		
		// Make the new item appear highlighted
		info.listItem.addClass('selected');
		
		// Store the selected item's info
		this.selectedItem = info;
		
		// Bubble the event up the chain
		this.trigger('itemSelected', info);
	}
});
