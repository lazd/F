ItemManager.Collections = {};

ItemManager.Collections.Items = Backbone.Collection.extend({
	url: 'items.json',
	model: ItemManager.Models.Item
});
