describe('F.ListComponent', function() {
	// @todo add url and serve static files with Karma
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

	describe('with collection option', function() {
		it('should use a pre-loaded collection passed as options.collection', function() {
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

			expect($el.children().length).to.equal(0, 'No rendering should have happened yet');

			// Show the list, which causes it to render
			list.show();

			var $children = $el.children();
			var $first = $($children[0]);
			var $second = $($children[1]);

			expect($children.length).to.equal(2, 'Two list items should be present');
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

			expect($el.children().length).to.equal(0, 'No rendering should have happened yet');

			// Show the list, which causes it to render
			list.show();

			expect($el.children().length).to.equal(1, 'One list item should be present');
			expect($el.find('strong:eq(0)')).to.have.text('Item 1');

			// Add a new model
			var model = new Model({
				name: 'Item 2',
				description: 'The second item'
			});
			list.collection.add(model);

			expect($el.children().length).to.equal(2, 'Two list items should be present');
			expect($el.find('strong:eq(0)')).to.have.text('Item 1');
			expect($el.find('strong:eq(1)')).to.have.text('Item 2');
			
			// Remove the second model
			list.collection.remove(model);

			expect($el.children().length).to.equal(1, 'Only one list item should be present');
			expect($el.find('strong:eq(0)')).to.have.text('Item 1');
		});

		it('should not render models added to the collection the list has been rendered already', function() {
			var list = new List({
				el: $el,
				collection: new Collection([
					{
						name: 'Item 1',
						description: 'The first item'
					}
				])
			});

			expect($el.children().length).to.equal(0, 'No rendering should have happened yet');

			expect(list.collection.length).to.equal(1, 'Collection should have first model');

			// Add a new model
			var model = new Model({
				name: 'Item 2',
				description: 'The second item'
			});
			list.collection.add(model);

			expect($el.children().length).to.equal(0, 'No rendering should have happened yet');

			expect(list.collection.length).to.equal(2, 'Collection should have both models');

			// Show the list, which causes it to render
			list.show();

			expect($el.children().length).to.equal(2, 'Both models should have been rendered');
		});
	});

	describe.skip('with remote data', function() {
		it.skip('send params with requests', function() {
		});
	});
});
