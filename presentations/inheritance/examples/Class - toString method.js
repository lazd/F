var Person = new Class({
	toString: 'Person'
});

var person = new Person();

person.toString(); // "Person"

alert(person+' says hi!'); // "Person says hi!"