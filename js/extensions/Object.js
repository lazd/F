if (!Object.create) {
	/**
	 * Creates a new object with the specified prototype object
	 * @param {Object} o the prototype to use
	 */
	Object.create = function (o) {
		if (arguments.length > 1) {
			throw new Error('Object.create implementation only accepts the first parameter.');
		}
		function F() {}
		F.prototype = o;
		return new F();
	};
}
