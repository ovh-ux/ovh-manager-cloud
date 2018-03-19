// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: "",

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ["jasmine"],

        // list of files / patterns to load in the browser
        files: [
            "client/bower_components/jquery/dist/jquery.js",
            "client/bower_components/angular/angular.js",
            "client/bower_components/ovh-ui-angular/dist/oui-angular.min.js",
            "client/bower_components/angular-animate/angular-animate.js",
            "client/bower_components/angular-aria/angular-aria.js",
            "client/bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
            "client/bower_components/angular-cookies/angular-cookies.js",
            "client/bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js",
            "client/bower_components/angular-messages/angular-messages.js",
            "client/bower_components/moment/min/moment-with-locales.js",
            "client/bower_components/angular-moment/angular-moment.js",
            "client/bower_components/angular-resource/angular-resource.js",
            "client/bower_components/angular-sanitize/angular-sanitize.js",
            "client/bower_components/angular-strap/dist/modules/compiler.min.js",
            "client/bower_components/angular-strap/dist/modules/dimensions.min.js",
            "client/bower_components/angular-strap/dist/modules/tooltip.min.js",
            "client/bower_components/angular-strap/dist/modules/tooltip.tpl.min.js",
            "client/bower_components/angular-strap/dist/modules/popover.min.js",
            "client/bower_components/angular-strap/dist/modules/popover.tpl.min.js",
            "client/bower_components/angular-translate/angular-translate.js",
            "client/bower_components/angular-translate-loader-partial/angular-translate-loader-partial.js",
            "client/bower_components/angular-ui-router/release/angular-ui-router.js",
            "client/bower_components/jquery-ui/ui/minified/core.min.js",
            "client/bower_components/jquery-ui/ui/minified/widget.min.js",
            "client/bower_components/jquery-ui/ui/minified/mouse.min.js",
            "client/bower_components/jquery-ui/ui/minified/draggable.min.js",
            "client/bower_components/jquery-ui/ui/minified/droppable.min.js",
            "client/bower_components/jquery-ui/ui/minified/sortable.min.js",
            "client/bower_components/angular-ui-sortable/sortable.js",
            "client/bower_components/angular-ui-validate/dist/validate.js",
            "client/bower_components/bootstrap/dist/js/bootstrap.js",
            "client/bower_components/d3/d3.js",
            "client/bower_components/jquery.cookie/jquery.cookie.js",
            "client/bower_components/jquery.scrollTo/jquery.scrollTo.js",
            "client/bower_components/lodash/lodash.js",
            "client/bower_components/matchmedia/matchMedia.js",
            "client/bower_components/matchmedia-ng/matchmedia-ng.js",
            "client/bower_components/ng-slide-down/dist/ng-slide-down.min.js",
            "client/bower_components/uri.js/src/URI.min.js",
            "client/bower_components/validator-js/validator.js",
            "client/bower_components/ovh-angular-a-disabled/dist/ovh-angular-a-disabled.min.js",
            "client/bower_components/ng-at-internet/dist/ng-at-internet.min.js",
            "client/bower_components/at-internet-ui-router-plugin/dist/at-internet-ui-router-plugin.js",
            "client/bower_components/ovh-jquery-ui-draggable-ng/dist/ovh-jquery-ui-draggable-ng.min.js",
            "client/bower_components/ovh-angular-responsive-popover/dist/ovh-angular-responsive-popover.min.js",
            "client/bower_components/ovh-angular-actions-menu/dist/ovh-angular-actions-menu.min.js",
            "client/bower_components/ovh-angular-sidebar-menu/dist/ovh-angular-sidebar-menu.min.js",
            "client/bower_components/ovh-angular-jquery-ui-droppable/dist/ovh-angular-jquery-ui-droppable.min.js",
            "client/bower_components/jsplumb/dist/js/jquery.jsPlumb-1.7.4-min.js",
            "client/bower_components/ovh-angular-jsplumb/dist/ovh-angular-jsplumb.min.js",
            "client/bower_components/ovh-angular-checkbox-table/dist/ovh-angular-checkbox-table.min.js",
            "client/bower_components/ovh-common-style/dist/ovh-common-style.min.js",
            "client/bower_components/ovh-angular-form-flat/dist/ovh-angular-form-flat.min.js",
            "client/bower_components/ovh-angular-q-allsettled/dist/ovh-angular-q-allsettled.min.js",
            "client/bower_components/ovh-angular-slider/dist/ovh-angular-slider.min.js",
            "client/bower_components/ovh-angular-stop-event/dist/ovh-angular-stop-event.min.js",
            "client/bower_components/ovh-angular-proxy-request/dist/ovh-angular-proxy-request.min.js",
            "client/bower_components/ovh-angular-user-pref/dist/ovh-angular-user-pref.min.js",
            "client/bower_components/messenger/build/js/messenger.js",
            "client/bower_components/messenger/build/js/messenger-theme-future.js",
            "client/bower_components/messenger/build/js/messenger-theme-flat.js",
            "client/bower_components/ovh-angular-toaster/dist/ovh-angular-toaster.min.js",
            "client/bower_components/ovh-angular-browser-alert/dist/ovh-angular-browser-alert.js",
            "client/bower_components/ovh-angular-pagination-front/dist/ovh-angular-pagination-front.min.js",
            "client/bower_components/ovh-angular-responsive-page-switcher/dist/ovh-angular-responsive-page-switcher.min.js",
            "client/bower_components/ovh-angular-responsive-tabs/dist/ovh-angular-responsive-tabs.min.js",
            "client/bower_components/ovh-angular-sso-auth/dist/ovh-angular-sso-auth.min.js",
            "client/bower_components/ovh-angular-sso-auth-modal-plugin/dist/ovh-angular-sso-auth-modal-plugin.min.js",
            "client/bower_components/ovh-angular-swimming-poll/dist/ovh-angular-swimming-poll.min.js",
            "client/bower_components/ovh-angular-doc-url/dist/ovh-angular-doc-url.min.js",
            "client/bower_components/ovh-api-services/dist/ovh-api-services.min.js",
            "client/bower_components/ovh-angular-module-status/dist/ovh-angular-module-status.min.js",
            "client/bower_components/ovh-angular-otrs/dist/ovh-angular-otrs.min.js",
            "client/bower_components/chart.js/dist/Chart.js",
            "client/bower_components/angular-chart.js/dist/angular-chart.js",
            "client/bower_components/ovh-angular-list-view/dist/ovh-angular-list-view.min.js",
            "client/bower_components/jsurl/lib/jsurl.js",
            "client/bower_components/moment-duration-format/lib/moment-duration-format.js",
            "client/bower_components/angular-mocks/angular-mocks.js",
            "client/bower_components/jasmine-expect/dist/jasmine-matchers.js",
            "client/bower_components/karma-read-json/karma-read-json.js",

            "client/app/app.js",
            "client/{app,components}/**/*.module.js",
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
