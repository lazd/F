// Class: Person
function Person() {}

// Methods every Person should have
Person.prototype.a = function() { return "a"; };
Person.prototype.b = function() { return "b"; };

// Class: Child
function Child() {}

// inherit from Person
Child.prototype = new Person();

// Methods every Child should have
Child.prototype.c = function() { return "c"; };

// Create an instance of a child
var kid = new Child();

// Calls to kid.a actually call Person.prototype.a
kid.a(); // "a"

