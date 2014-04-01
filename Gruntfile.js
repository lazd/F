/*global module:false*/
module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
	    pkg: grunt.file.readJSON('package.json'),
	    meta: {
			banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'* <%= pkg.homepage %>/\n' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>; Licensed <%= pkg.license %> */\n'
	    },
		dirs: {
			build: 'build/'
		},
		clean: {
			build: '<%= dirs.build %>/**'
		},
		jsdoc: {
			F: {
				src: ['js/**'],
				dest: '<%= dirs.build %>jsdoc'
			}
		},
		copy: {
			examples: {
				files: {
					'<%= dirs.build %>/': 'examples/**/*'
				}
			}
		},
		concat: {
			options: {
				banner: '<%= meta.banner %>'
			},
			js: {
				src: [
					'node_modules/pseudoclass/source/Class.js',

					'js/F/F.js',
					'js/F/F.Utilities.js',
					'js/F/F.EventEmitter.js',
					'js/F/F.View.js',
					'js/F/F.Component.js',
					'js/F/F.ModelComponent.js',
					'js/F/F.CollectionComponent.js',
				
					'js/F/components/*'
				],
				dest: '<%= dirs.build %>js/F/F.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= meta.banner %>'
			},
			js: {
				files: {
					'<%= dirs.build %>js/F/F.min.js': '<%= dirs.build %>js/F/F.js'
				}
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
					'F',			// component framework
					'Class',		// modified version of Crockford's new_constructor
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
				tasks: ['jshint', 'concat:js']
			},
			uglify: {
				files: ['<config:concat.js.dest>'],
				tasks: ['uglify']
			}
		}
	});
    
	// Default task
	grunt.registerTask('default', ['clean','jshint','copy','concat','uglify']);
	
	grunt.registerTask('build', ['clean','jshint','copy','concat','uglify','jsdoc']);
	
	grunt.registerTask('dev', ['clean','jshint','copy','concat']);
	
	grunt.loadTasks('tasks');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
};
