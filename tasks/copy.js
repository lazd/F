module.exports = function(grunt) {
	grunt.registerMultiTask('copy', 'This copies files.', function() {
		// Expand the list of files
		var config = grunt.config();
		var dest = grunt.template.process(this.data.dest, config);
		
		// Make sure the dir exists
		grunt.file.mkdir(dest);
		
		var srcFiles = grunt.file.expand(this.data.src);
		
		// Copy everything
		srcFiles.forEach(function(src) {
			// remove slashes from dirs
			if (src.charAt(src.length-1) == '/')
				src = src.slice(0, src.length-1);
			
			src = grunt.template.process(src, config);
			
			console.log('Copied %d files to %s', src.length, dest);
			
			grunt.helper('cp', src, dest);	
		});
		
		return true;
	});
	
	grunt.registerHelper('cp', function(src, dest) {
		return grunt.utils.spawn(
			{
				cmd: 'cp',
				args: ['-rp', src, dest]
			},
			function() {}
		);
	});
};

