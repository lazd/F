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
			'-jar',
			'util/jsdoc-toolkit/jsrun.jar',
			'util/jsdoc-toolkit/app/run.js',
			'-a',
			'-t=util/jsdoc-toolkit/templates/jsdoc',
			'-d='+options.dest
		];
		
		// Add source files
		args = args.concat(options.src);
		
		return grunt.util.spawn(
			{
				cmd: 'java',
				args: args
			},
			function(err, result, code) {
				var success = (code == 0);
			
				if (success) {
					grunt.log.writeln(result.stdout);

					// Print a success message.
					grunt.log.ok('JSDoc built.');
				}
				else {
					grunt.log.error(err.stderr);
				}
				
				grunt.log.writeln();
				options.done(success);
			}
		);
	};

	return exports;
};
