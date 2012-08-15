var Person = new Class({
	construct: function() { console.log('Building a Person...'); },
	destruct: function() { console.log('Destroying a Person...'); }
});

var Child = new Class({
	extend: Person,
	construct: function() { console.log('Building a Child...'); },
	destruct: function() { console.log('Destroying a Child...'); }
});

// Create an instance of a child
var kid = new Child();
// "Building a Person..."
// "Building a Child..."

// Destroy the instance
kid.destruct();
// "Destroying a Child..."
// "Destroying a Person..."