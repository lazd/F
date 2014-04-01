describe('F.ListComponent', function() {
	var Model = Backbone.Model.extend();

	var Collection = Backbone.Collection.extend({
		model: Model
	});

	var List = F.ListComponent.extend({
		toString: 'List',
		extend: F.ListComponent,
		
		options: {
			params: {
				sort: 'name'
			}
		},
		
		Collection: Collection,
		
		ItemTemplate: function(model) {
			var str = '<strong>'+model.name+'</strong>';
			if (model.description) {
				str += '<p>'+model.description+'</p>';
			}
			return str;
		}
	});

	var list;
	var $el;
	beforeEach(function() {
		// Kill the old list
		if (list) {
			list.destruct();
		}

		// Previous $el will have been destroyed by view
		$el = $('<ul/>').appendTo('body');

		// Make a fresh list
		list = new List({
			el: $el
		});
	});

	// Add a model to the list's collection
	function addModel() {
		var model = new Model({
			name: 'Item 1',
			description: 'The first item'
		});

		list.collection.add(model);

		return model;
	}

	it('should re-render when models are added to a collection', function() {
		var model = addModel();

		expect($el.children().length).to.equal(1);
		expect($el.children(0).find('strong')).to.have.text(model.get('name'));
		expect($el.children(0).find('p')).to.have.text(model.get('description'));
	});

	it('should re-render when models are removed from a collection', function() {
		var model = addModel();

		expect($el.children().length).to.equal(1);

		list.collection.remove(model);

		expect($el.children().length).to.equal(0);
	});

	it.skip('send params with requests', function() {
	});
});
