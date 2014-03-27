/* global module, require */
module.exports = function (grunt) {

    'use strict';

    grunt.option('force', true);
    //grunt.option('debug', true);

    grunt.initConfig({

        // Be sure to update your version number when deploying to live
        pkg: grunt.file.readJSON('package.json'),

        // Build our modules using R.js
        requirejs : {
		
            compile : {
                options : {

                    appDir  : 'src/static',
                    baseUrl : './',
                    dir     : 'target/rjs',
                    paths   : {
                        'fb' : './js',
                        'fb/nls' : './nls'
                    },
                    optimize : 'uglify',

                    logLevel: 2,

                    uglify : {
                        ascii_only : true
                    },

                    preserveLicenseComments: false,

                    findNestedDependencies: true,

                    optimizeCss: 'standard.keepLines',

                    preserveLicenceComments : true,

                    // All modules overhere
                    modules : [
                        {
                            name : 'fb/jquery'
                        },
                        {
                            name : 'fb/backbone',
                            exclude : [
                                'fb/jquery'
                            ]
                        },
                        {
                            name : 'fb/lodash'
                        },
                        {
                            name : 'fb/i18n'
                        },
                        {
                            name : 'fb/text'
                        },
                        {
                            name : 'fb/img-responsive',
                            exclude : [
								'fb/jquery', // don't include jquery in our module
                                'fb/window-events'
                            ]
                        },
                        {
                            name : 'fb/window-events',
                            exclude : [
                                'fb/jquery'
                            ]
                        },
                        {
                            name : 'fb/initcomponents',
                            exclude : [
                                'fb/jquery'
                            ]
                        },
                        {
                            name : 'fb/pubsub'
                        },
                        {
                            name : 'fb/form-login',
                            exclude : [
                                'fb/jquery',
                                'fb/window-events',
                                'fb/i18n',
                                'fb/nls/generic'
                            ]
                        }
                    ],

                    done: function (done, output) {
                        var duplicates = require('rjs-build-analysis').duplicates(output);

                        if (duplicates.length > 0) {
                            grunt.log.subhead('Duplicates found in requirejs build:');
                            grunt.log.warn(duplicates);
                            done(new Error('r.js built duplicate modules, please check the excludes option.'));
                        } else {
                            grunt.log.writeln('No Duplicates were found.');
                        }

                        done();
                    }

                }
            }
        },


        // concat css/js files
        'concat' : {
            'build' : {
                'files' : {
                    // MAIN FILE CACHING AT MOST 1 DAY
                    'target/build/static/core.js' : [
                        'target/rjs/modernizr.js',
                        'target/rjs/require.js',
                        'target/rjs/path.js'
                    ],
                    // MOST USED COMPONENTS CACHED LIVE LONG
                    'target/build/static/<%= pkg.version %>/js/bundle.js': [
                        'target/rjs/js/jquery.js',
                        'target/rjs/js/window-events.js',
                        'target/rjs/js/img-responsive.js'
                    ]
                }
            }
        },

        // Clean up some files
        'clean': {
            'static': {
                'src': [
                    'target/build/static/<%= pkg.version %>/core.js',
                    'target/build/static/<%= pkg.version %>/build.txt',
                    'target/build/static/<%= pkg.version %>/_css/**',
                    'target/build/static/<%= pkg.version %>/css/**' // Remove everything except style.css or foo.css (future)
                ]
            },
            'all': {
                'src': ['target/**']
            }
        },

        // Versionize our R.js content and set expiracy
        copy: {
            'build': {
                cwd: 'target/rjs',
                src: ['**'],
                dest: 'target/build/static/<%= pkg.version %>',
                expand: true
            },
            'full': {
                src: ['build/htaccess/one-year.txt'],
                dest: 'target/build/static/<%= pkg.version %>/.htaccess'
            }

        },

        // Set version in our require.path settings
        replace : {
            path : {
                src: ['target/rjs/path.js'],
                dest: 'target/rjs/',
                replacements: [
                    {
                        from: '${project.version}',
                        to: '<%= pkg.version %>'
                    }
                ]
            },
            // PUT SASSED DECLARATIONS ON SINGLE LINE
            css : {
                src: ['target/sass/*.css'],
                dest: 'target/build/static/<%= pkg.version %>/css/',
                replacements: [
                    {
                        from: '}',
                        to: '}\n'
                    },
                    {
                        from: '){',
                        to: '){\n'
                    }
                ]
            }
        },

        // Hint our JavaScript files (check for files which are ignored yourself frequently)
        jshint : {
            files : ['src/static/js/**/*.js'],
            options : {
                jshintrc : 'build/.jshintrc',
                jshintignore : '.jshintignore',
                reporter : require('jshint-junit-reporter'),
                reporterOutput : 'target/reports/jshint-result.xml'
            }
        },

        // Hint our css files
        'csslint' : {
            'options' : {
                'csslintrc' : 'build/.csslintrc',
                'formatters' : [
                    { 'id': 'junit-xml', 'dest': 'target/reports/csslint_junit.xml'},
                    { 'id': 'csslint-xml', 'dest': 'target/reports/csslint.xml'}
                ]
            },
            'build' : {
                // check sass build file for linting
                'src' : ['src/static/_css/*.css']
            }
        },

        // Watch changes in js and documentation files
        watch: {
            scripts: {
                files: ['src/static/js/**/*.js'],
                tasks: ['jshint'],
                options: {
                    spawn: false
                }
            },
            docs: {
                files: ['src/docs/**/*.hbs', 'build/layout/**/*.hbs'],
                tasks: ['assemble:development'],
                options: {
                    spawn: false,
                    livereload: true
                }
            },
            css: {
                files: 'src/static/css/**/*.scss',
                tasks: ['sass:development'],
                options: {
                    atBegin: true,
                    livereload: true
                }
            }
        },


        // zip our versionized frontend code
        compress: {
            main: {
                options: {
                    archive: 'target/archive-<%= pkg.version %>.zip'
                },
                files: [
                    { expand: true, cwd: 'target/build/', src: ['**'], dest: '/', dot: true }
                ]
            }
        },

        // Build documentation pages for development and package
        assemble: {
            options: {
                prettify: {
                    indent: 2
                },
                flatten: true,
                version: '<%= pkg.version %>',
                // assets: 'assets',
                layoutdir: 'build/layout',
                partials: ['build/layout/partials/*.hbs', 'src/docs/**/*.hbs'],
                data: ['build/*.{json,yml}']
            },
            development: {
                options: {
                    layout: 'default-dev.hbs',
                    staticPath: '../static/'
                },
                src: ['src/docs/!(master-template).hbs'],
                dest: 'src/_docs/'
            },
            live: {
                options: {
                    layout: 'default-live.hbs',
                    staticPath: 'static/<%= pkg.version %>'
                },
                src: ['src/docs/!(master-template).hbs'],
                dest: 'target/build/'
            },
            page: {
                options: {
                    layout: 'default-site.hbs',
                    staticPath: 'static/<%= pkg.version %>'
                },
                src: ['src/docs/master-template.hbs'],
                dest: 'target/build/'
            }
        },

        phantomcss: {
            options: {},
            desktop: {
                options: {
                    screenshots: 'test/visuals/tmp/screenshots/desktop/',
                    results: 'target/reports/visuals/desktop',
                    viewportSize: [1024, 768]
                },
                src: [
                    'test/visuals/*.js'
                ]
            },
            tablet: {
                options: {
                    screenshots: 'test/visuals/tmp/screenshots/tablet/',
                    results: 'target/reports/visuals/tablet',
                    viewportSize: [768, 1024]
                },
                src: [
                    'test/visuals/*.js'
                ]
            },
            mobile: {
                options: {
                    screenshots: 'test/visuals/tmp/screenshots/mobile/',
                    results: 'target/reports/visuals/mobile',
                    viewportSize: [320, 480]
                },
                src: [
                    'test/visuals/*.js'
                ]
            }
        },


        blanket_mocha: {
            all: ["test/mocha/**/*.html"],
            options: {
                threshold: 86,
                run: false,
                // reporter: 'Nyan'
                // reporter: 'mocha-phantom-coverage-reporter'
            }
        },


        // Local webserver for our static setup on live
        connect: {
            live: {
                options: {
                    hostname: 'localhost',
                    port: 9900,
                    base: ['./target/build'],
                    open: 'http://localhost:9900/index.html',
                    keepalive: true,
                    middleware: function (connect, options) {
                        var config = [ // Serve static files.
                            connect.static(options.base[0]),
                            // Make empty directories browsable.
                            connect.directory(options.base[0])
                        ];
                        var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
                        config.unshift(proxy);
                        return config;
                    }
                },
                proxies: [
                    {
                        context: ['/ams', '/api'],
                        host: 'www.maas38.com'
                    }
                ]
            },
            development: {
                options: {
                    hostname: 'localhost',
                    port: 9901,
                    base: ['./'],
                    open: 'http://localhost:9901/src/_docs/index.html',
                    keepalive: false,
                    livereload: true,
                    middleware: function (connect, options) {
                        var config = [
                            connect.static(options.base[0]),
                            connect.directory(options.base[0])
                        ];
                        return config;
                    }
                }
            },
            test: {
                options: {
                    hostname: 'localhost',
                    port: 9902,
                    base: ['./'],
                    open: 'http://localhost:9902/test/mocha/index.html',
                    keepalive: true,
                    middleware: function (connect, options) {
                        var config = [
                            connect.static(options.base[0]),
                            connect.directory(options.base[0])
                        ];
                        return config;
                    }
                }
            }
        },

        sass: {
            development: {
                options: {
                    lineNumbers: true,
                    style: 'expanded'
                },
                files: {
                    'src/static/_css/style.css': 'src/static/css/style.scss',
                    'src/static/_css/docs.css': 'src/static/css/docs.scss'
                }
            },
            live: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'target/sass/style.css': 'src/static/css/style.scss',
                    'target/sass/docs.css': 'src/static/css/docs.scss'
                }
            }
        }


    });


    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-connect-proxy');
    grunt.loadNpmTasks('assemble');

    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-phantomcss');
    grunt.loadNpmTasks("grunt-blanket-mocha");
    grunt.loadNpmTasks('grunt-contrib-sass');

    // Default grunt task
    grunt.registerTask('default', ['clean:all', 'jshint', 'blanket_mocha', 'requirejs', 'replace:path', 'copy', 'concat', 'clean:static', 'sass:live', 'replace:css', 'assemble', 'compress', 'server']);

    // Develop (changes docs/css/js have livereload)
    grunt.registerTask('dev', ['assemble:development', 'connect:development', 'watch']);

    // Check for our coding conventions
    // first: grunt sass:development
    grunt.registerTask('lint', ['csslint', 'jshint']);

    // Run from release tag first (to make screenshots to resemble), then check after your development is done
    // first: grunt dev (so you have screenshots to match against)
    grunt.registerTask('visual', ['clean:all', 'phantomcss']);

    // Headless testing and browser testing with code coverage
    grunt.registerTask('test', ['blanket_mocha', 'connect:test']);

    // When you build default, check if our build frontend is still ok
    grunt.registerTask('server', ['configureProxies:live', 'connect:live']);

};