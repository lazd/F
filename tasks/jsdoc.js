'use strict';

module.exports = function(grunt) {
	var exports = {};

	grunt.task.registerMultiTask('jsdoc', 'This builds jsdoc from source files.', function() {
		var async = this.async;

		this.files.forEach(function(file) {
			// Run JSDoc
			exports.jsdoc({
				done: async(),
				src: grunt.file.expand({ filter: 'isFile' }, file.src),
				dest:  file.dest
			});
		});
		
	});

	// Expose for testing
	exports.jsdoc = function(options) {
		// jsdoc args
		var args = [
			'node_modules/jsdoc/jsdoc.js',
			'-t',
			'node_modules/jsdoc/templates/default',
			'-d',
			options.dest
		];
		
		// Add source files
		args = args.concat(options.src);
		
		return grunt.util.spawn(
			{
				cmd: 'node',
				args: args
			},
			function(err, result, code) {
				if (err) {
					grunt.log.error(err.stderr);
				}
				else {
					grunt.log.writeln(result.stdout);

					// Print a success message.
					grunt.log.ok('JSDoc built.');
				}
				
				grunt.log.writeln();
				options.done(err);
			}
		);
	};

	return exports;
};
