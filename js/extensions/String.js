String.prototype.decapitalize = function() {
	return this.slice(0, 1).toLowerCase()+this.slice(1);
};

String.prototype.capitalize = function() {
	return this.slice(0, 1).toUpperCase()+this.slice(1);
};
