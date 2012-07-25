/**
 * Convert the first letter of the string to uppercase
 */
String.prototype.capitalize = function() {
	return this.slice(0, 1).toUpperCase()+this.slice(1);
};

/**
 * Convert the first letter of the string to lowercase
 */
String.prototype.decapitalize = function() {
	return this.slice(0, 1).toLowerCase()+this.slice(1);
};
