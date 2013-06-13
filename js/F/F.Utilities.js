/**
	Extend the view of the provided component with a deep copy of the events property
	
	@param {Object}		component	Component whose view should be extended
	@param {String}		properties	Properties to mix in to resulting view
	
	@todo add pushToArray option to always push to an array
	
	@returns {F.Component}	this, chainable
*/
F.extendView = function(component, properties) {
	var view = component.prototype.View || component.prototype.ListView;
	if (view) {
		properties.events = _.extend({}, view.prototype.events, properties.events);
		return view.extend(properties);
	}
};

/**
	Add a value to a property that should become an array when and only when collisions occurr
	
	@param {Object}		object	Object to set the property on
	@param {String}		prop	Proprety to set
	@param {Mixed}		Value	Value to set
	
	@todo add pushToArray option to always push to an array
*/
F.addToSet = function(obj, prop, value) {
	if (typeof obj[prop] !== 'undefined') {
		// Turn it into an array
		if (!_.isArray(obj[prop]))
			obj[prop] = [obj[prop]];
		
		// Push the new value
		obj[prop].push(value);
	}
	else {
		// Directly set the value if there is only one
		obj[prop] = value;
	}
};

/**
	Set a property of an object using dot notiation
	
	@param {Object}		object		Optional object to set the property on. A new object will be created if no object was passed.
	@param {String}		prop		Proprety to set
	@param {Value}		prop		The new value
	@param {Boolean}	makeArrays	Use F.addToSet on the property to 
	
	@todo add push option to always push to an array
	
	@returns {Object}	Object the property was set on or the created object
*/
F.set = function(obj, prop, value, makeArrays) {
	if (!obj) obj = {};
	
	var propParts = prop.split('.');
	
	if (propParts.length > 1) {
		var curObj = obj;
		propParts.forEach(function(part, index) {
			if (index === propParts.length-1) { // Set the value if we've reached the end of the chain
				if (makeArrays)
					F.addToSet(curObj, part, value);
				else 
					curObj[part] = value;
			}
			else {
				if (typeof curObj[part] === 'undefined') // Define the part if it's not defined
					curObj[part] = {};
				
				curObj = curObj[part]; // Drill inward
			}
		});
	}
	else {
		if (makeArrays)
			F.addToSet(obj, prop, value);
		else 
			obj[prop] = value;
	}
	
	return obj;
};
