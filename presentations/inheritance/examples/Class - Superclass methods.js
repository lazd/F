// Class: Person
var Person = new Class({
	a: function() { return 'a';	}
});

// Class: Child
var Child = new Class({
	extend: Person,
	a: function() { 
		var parentReturnVal = this.inherited(arguments);
		return parentReturnVal+"å";
	};
});

// Create an instance of a Child
var kid = new Child();

kid.a(); // "aå"