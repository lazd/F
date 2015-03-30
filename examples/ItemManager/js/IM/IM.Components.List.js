IM.Components.List = new PseudoClass({
	toString: 'List',
	extend: F.ListComponent,
	
	// F.CollectionComponent (which F.List inherits from) can send params when it fetches the collection, provide defaults here
	// Params passed to subsequent calls to this.load(params) will be merged with default params provided here
	options: {
		params: {
			sort: 'name'
		}
	},
	
	// The collection we'll be using
	Collection: IM.Collections.Items,
	
	// Our custom template
	ItemTemplate: IM.Templates.ListItem,
	
	// Extend the list view so we give it the CSS class we want
	ListView: F.ListComponent.prototype.ListView.extend({
		className: 'itemList'
	})
});
