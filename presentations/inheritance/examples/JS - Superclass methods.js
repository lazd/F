// Class: Person
function Person() {}
Person.prototype.a = function() { return "a"; };

// Class: Child
function Child() {}
Child.prototype = new Person();
Child.prototype.a = function() {
	// Call the parent method by referring to its prototype
	var parentReturnVal = Person.prototype.a.apply(this, arguments);
	return parentReturnVal+"å";
};

// Create an instance of a child
var kid = new Child();

kid.a(); // "aå"