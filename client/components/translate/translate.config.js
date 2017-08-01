angular.module("managerApp")
.config(function ($translateProvider, TranslateServiceProvider, tmhDynamicLocaleProvider, LANGUAGES) {
    "use strict";
    var lang;

    // Get current locale
    lang = TranslateServiceProvider.getUserLocale();

    // Define translation loader
    $translateProvider.useLoader("$translatePartialLoader", {
        urlTemplate: function (name, lang) {
            var part = name;
            var expectedPrefixRegex = /^(?:app)\//;
            if (expectedPrefixRegex.test(part) === false) {
                if (part.indexOf("module-") === -1) {
                    part = "app/" + part;
                } else {
                    part = "app/components/";
                }
            }
            return part + "/translations/Messages_" + lang + ".json";
        },
        loadFailureHandler: "TranslateLoaderErrorHandler"
    });
    // Configure $translate
    $translateProvider.useLoaderCache(true);
    $translateProvider.useSanitizeValueStrategy("sanitizeParameters");
    $translateProvider.useMissingTranslationHandler("translateMissingTranslationHandler");
    $translateProvider.preferredLanguage(lang);
    $translateProvider.fallbackLanguage(LANGUAGES.fallback);
    $translateProvider.use(lang);

    // Set angular locale
    tmhDynamicLocaleProvider.localeLocationPattern("bower_components/angular-i18n/angular-locale_{{locale}}.js");
    tmhDynamicLocaleProvider.defaultLocale(_.kebabCase(lang));
})

/**
 * Translate Error Handler: If 404 on i18n file, return an empty object
 */
.factory("TranslateLoaderErrorHandler", function ($q) {
    "use strict";
    return function () {
        return $q.when({});
    };
})

.factory("translateMissingTranslationHandler", function translateMissingTranslationHandler ($sanitize) {
    "use strict";
    return function (translationId) {
        // Fix security issue: https://github.com/angular-translate/angular-translate/issues/1418
        return $sanitize(translationId);
    };
})

.provider("TranslateDecoratorService", function () {
    "use strict";

    /**
     * (ui-router) Automatically load translations on state change
     *
     * @example:
     * $stateProvider
     *    .state("foo-bar", {
     *        url          : "/foo/bar",
     *        templateUrl  : "app/foo/bar/bar.html",
     *        controller   : "FooBarCtrl",
     *        controllerAs : "FooBarCtrl"
     *        translations : [
     *            "app/common",
     *            "app/foo",
     *            "app/foo/bar"
     *        ]
     *    });
     */
    this.add = function ($stateProvider) {

        $stateProvider.decorator("translations", function (state) {
            var routeOption = state.self;

            if (routeOption.translations) {

                var templateUrlTab = [];
                var translationsTab = routeOption.translations;

                if (routeOption.templateUrl) {
                    templateUrlTab.push(routeOption.templateUrl);
                }

                if (routeOption.views) {
                    angular.forEach(routeOption.views, function (value) {
                        if (value.templateUrl) {
                            templateUrlTab.push(value.templateUrl);
                        }
                        if (value.translations) {
                            translationsTab = _.union(translationsTab, value.translations);
                        }
                    });
                }

                translationsTab.push("app/common");

                angular.forEach(templateUrlTab, function (templateUrl) {
                    var routeTmp = templateUrl.substring(templateUrl.indexOf("/") + 1, templateUrl.lastIndexOf("/")),
                        index = routeTmp.lastIndexOf("/");

                    while (index > 0) {
                        translationsTab.push(routeTmp);
                        routeTmp = routeTmp.substring(0, index);
                        index = routeTmp.lastIndexOf("/");
                    }

                    translationsTab.push(routeTmp);
                });
                // mmmhhh... It seems that we have to refresh after each time a part is added

                translationsTab = _.uniq(translationsTab);

                state.resolve.translations = ["$translate", "$translatePartialLoader", function ($translate, $translatePartialLoader) {
                    // load translation parts
                    angular.forEach(translationsTab, function (part) {
                        $translatePartialLoader.addPart(part);
                    });

                    return $translate.refresh();
                }];

                return translationsTab;

            }
            return;
        });
    };
    this.$get = function () {
        return {};
    };
});
