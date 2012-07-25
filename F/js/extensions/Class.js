/*
	Function: Class
	Crockford's new_constructor pattern, modified to allow walking the prototype chain, automatic init/destruct calling of super classes, and easy toString methods
	
	Parameters:
		descriptor: {
			toString - a string or method to use for the toString of this class and instances of this class
			extend - the class to extend
			construct - the constructor (setup) method for the new class
			destruct - the destructor (teardown) method for the new class
			prototype - methods and properties for the new class
		}
*/
function Class(descriptor) {
	descriptor = descriptor || {};
	
	if (descriptor.hasOwnProperty('extend') && !descriptor.extend) {
		console.warn('Class: %s is attempting to extend a non-truthy thing', descriptor.toString == 'function' ? descriptor.toString : descriptor.toString, descriptor.extend);
	}
	
	// Extend Object by default
	var extend = descriptor.extend || Object;

	// Construct and destruct are not required
	var construct = descriptor.construct;
	var destruct = descriptor.destruct;

	// Remove special methods and keywords from descriptor
	delete descriptor.extend;
	delete descriptor.destruct;
	delete descriptor.construct;
	
	// Add toString method, if necessary
	if (descriptor.hasOwnProperty('toString') && typeof descriptor.toString !== 'function') {
		// Return the string provided
		var classString = descriptor.toString;
		descriptor.toString = function() {
			return classString.toString();
		};
	}
	else if (!descriptor.hasOwnProperty('toString') && extend.prototype.hasOwnProperty('toString')) {
		// Use parent's toString
		descriptor.toString = extend.prototype.toString;
	}
	
	// The remaining properties in descriptor are our methods
	var methodsAndProps = descriptor;
	
	// Create an object with the prototype of the class we're extending
	var prototype = Object.create(extend && extend.prototype);
	
	// Store super class as a property of the new class' prototype
	prototype.superClass = extend.prototype;
	
	// Copy new methods into prototype
	if (methodsAndProps) {	
		for (var key in methodsAndProps) {
			if (methodsAndProps.hasOwnProperty(key)) {
				prototype[key] = methodsAndProps[key];
				
				// Store the method name so calls to inherited() work
				if (typeof methodsAndProps[key] === 'function') {
					prototype[key]._methodName = key;
					prototype[key]._parentProto = prototype;
				}
			}
		}
	}
	
	/*
		Function: inherited
		A function that calls an inherited method
	
		Parameters:
			args - unadultrated arguments array from calling function
	*/
	prototype.inherited = function(args) {
		// Get the function that call us from the passed arguments objected
		var caller = args.callee;

		// Get the name of the method that called us from a property of the method
		var methodName = caller._methodName;
		
		if (!methodName) {
			console.error("Class.inherited: can't call inherited method: calling method did not have _methodName", args.callee);
			return;
		}

		// Start iterating at the prototype that this function is defined in
		var curProto = caller._parentProto;
		var inheritedFunc = null;
		
		// Iterate up the prototype chain until we find the inherited function
		while (curProto.superClass) {
			curProto = curProto.superClass;
			inheritedFunc = curProto[methodName];
			if (typeof inheritedFunc === 'function')
				break;
		}
		
		if (typeof inheritedFunc === 'function') {
			// Store our inherted function
			var oldInherited = this.inherited;
			
			// Overwrite our inherted function with that of the prototype so the called function can call its parent
			this.inherited = curProto.inherited;
			
			// Call the inherited function our scope, apply the passed args array
			var retVal = inheritedFunc.apply(this, args);
			
			// Revert our inherited function to the old function
			this.inherited = oldInherited;
			
			// Return the value called by the inherited function
			return retVal;
		}
		else {
			console.warn("Class.inherited: can't call inherited method for '%s': no method by that name found", methodName);			
		}
	};

	prototype.bind = function(func) {
		// Bind the function to always execute in scope
		var boundFunc = func.bind(this);
		
		// Store the method name
		boundFunc._methodName = func._methodName;
		
		// Store the bound function back to the class
		this[boundFunc._methodName] = boundFunc;
		
		// Return the bound function
		return boundFunc;
	};

	/*
		Function: destruct
		Call the destruct method of all inherited classes
	*/
	prototype.destruct = function() {
		// Call our destruct method first
		if (typeof destruct === 'function') {
			destruct.apply(this);
		}
		
		// Call superclass destruct method after this class' method
		if (extend && extend.prototype && typeof extend.prototype.destruct === 'function') {
			extend.prototype.destruct.apply(this);			
		}
	};
	
	// Create a chained construct function which calls the superclass' construct function
	prototype.construct = function() {
		// Add a blank object as the first arg to the constructor, if none provided
		if (arguments[0] === undefined) {
			arguments.length = 1;
			arguments[0] = {};
		}
		
		// call superclass constructor
		if (extend && extend.prototype && typeof extend.prototype.construct === 'function') {
			extend.prototype.construct.apply(this, arguments);			
		}

		// call constructor
		if (typeof construct === 'function') {
			construct.apply(this, arguments);
		}
	};
	
	// Create a function that generates instances of our class and calls our construct functions
	var instanceGenerator = function() {
		// Create a new object with the prototype we built
		var instance = Object.create(prototype);
		
		// Call all inherited construct functions
		prototype.construct.apply(instance, arguments);
		
		return instance;
	};
	
	// Set the prototype of our instance generator to the prototype of our new class so things like MyClass.prototype.method.apply(this) work
	instanceGenerator.prototype = prototype;
	
	// The constructor, as far as JS is concerned, is actually our instance generator
	prototype.constructor = instanceGenerator;
	
	return instanceGenerator;
}
