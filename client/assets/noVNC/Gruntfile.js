module.exports = function (grunt) {
    'use strict';

    require('matchdep').filter('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        //Config
        pkg             : grunt.file.readJSON('package.json'),
        bower           : grunt.file.readJSON('bower.json'),
        
		// Clean
        clean           : {
            files    : [
                '*.war'
            ]
        },

        // To release
        bump : {
            options : {
                pushTo          : 'origin master',
                files           : ['package.json', 'bower.json'],
                updateConfigs   : ['pkg', 'bower'],
                commitFiles     : ['-a'],
            }
        },
        
        mvn: {
            package: {
                groupId: 'com.ovh.applications',
                artifactId: 'ovh-noVNC',
                sources: ['bower.json', 'debian', 'docs', 'images', 'include', 'LICENCE.txt', 'package.json', 'README.md', 'tests', 'utils', 'vnc.html', 'vnc_auto.html'],
                version: '<%= pkg.version %>'
            },
            snapshot: {
                url: 'http://nexus.ria.ovh.net/content/repositories/snapshots',
                id: 'ovh-snapshots'
            },
            release: {
                url: 'http://nexus.ria.ovh.net/content/repositories/releases',
                id: 'ovh-releases'
            }
        }

    });

    grunt.registerTask('default', ['build']);

    grunt.registerTask('deployToNexus', 'Deploy to nexus', function (releaseType) {
        var preprocessTarget = '';
        if(releaseType) {
            preprocessTarget = ':' + releaseType;
        }
        grunt.task.run(['mvn:preprocess' + preprocessTarget, 'createWar', 'mvn:deploy']);
    });

    grunt.registerTask('createWar', function() {
        var done = this.async(),
            args = ['-r', grunt.config.get('mvn.file')],
            files = grunt.config.get('mvn.package.sources');
        for (var i = 0, len = files.length ; i < len ; i++) {
            args.push(files[i]);
        }
        grunt.util.spawn({
            cmd : 'zip',
            args: args
        }, function(err, result, code) {
            console.log(result.stdout);
            if (err || code !== 0) {
                console.log(err);
                grunt.fatal('createWar failed');
            }
            done();
        });
    });

    /*
     * --type=patch
     * --type=minor
     * --type=major
     */
    grunt.registerTask('release', 'Release', function () {
        var type = grunt.option('type');
        if (isProd()) {
            mode = 'prod';
            grunt.task.run(['bump:' + type, 'deployToNexus:release']);
        } else {
            grunt.verbose.or.write('You try to release in a weird version [' + type + ']').error();
            grunt.fail.warn('Please try with --type=patch|minor|major');
        }
    });
};
