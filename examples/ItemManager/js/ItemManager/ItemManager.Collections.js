ItemManager.Collections = {};

ItemManager.Collections.Items = Backbone.Collection.extend({
	url: 'api/items.json',
	model: ItemManager.Models.Item
});
