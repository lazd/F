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

	var $el;
	beforeEach(function() {
		// Kill the old element
		if ($el) {
			$el.remove();
		}

		// Make a new element
		$el = $('<ul/>').appendTo('body');
	});

	it('should re-render when models are added to a collection', function() {
		var list = new List({
			el: $el
		});

		var model1 = new Model({
			name: 'Item 1',
			description: 'The first item'
		});
		list.collection.add(model1);

		var model2 = new Model({
			name: 'Item 2',
			description: 'The second item'
		});
		list.collection.add(model2);

		var $children = $el.children();
		var $first = $($children[0]);
		var $second = $($children[1]);

		expect($children.length).to.equal(2);
		expect($first.find('strong')).to.have.text(model1.get('name'));
		expect($second.find('strong')).to.have.text(model2.get('name'));
	});

	it('should re-render when models are removed from a collection', function() {
		var list = new List({
			el: $el
		});

		var model = new Model({
			name: 'Item 1',
			description: 'The first item'
		});

		list.collection.add(model);

		expect($el.children().length).to.equal(1);

		list.collection.remove(model);

		expect($el.children().length).to.equal(0);
	});

	describe('with collection option', function() {
		it('should render when passed a pre-loaded collection', function() {
			var list = new List({
				el: $el,
				collection: new Collection([
					{
						name: 'Item 1',
						description: 'The first item'
					},
					{
						name: 'Item 2',
						description: 'The second item'
					}
				])
			});

			// Show the list, which causes it to render
			list.show();

			var $children = $el.children();
			var $first = $($children[0]);
			var $second = $($children[1]);

			// Should have both models
			expect($children.length).to.equal(2);
			expect($first.find('strong')).to.have.text('Item 1');
			expect($second.find('strong')).to.have.text('Item 2');
		});

		it('should re-render when models are added/removed from a pre-loaded collection', function() {
			var list = new List({
				el: $el,
				collection: new Collection([
					{
						name: 'Item 1',
						description: 'The first item'
					}
				])
			});

			// Show the list, which causes it to render
			list.show();

			// Should have the first model
			expect($el.children().length).to.equal(1);
			expect($el.find('strong:eq(0)')).to.have.text('Item 1');

			// Add a new model
			var model = new Model({
				name: 'Item 2',
				description: 'The second item'
			});
			list.collection.add(model);

			// Should have both models
			expect($el.children().length).to.equal(2);
			expect($el.find('strong:eq(0)')).to.have.text('Item 1');
			expect($el.find('strong:eq(1)')).to.have.text('Item 2');
			
			// Remove the second model
			list.collection.remove(model);

			// Should only have the first
			expect($el.children().length).to.equal(1);
			expect($el.find('strong:eq(0)')).to.have.text('Item 1');
		});
	});

	it.skip('send params with requests', function() {
	});
});
