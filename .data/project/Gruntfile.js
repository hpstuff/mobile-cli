module.exports = function(grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), 
        clean: {
            options: {
                force: true
            },
            dist: [ 'dist' ],
            pg: ['dist', 'phonegap/www']
        },
        copy: {
            dist: {
                files: [
                    {
                        src: [
                            'bin/*'
                        ],
                        dest: 'dist/'
                    },
                    {
                        src: [
                            'res/**/*'
                        ],
                        dest: 'dist/'
                    },
                    {
                        src: [
                            'src/app/*'
                        ],
                        dest: 'dist/'
                    },
                    {
                        src: [
                            'src/app.js'
                        ],
                        dest: 'dist/'
                    },
                    {
                        src: [
                            'manifest.json'
                        ],
                        dest: 'dist/'
                    }
                ]
            },
            pg: {
                files: [
                    { 
                        expand: true, 
                        cwd: 'dist/', 
                        src: ['**'], 
                        dest: 'phonegap/www/'
                    }
                ]
            }
        },
        replace:{
            dist: {
                options: {
                    patterns: [
                        {
                            match: /src=\".*framework.min.js\"/ig,
                            replacement: 'src="bin/framework.min.js"'
                        },
                        {
                            match: /\<script src=\"\/\/localhost\:9000\/livereload\.js">\<\/script\>/ig,
                            replacement: ''
                        },
                        {
                            match: /localhost\:8001/ig,
                            replacement: 'devs.athlonsofia.com:8001'
                        }
                    ]
                },
                files: [
                    {expand: true, flatten: true, src: ['index.html'], dest: 'dist/'},
                    {expand: true, flatten: true, src: ['dist/src/app/Adapter.js'], dest: 'dist/src/app/'}
                ]
            }
        },
        'curl-dir':{
            'dist/bin/':[
                'http://devs.athlonsofia.com:3030/cdn/framework.min.js',
                'http://devs.athlonsofia.com:3030/cdn/framework.min.map' 
            ]
        },
        scp:{
            options: {
                host: 'devs.athlonsofia.com',
                username: 'root',
                password: 'rvasileva'
            },
            dist: {
                files: [{
                        cwd: 'dist',
                        src:'**/*',
                        filter: 'isFile',
                        dest: '/var/www/capco_dev'
                    }
                ]
            }
        },
        scp_prod: {
            options: {
                host: 'devs.athlonsofia.com',
                username: 'root',
                password: 'rvasileva'
            },
            dist: {
                files: [{
                        cwd: 'dist',
                        src:'**/*',
                        filter: 'isFile',
                        dest: '/var/www/capco'
                    }
                ]
            }
        },
        connect: {
            server: {
                options: {
                    port: 3030,
                    base: '.'
                }
            }
        },
        watch: {
            all: {
                files: ['src/**/*', 'res/**/*', 'lib/**/*', 'index.html', 'manifest.json'],
                tasks: ['uglify'],
                options: {
                    livereload: {
                        port: 9000
                    }
                }
            }
        },
        uglify: {
            lib: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'bin/lib.map'
                },
                files: {
                    'bin/libs.min.js': ['lib/**/*.js']
                }
            },
            pages: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'bin/pages.map'
                },
                files: {
                    'bin/pages.min.js': ['src/pages/*js']
                }
            },
            app: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'bin/source.map'
                },
                files: {
                    'bin/source.min.js': ['src/app/*js']
                }
            }
        }
    });

    // Load these required NPM tasks:
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-curl');
    grunt.loadNpmTasks('grunt-scp');

    grunt.registerTask('default',['uglify','connect', 'watch' ]); // This registers the watch task as the default task. If you require more tasks, create another one
    grunt.registerTask('dist',['clean', 'uglify','copy', 'replace', 'curl-dir', 'scp' ]);
    grunt.registerTask('pg',['clean', 'uglify', 'copy:dist', 'replace', 'curl-dir', 'copy:pg' ]);
    grunt.registerTask('prod',['scp_prod']);
};
