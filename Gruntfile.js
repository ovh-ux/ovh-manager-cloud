// Generated on 2017-01-25 using generator-ovh-stack 0.0.0
"use strict";

module.exports = function (grunt) {

    var localConfig;
    try {
        localConfig = require("./server/config/local.env");
    } catch(e) {
        localConfig = {};
    }

    // Load grunt tasks automatically, when needed
    require("jit-grunt")(grunt, {
        express        : "grunt-express-server",
        useminPrepare  : "grunt-usemin",
        ngtemplates    : "grunt-angular-templates",
        protractor     : "grunt-protractor-runner",
        ngconstant     : "grunt-ng-constant",
        bump           : "grunt-bump"
    });

    // Load custom tasks
    // grunt.loadTasks("./tasks");

    // Time how long tasks take. Can help when optimizing build times
    require("time-grunt")(grunt);

    grunt.loadTasks("./tasks");

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        mode: "development",
        zone: (grunt.option("zone") || "EU").toUpperCase(),
        pkg: grunt.file.readJSON("package.json"),
        yeoman: {
            // configurable paths
            client: require("./bower.json").appPath || "client",
            server: "server",
            dist: "dist"
        },
        express: {
            options: {
                port: process.env.PORT || 9000
            },
            dev: {
                options: {
                    script: "<%= yeoman.server %>",
                    debug: true
                }
            },
            prod: {
                options: {
                    script: "<%= yeoman.dist %>/<%= yeoman.server %>"
                }
            }
        },
        open: {
            server: {
                url: "https://localhost:<%= express.options.port %>"
            }
        },
        watchChokidar: {
            babel: {
                files: ["<%= yeoman.client %>/{app,components}/**/!(*.spec|*.mock).js"],
                tasks: ["newer:babel:client"]
            },
            tpl_less: {
                files: ["<%= yeoman.client %>/app/app.tpl.less"],
                tasks: ["copy:tpl_less"]
            },
            tpl_index: {
                files: ["<%= yeoman.client %>/index.tpl.html"],
                tasks: ["copy:tpl_index", "wiredep:client", "injector:scripts", "injector:css"]
            },
            tpl_karma: {
                files: ["karma.conf.tpl.js"],
                tasks: ["copy:tpl_karma", "wiredep:test"]
            },
            injectJS: {
                files: [
                    "<%= yeoman.client %>/{app,components}/**/!(*.spec|*.mock).js",
                    "!<%= yeoman.client %>/app/app.js"
                ],
                tasks: ["injector:scripts"]
            },
            injectCss: {
                files: ["<%= yeoman.client %>/{app,components,assets}/**/*.css"],
                tasks: ["injector:css"]
            },
            jsTest: {
                files: ["<%= yeoman.client %>/{app,components}/**/*.{spec,mock}.js"],
                tasks: ["karma:unitContinuous:run"]
            },
            less: {
                files: [
                    "<%= yeoman.client %>/{app,components,assets}/**/*.less",
                    "!<%= yeoman.client %>/app/app.tpl.less"
                ],
                tasks: ["injector:less", "less", "postcss"]
            },
            scss: {
                files: [
                    "<%= yeoman.client %>/app/app.scss"
                ],
                tasks: ["sass", "postcss"]
            },
            gruntfile: {
                files: ["Gruntfile.js"]
            },
            i18n: {
                files: ["<%= yeoman.client %>/{app,components}/**/translations/*fr_FR.xml"],
                tasks: ["ovhTranslation:dev", "json_merge:component_translations"]
            },
            livereload: {
                files: [
                    "<%= yeoman.client %>/index.html",
                    "{.tmp,<%= yeoman.client %>}/{app,components}/**/*.{css,html}",
                    "{.tmp,<%= yeoman.client %>}/{app,components}/**/!(*.spec|*.mock).js",
                    "<%= yeoman.client %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}",
                    "<%= yeoman.client %>/{app,components}/**/translations/*.xml"
                ],
                options: {
                    livereload: true
                }
            },
            express: {
                files: ["<%= yeoman.server %>/**/*.{js,json}"],
                tasks: ["express:dev", "wait"],
                options: {
                    livereload: true,
                    spawn: false //Without this option specified express won"t be reloaded
                }
            },
            bower: {
                files: ["bower.json"],
                tasks: ["wiredep"]
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        eslint: {
            options: {
                configFile: "<%= yeoman.client %>/.eslintrc.json"
            },
            server: {
                options: {
                    configFile: "<%= yeoman.server %>/.eslintrc.json"
                },
                target: ["<%= yeoman.server %>/**/!(*.spec|*.integration).js"]
            },
            serverTest: {
                options: {
                    configFile: "<%= yeoman.server %>/.eslintrc-spec.json"
                },
                target: ["<%= yeoman.server %>/**/*.{spec,integration}.js"]
            },
            all: ["<%= yeoman.client %>/{app,components}/**/!(*.spec|*.mock).js"],
            test: {
                options: {
                    configFile: "<%= yeoman.client %>/.eslintrc-spec.json"
                },
                target: ["<%= yeoman.client %>/{app,components}/**/*.{spec,mock}.js"]
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        ".tmp",
                        "<%= yeoman.dist %>/!(.git*|Procfile)**"
                    ]
                }]
            },
            server: ".tmp"
        },

        // Add vendor prefixed styles
        postcss: {
            options: {
                map: false,
                processors: [
                    require("autoprefixer")({browsers: ["last 2 version", "ie >= 9"]})
                ]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: ".tmp/",
                    src: "{,*/}*.css",
                    dest: ".tmp/"
                }]
            }
        },

        // Automatically inject Bower components into the app and karma.conf.js
        wiredep: {
            options: {
                exclude: [
                    /bs4/,
                    "/json3/",
                    "/es5-shim/",
                    /font-awesome\.css/,
                    /bootstrap\.css/
                ]
            },
            client: {
                src: "<%= yeoman.client %>/index.html",
                ignorePath: "<%= yeoman.client %>/"
            },
            test: {
                src: "./karma.conf.js",
                devDependencies: true
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    "<%= yeoman.dist %>/<%= yeoman.client %>/!(bower_components){,*/}*.{js,css}",
                    "<%= yeoman.dist %>/<%= yeoman.client %>/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}"
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: ["<%= yeoman.client %>/index.html"],
            options: {
                dest: "<%= yeoman.dist %>/<%= yeoman.client %>"
            }
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            html: ["<%= yeoman.dist %>/<%= yeoman.client %>/{,!(bower_components)/**/}*.html"],        // à checker for inject
            css: ["<%= yeoman.dist %>/<%= yeoman.client %>/!(bower_components){,*/}*.css"],
            js: ["<%= yeoman.dist %>/<%= yeoman.client %>/!(bower_components){,*/}*.js"],
            options: {
                assetsDirs: [
                    "<%= yeoman.dist %>/<%= yeoman.client %>",
                    "<%= yeoman.dist %>/<%= yeoman.client %>/assets/images"
                ],
                // This is so we update image references in our ng-templates
                patterns: {
                    css: [
                        [/(assets\/images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, "Update the CSS to reference our revved images"]
                    ],
                    js: [
                        [/(assets\/images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, "Update the JS to reference our revved images"]
                    ]
                }
            }
        },

        // -------DEBUG-------
        // You can use this option to build a "dist" with a JS not minified.
        // uglify: {
        //   options : {
        //     compress : false,
        //     mangle   : false,
        //     beautify : true
        //   }
        // },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: "<%= yeoman.client %>/assets/images",
                    src: "**/*.{png,jpg,jpeg,gif,svg}",
                    dest: "<%= yeoman.dist %>/<%= yeoman.client %>/assets/images"
                }]
            }
        },

        // Allow the use of non-minsafe AngularJS files. Automatically makes it
        // minsafe compatible so Uglify does not destroy the ng references
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: ".tmp/concat",
                    src: "**/*.js",
                    dest: ".tmp/concat"
                }]
            }
        },

        // Bump version
        bump: {
            options : {
                pushTo        : "origin",
                files         : ["package.json", "bower.json"],
                updateConfigs : ["pkg"],
                commitFiles   : ["-a"]
            }
        },

        // Dynamically generate angular constants
        ngconstant: {
            custom: {
                options: {
                    name: "managerApp",
                    deps: false,
                    wrap: "/*jshint quotmark:false*/\n\n\"use strict\";\n\n{%= __ngModule %}",
                    dest: "<%= yeoman.client %>/app/config/<%= zone %>/custom.constants.js"
                },
                constants: {
                    VERSION: "<%= pkg.version %>"
                }
            }
        },

        // Package all the html partials into a single javascript payload
        ngtemplates: {
            options: {
                // This should be the name of your apps angular module
                module: "managerApp",
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                },
                usemin: "app/app.js"
            },
            main: {
                cwd: "<%= yeoman.client %>",
                src: ["components/**/*.html"],
                dest: ".tmp/templates.js"
            },
            tmp: {
                cwd: ".tmp",
                src: ["components/**/*.html"],
                dest: ".tmp/tmp-templates.js"
            }
        },

        //#######################################################################################
        //##      TASK: json_merge                                                             ##
        //##            Merge json files in one                                                ##
        //#######################################################################################
        json_merge: {
            component_translations: {
                files: {
                    ".tmp/app/components/translations/Messages_cs_CZ.json": [
                         ".tmp/app/components/**/Messages_cs_CZ.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_cs_CZ.json"
                    ],
                    ".tmp/app/components/translations/Messages_de_DE.json": [
                         ".tmp/app/components/**/Messages_de_DE.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_de_DE.json"
                    ],
                    ".tmp/app/components/translations/Messages_en_CA.json": [
                         ".tmp/app/components/**/Messages_en_CA.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_en_CA.json"
                    ],
                    ".tmp/app/components/translations/Messages_en_GB.json": [
                        ".tmp/app/components/**/Messages_en_GB.json",
                        "<%= yeoman.client %>/bower_components/**/Messages_en_GB.json"
                    ],
                    ".tmp/app/components/translations/Messages_en_US.json": [
                         ".tmp/app/components/**/Messages_en_US.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_en_US.json"
                    ],
                    ".tmp/app/components/translations/Messages_es_ES.json": [
                         ".tmp/app/components/**/Messages_es_ES.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_es_ES.json"
                    ],
                    ".tmp/app/components/translations/Messages_es_US.json": [
                         ".tmp/app/components/**/Messages_es_US.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_es_US.json"
                    ],
                    ".tmp/app/components/translations/Messages_fi_FI.json": [
                         ".tmp/app/components/**/Messages_fi_FI.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_fi_FI.json"
                    ],
                    ".tmp/app/components/translations/Messages_fr_CA.json": [
                         ".tmp/app/components/**/Messages_fr_CA.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_fr_CA.json"
                    ],
                    ".tmp/app/components/translations/Messages_fr_FR.json": [
                        ".tmp/app/components/**/Messages_fr_FR.json",
                        "<%= yeoman.client %>/bower_components/**/Messages_fr_FR.json"
                    ],
                    ".tmp/app/components/translations/Messages_it_IT.json": [
                         ".tmp/app/components/**/Messages_it_IT.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_it_IT.json"
                    ],
                    ".tmp/app/components/translations/Messages_lt_LT.json": [
                         ".tmp/app/components/**/Messages_lt_LT.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_lt_LT.json"
                    ],
                    ".tmp/app/components/translations/Messages_nl_NL.json": [
                         ".tmp/app/components/**/Messages_nl_NL.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_nl_NL.json"
                    ],
                    ".tmp/app/components/translations/Messages_pl_PL.json": [
                         ".tmp/app/components/**/Messages_pl_PL.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_pl_PL.json"
                    ],
                    ".tmp/app/components/translations/Messages_pt_PT.json": [
                         ".tmp/app/components/**/Messages_pt_PT.json",
                         "<%= yeoman.client %>/bower_components/**/Messages_pt_PT.json"
                    ]
                }
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: "<%= yeoman.client %>",
                    dest: "<%= yeoman.dist %>/<%= yeoman.client %>",
                    src: [
                        "*.{ico,png,txt}",
                        "app/**/!(*.tpl).html",
                        "assets/images/{,*/}*.{webp}",
                        "assets/fonts/**/*",
                        "bower_components/**/*.{ttf,woff,woff2,svg,eot}",
                        "bower_components/**/translations/*.json",
                        "bower_components/angular-i18n/angular-locale_*-*.js",
                        "index.html"
                    ]
                }, {
                    expand: true,
                    cwd: ".tmp/images",
                    dest: "<%= yeoman.dist %>/<%= yeoman.client %>/assets/images",
                    src: ["generated/*"]
                }, {
                    expand: true,
                    dest: "<%= yeoman.dist %>",
                    src: [
                        "package.json",
                        "<%= yeoman.server %>/**/*",
                        "!<%= yeoman.server %>/config/local.env.sample.js"
                    ]
                },  {
                    expand : true,
                    cwd: ".tmp/",
                    dest: "<%= yeoman.dist %>/<%= yeoman.client %>",
                    src : ["{app,components}/**/translations/**.json"]
                },  {
                    expand : true,
                    cwd: "<%= yeoman.client %>",
                    dest: "<%= yeoman.dist %>/<%= yeoman.client %>",
                    src : ["{app,components}/**/translations/*.json"]
                }]
            },
            styles: {
                expand: true,
                cwd: "<%= yeoman.client %>",
                dest: ".tmp/",
                src: ["{app,components}/**/*.css"]
            },
            tpl_less: {
                src: "<%= yeoman.client %>/app/app.tpl.less",
                dest: "<%= yeoman.client %>/app/app.less"
            },
            tpl_index: {
                src: "<%= yeoman.client %>/index.tpl.html",
                dest: "<%= yeoman.client %>/index.html"
            },
            tpl_karma: {
                src: "karma.conf.tpl.js",
                dest: "karma.conf.js"
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            templates: [
                "copy:tpl_less",
                "copy:tpl_index",
                "copy:tpl_karma"
            ],
            pre: [
                "injector:less",
            ],
            server: [
                "newer:babel:client",
                "sass",
                "less"
            ],
            test: [
                "newer:babel:client",
                "sass",
                "less"
            ],
            debug: {
                tasks: [
                ],
                options: {
                    logConcurrentOutput: true
                }
            },
            dist: [
                "newer:babel:client",
                "sass",
                "less",
                "imagemin"
            ]
        },

        // Test settings
        karma: {
            options: {
                configFile: "karma.conf.js",
            },
            unit: {
                singleRun: true,
            },
            unitContinuous: {
                background: true,
                singleRun: false
            },
            unitWatch: {
                autoWatch: true
            },
            unitChrome: {
                browsers: ["Chrome"],
            },
            unitFirefox: {
                browsers: ["Firefox"]
            },
            coverage: {
                singleRun: true,
                reporters: ["progress", "coverage"],
                coverageReporter: {
                    dir: "test-reports/coverage/client",
                    subdir: "unit",
                    type: "lcov",
                    includeAllSources: true
                }
            },
            check_coverage: {
                singleRun: true,
                reporters: ["progress", "coverage"],
                coverageReporter: {
                    dir: "test-reports/coverage/client",
                    subdir: "unit",
                    type: "lcov",
                    includeAllSources: true,
                    check: {
                        global: {
                            statements: 80,
                            branches: 80,
                            functions: 80,
                            lines: 80,
                            excludes: [],
                            overrides: {}
                        }
                    }
                }
            }
        },

        protractor: {
            options: {
                configFile: "protractor.conf.js"
            },
            browser: {
                options: {
                    args: {
                        browser: grunt.option("browser") || "phantomjs",
                        suite: grunt.option("suite") || "full"
                    }
                }
            }
        },

        env: {
            test: {
                NODE_ENV: "test"
            },
            prod: {
                NODE_ENV: "production"
            },
            dev: {
                NODE_ENV: "development",
                ZONE: (grunt.option("zone") || "EU").toUpperCase(),
                LOCAL_2API: grunt.option("local2API")
            },
            all: localConfig
        },

        // Compiles ES6 to JavaScript using Babel
        babel: {
            options: {
                sourceMap: true
            },
            client: {
                files: [{
                    expand: true,
                    cwd: "<%= yeoman.client %>",
                    src: ["{app,components}/**/!(*.spec).js"],
                    dest: ".tmp"
                }]
            },
            server: {
                options: {
                    plugins: [
                        "transform-class-properties",
                        "transform-runtime"
                    ]
                },
                files: [{
                    expand: true,
                    cwd: "<%= yeoman.server %>",
                    src: [
                        "**/*.js",
                        "!config/local.env.sample.js"
                    ],
                    dest: "<%= yeoman.dist %>/<%= yeoman.server %>"
                }]
            }
        },

        // Compiles Less to CSS
        less: {
            options: {
                paths: [
                    "<%= yeoman.client %>/bower_components",
                    "<%= yeoman.client %>/app",
                    "<%= yeoman.client %>/components",
                    "<%= yeoman.client %>/assets/styles"
                ],
                plugins: [
                    require("less-plugin-remcalc")
                ]
            },
            server: {
                files: {
                    ".tmp/app/app.css" : [
                        "<%= yeoman.client %>/app/app.less",
                        "<%= yeoman.client %>/app/app-scss.css"
                    ]
                }
            }
        },

        // Compiles SCSS to CSS
        sass: {
            options: {
                outputStyle: "expanded"
            },
            dist: {
                files: {
                    "client/app/app-scss.css": "client/app/app.scss"
                }
            }
        },

        injector: {
            options: {},
            // Inject application script files into index.html (doesn"t include bower)
            scripts: {
                options: {
                    transform: function(filePath) {
                        var yoClient = grunt.config.get("yeoman.client");
                        filePath = filePath.replace("/" + yoClient + "/", "");
                        filePath = filePath.replace("/.tmp/", "");
                        return "<script src=\"" + filePath + "\"></script>";
                    },
                    sort: function(a, b) {
                        var module = /\.module\.(js|ts)$/;
                        var aMod = module.test(a);
                        var bMod = module.test(b);
                        // inject *.module.js first
                        return (aMod === bMod) ? 0 : (aMod ? -1 : 1);
                    },
                    starttag: "<!-- injector:js -->",
                    endtag: "<!-- endinjector -->"
                },
                files: {
                    "<%= yeoman.client %>/index.html":
                        [
                            "<%= yeoman.client %>/{app,components}/**/!(*.spec|*.mock).js",
                            "!<%= yeoman.client %>/app/config/**/*.js",
                            "<%= yeoman.client %>/app/config/<%= zone %>/environment/<%= mode %>.constants.js",
                            "<%= yeoman.client %>/app/config/<%= zone %>/*.js",
                            "!{.tmp,<%= yeoman.client %>}/app/app.js"
                        ]
                }
            },

            // Inject component less into app.less
            less: {
                options: {
                    transform: function(filePath) {
                        var yoClient = grunt.config.get("yeoman.client");
                        filePath = filePath.replace("/" + yoClient + "/app/", "");
                        filePath = filePath.replace("/" + yoClient + "/components/", "../components/");
                        return "@import \"" + filePath + "\";";
                    },
                    starttag: "// inject:less",
                    endtag: "// endinject"
                },
                files: {
                    "<%= yeoman.client %>/app/app.less": [
                        "<%= yeoman.client %>/{app,components}/**/*.less",
                        "!<%= yeoman.client %>/app/{app,app.tpl}.less"
                    ]
                }
            },

            // Inject component css into index.html
            css: {
                options: {
                    transform: function(filePath) {
                        var yoClient = grunt.config.get("yeoman.client");
                        filePath = filePath.replace("/" + yoClient + "/", "");
                        filePath = filePath.replace("/.tmp/", "");
                        return "<link rel=\"stylesheet\" href=\"" + filePath + "\">";
                    },
                    starttag: "<!-- injector:css -->",
                    endtag: "<!-- endinjector -->"
                },
                files: {
                    "<%= yeoman.client %>/index.html": [
                        "<%= yeoman.client %>/{app,components}/**/*.css"
                    ]
                }
            }
        },

        // OVH translations
        ovhTranslation: {
            dev: {
                expand: true,
                flatten: false,
                src: ["<%= yeoman.client %>/{app,components}/**/translations/*fr_FR.xml"],
                filter: "isFile",
                extendFrom: ["fr_FR", "en_GB"]
            },
            prod: {
                expand: true,
                flatten: false,
                src: ["<%= yeoman.client %>/{app,components}/**/translations/*.xml"],
                filter: "isFile",
                extendFrom: ["fr_FR", "en_GB"]
            }
        }

    });

    // Used for delaying livereload until after server has restarted
    grunt.registerTask("wait", function () {
        grunt.log.ok("Waiting for server reload...");

        var done = this.async();

        setTimeout(function () {
            grunt.log.writeln("Done waiting!");
            done();
        }, 1500);
    });

    grunt.registerTask("express-keepalive", "Keep grunt running", function () {
        this.async();
    });

    grunt.registerTask("serve", function (target) {
        grunt.config.set("mode", "development");

        if (target === "dist") {
            grunt.config.set("mode", "production");
            return grunt.task.run(["build", "env:all", "env:prod", "express:prod", "wait", "open", "express-keepalive"]);
        }

        if (target === "debug") {
            return grunt.task.run([
                "clean:server",
                "env:all",
                "ngconstant",
                "concurrent:templates",
                "concurrent:pre",
                "concurrent:server",
                "injector",

                "wiredep:client",
                "postcss",
                "ovhTranslation:dev",
                "concurrent:debug"
            ]);
        }

        grunt.task.run([
            "clean:server",
            "env:all",
            "env:dev",
            "ngconstant",
            "concurrent:templates",
            "concurrent:pre",
            "concurrent:server",
            "injector",
            "wiredep:client",
            "postcss",
            "ovhTranslation:dev",
            "json_merge",
            "express:dev",
            "wait",
            "open",
            "karma:unitContinuous:start",
            "watchChokidar"
        ]);
    });

    grunt.registerTask("server", function () {
        grunt.log.warn("The `server` task has been deprecated. Use `grunt serve` to start a server.");
        grunt.task.run(["serve"]);
    });

    grunt.registerTask("test", function (target, option) {
        grunt.config.set("mode", "test");

        if (target === "server") {
            return grunt.task.run([
                "env:all",
                "env:test"/*,
                 "eslint:server",
                 "eslint:serverTest"*/
            ]);
        }

        else if (target === "client") {
            return grunt.task.run([
                "clean:server",
                "env:all",
                "ngconstant",
                "concurrent:templates",
                "concurrent:pre",
                "concurrent:test",
                "injector",
                "postcss",
                "ovhTranslation:dev",
                "wiredep:test",
                // "eslint:all",
                // "eslint:test",
                "karma:unit"
            ]);
        }

        else if (target === "e2e") {

            // Check if it's a remote test
            if (process.env.E2E_BASE_URL && !/^https?:\/\/localhost/.test(process.env.E2E_BASE_URL)) {
                option = "remote";
            }

            if (option === "remote") {
                return grunt.task.run([
                    "protractor"
                ]);
            }

            else if (option === "prod") {
                grunt.config.set("mode", "production");
                return grunt.task.run([
                    "ngconstant",
                    "build",
                    "env:all",
                    "env:prod",
                    "express:prod",
                    "protractor"
                ]);
            }

            else {
                return grunt.task.run([
                    "clean:server",
                    "env:all",
                    "env:test",
                    "ngconstant",
                    "concurrent:templates",
                    "concurrent:pre",
                    "concurrent:test",
                    "injector",
                    "wiredep:client",
                    "postcss",
                    "ovhTranslation:dev",
                    "express:dev",
                    "protractor"
                ]);
            }
        }

        else if (target === "coverage") {

            if (option === "unit") {
                return grunt.task.run([
                    "clean:server",
                    "env:all",
                    "env:test",
                    "ngconstant",
                    "concurrent:templates",
                    "concurrent:pre",
                    "concurrent:test",
                    "injector",

                    "wiredep:test",
                    "postcss",
                    "ovhTranslation:dev",
                    //"mocha_istanbul:unit",
                    "karma:coverage"
                ]);
            }

            else if (option === "integration") {
                return grunt.task.run([
                    "env:all",
                    "env:test"/*,
                     "mocha_istanbul:integration"*/
                ]);
            }

            else if (option === "check") {
                return grunt.task.run([
                    "karma:check_coverage"/*,
                     "istanbul_check_coverage"*/
                ]);
            }

            else {
                return grunt.task.run([
                    "env:all",
                    "env:test"/*,
                     "mocha_istanbul",
                     "istanbul_check_coverage"*/
                ]);
            }

        }

        else grunt.task.run([
                "test:server",
                "test:client"
            ]);
    });

    grunt.registerTask("build", function () {
        grunt.config.set("mode", "production");
        grunt.task.run([
            "clean:dist",
            "ngconstant",
            "concurrent:templates",
            "concurrent:pre",
            "concurrent:dist",
            "injector",
            "wiredep:client",
            "useminPrepare",
            "postcss",
            "ngtemplates",
            "ovhTranslation:prod",
            "json_merge",
            "concat",
            "ngAnnotate",
            "copy:dist",
            "babel:server",
            "cssmin",
            "uglify",
            "filerev",
            "usemin"
        ]);
    });

    grunt.registerTask("default", [
        // "newer:eslint",
        "test",
        "build"
    ]);

    grunt.registerTask("karma-unit-chrome", [
        "wiredep:test",
        "karma:unitChrome"
    ]);

    grunt.registerTask("karma-unit-firefox", [
        "wiredep:test",
        "karma:unitFirefox"
    ]);

    grunt.registerTask("karma-unit-watch", [
        "wiredep:test",
        "karma:unitWatch"
    ]);

    grunt.registerTask("karma-unit", [
        "wiredep:test",
        "karma:unit"
    ]);

    grunt.registerTask("release", function () {
        grunt.config.set("mode", "production");
        var type = grunt.option("type");

        if (type === "patch" || type === "minor" || type === "major") {
            grunt.task.run(["bump:" + type]);
        } else {
            grunt.verbose.or.write("You try to release in a weird version type [" + type + "]").error();
            grunt.fail.warn("Please try with --type=patch|minor|major");
        }
    });
};
