// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

const dependencies = require("./dependencies.json");

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: "",

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ["jasmine"],

        // list of files / patterns to load in the browser
        files: [
            ...dependencies.js,
            ...dependencies.dev.js,

            "client/app/app.js",
            "client/{app,components}/**/*.js",
            "client/{app,components}/**/*.html",

            {pattern: 'client/bower_components/ovh-api-services/**/*.dt.spec.json', included: false}
        ],

        preprocessors: {
            "client/{app,components}/**/!(*.spec|*.mock).js": ["coverage"],
            "**/*.html": "ng-html2js",
            "client/{app,components}/**/*.js": "babel"
        },

        ngHtml2JsPreprocessor: {
            stripPrefix: "client/",
            moduleName: "managerApp"
        },

        babelPreprocessor: {
            options: {
                sourceMap: "inline"
            },
            filename: function (file) {
                return file.originalPath.replace(/\.js$/, ".es5.js");
            },
            sourceFileName: function (file) {
                return file.originalPath;
            }
        },

        // list of files / patterns to exclude
        exclude: [
            "client/app/module-otrs/**/*.spec.js",
            "client/bower_components/ovh-api-services/**/*spec.js"
        ],

        // web server port
        port: 8081,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // reporter types:
        // - dots
        // - progress (default)
        // - spec (karma-spec-reporter)
        // - junit
        // - growl
        // - coverage
        reporters: ["nyan", "junit"],

        // junit reporter config
        junitReporter: {
            outputDir: "test-reports",
            outputFile: "../junit-client-report.xml"
        },

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ["PhantomJS"],

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
