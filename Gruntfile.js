/*global module:false*/
module.exports = function(grunt) {
	var manifest = require('./manifest.js');

	// Project configuration.
	grunt.initConfig({
	    pkg: grunt.file.readJSON('package.json'),
	    meta: {
			banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'* <%= pkg.homepage %>/\n' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>; Licensed <%= pkg.license %> */\n'
	    },
		clean: {
			build: 'build//*'
		},
		jsdoc: {
			F: {
				src: ['js/**'],
				dest: 'build/jsdoc'
			}
		},
		copy: {
			examples: {
				files: {
					'build/': 'examples/**/*',
					'build/examples/vendor/underscore.js': 'bower_components/underscore/underscore.js',
					'build/examples/vendor/backbone.js': 'bower_components/backbone/backbone.js',
					'build/examples/vendor/jquery.js': 'bower_components/jquery/dist/jquery.js',
					'build/examples/vendor/handlebars.js': 'bower_components/handlebars/handlebars.js',
					'build/examples/vendor/less.js': 'bower_components/less/dist/less-1.6.3.js'
				}
			}
		},
		concat: {
			options: {
				banner: '<%= meta.banner %>',
				sourceMap: true,
				sourceMapStyle: 'embed',
				sourceMapName: 'build/js/F/F.min.js.map'
			},
			js: {
				src: [
					'node_modules/pseudoclass/source/Class.js'
				].concat(manifest),
				dest: 'build/js/F/F.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= meta.banner %>',
				sourceMap: true,
				sourceMapIncludeSources: true,
				sourceMapName: 'build/js/F/F.min.js.map'
			},
			js: {
				files: {
					'build/js/F/F.min.js': 'build/js/F/F.js'
				}
			}
		},
		karma: {
			options: {
				configFile: 'karma.conf.js',
				reporters: ['progress', 'coverage']
			},
			// Watch configuration
			watch: {
				background: true,
				reporters: ['progress'],
				preprocessors: {} // Disable coverage when watching for easier debugging
			},
			// Single-run configuration for development
			single: {
				singleRun: true
			}
		},
		jshint: {
			Gruntfile: 'Gruntfile.js',
			source: 'js/**/*.js',
			options: {
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true,
				smarttabs: true,
				predef: [
					'require',		// Node.js
					'F',			// component framework
					'PseudoClass',	// PseudoClass
					'$',			// jQuery
					'jQuery',		// jQuery
					'console',		// console.log...
					'Backbone',		// Backbone
					'_',			// Underscore
					'Handlebars'	// Handlebars
				]
			}
		},
		watch: {
			copyExamples: {
				files: ['examples/**/*'],
				tasks: ['copy:examples']
			},
			jshint: {
				files: ['Gruntfile.js'],
				tasks: ['jshint']
			},
			concatjs: {
				files: ['js/**/*.js'],
				tasks: ['concat:js']
			},
			uglify: {
				files: ['<config:concat.js.dest>'],
				tasks: ['uglify']
			},
			test: {
				files: ['js/**/*.js', 'tests/**/*.js'],
				tasks: ['jshint', 'karma:watch:run']
			}
		}
	});
    
	// Default task
	grunt.registerTask('default', ['clean', 'jshint', 'copy', 'concat', 'uglify']);
	
	grunt.registerTask('build', ['clean', 'jshint', 'copy', 'concat', 'uglify', 'jsdoc']);
	
	grunt.registerTask('dev', ['clean', 'jshint', 'copy', 'concat', 'karma:watch:start', 'watch']);

	grunt.registerTask('test', ['karma:single']);
	
	grunt.loadTasks('tasks');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
};
