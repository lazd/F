// Class: Person
var Person = new Class({
	a: function() { return 'a';	},
	b: function() { return 'b';	}
});

// Class: Child
var Child = new Class({
	extend: Person,
	c: function() { return "c"; };
});

// Create an instance of a child
var kid = new Child();

// Calls to kid.a actually call Person.prototype.a
kid.a();