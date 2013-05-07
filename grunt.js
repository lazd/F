/*global module:false*/
module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		meta: {
			version: '0.1.0',
			appName: 'F',
			appWebSite: 'lazd.github.com/F',
			copyRight: 'Lawrence Davis',
			license: 'BSD',
			banner: '/*! <%= meta.appName %> - v<%= meta.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'* http://<%= meta.appWebSite %>/\n' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
			'<%= meta.copyRight %>; Licensed <%= meta.license %> */'
		},
		dirs: {
			build: 'build/'
		},
		clean: {
			build: '<%= dirs.build %>'
		},
		jsdoc: {
			F: {
				src: ['js/**'],
				dest: '<%= dirs.build %>jsdoc'
			}
		},
		copy: {
			examples: {
				src: ['examples/*'],
				dest: '<%= dirs.build %>examples'
			}
		},
		lint: {
			files: [
				'grunt.js',
				'js/**'
			]
		},	
		concat: {
			js: {
				src: [
					'<banner>',
					'js/Class/Class.js',

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
		min: {
			js: {
				src: ['<banner>', '<config:concat.js.dest>'],
				dest: '<%= dirs.build %>js/F/F.min.js'
			}
		},
		watch: {
			copyExamples: {
				files: '<config:copy.examples.src>',
				tasks: 'copy:examples'
			},
			lint: {
				files: '<config:lint.files>',
				tasks: 'lint'
			},
			concatjs: {
				files: 'js/**',
				tasks: 'concat:js'
			},
			min: {
				files: '<config:concat.js.dest>',
				tasks: 'min'
			}
		},
		jshint: {
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
					'F',				// component framework
					'Class',			// modified version of Crockford's new_constructor
					'$',				// jQuery
					'jQuery',			// jQuery
					'console',			// console.log...
					'Backbone',			// Backbone
					'_',				// Underscore
					'Handlebars'		// Handlebars
				]
			},
			globals: {}
		}
	});
    
	// Default task
	grunt.registerTask('default', 'clean lint copy concat min jsdoc');
	
	grunt.registerTask('build', 'clean lint copy concat min');
	
	grunt.registerTask('dev', 'clean lint copy concat');
	
	grunt.loadTasks('tasks');
};
