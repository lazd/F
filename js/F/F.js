/** 
	The main F namespace.
	
	@namespace
	
	@property {Object}	options							Options for all F components.
	@param {Boolean}	options.debug					If true, show debug messages for all components.
	@param {Boolean}	options.precompiledTemplates	Set to false if you need Handlebars.template() called on your templates
*/
var F = F || {};

try {
	window['ƒ'] = F;
}
catch (err) {
	console.log("ƒ: could not set ƒ variable");
}

F.options = {
	debug: false,
	precompiledTemplates: true
};

// Let F be a global event hub
 _.extend(F, Backbone.Events);
