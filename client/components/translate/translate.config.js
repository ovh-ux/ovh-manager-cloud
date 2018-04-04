class TranslateDecoratorService {
    getSubPaths (sourceList) {
        return _.chain(sourceList)
            .map(path => {
                const subPaths = [];
                let subPath = path.substring(path.indexOf("/") + 1, path.lastIndexOf("/"));
                let index = subPath.lastIndexOf("/");

                while (index > 0) {
                    subPaths.push(subPath);
                    subPath = subPath.substring(0, index);
                    index = subPath.lastIndexOf("/");
                }
                subPaths.push(subPath);
                return subPaths;
            })
            .flatten()
            .value();
    }

    getTranslationsFromState (state) {
        const templateUrlRoutes = [];
        let translationsRoutes = _.union([], state.translations);

        if (state.templateUrl) {
            templateUrlRoutes.push(state.templateUrl);
        }

        if (state.views) {
            _.forEach(state.views, value => {
                if (_.isUndefined(value.noTranslations) && !value.noTranslations) {
                    if (value.templateUrl) {
                        templateUrlRoutes.push(value.templateUrl);
                    }
                    if (value.translations) {
                        translationsRoutes = _.union(translationsRoutes, value.translations);
                    }
                }
            });
        }

        translationsRoutes = _.chain(translationsRoutes)
            .union(this.getSubPaths(templateUrlRoutes))
            .uniq()
            .value();

        return translationsRoutes;
    }

    getAncestors (state) {
        const ancestors = [state];
        let ancestor = state;
        while (!_.isNull(ancestor.parent)) {
            ancestors.push(ancestor.parent);
            ancestor = ancestor.parent;
        }
        return ancestors;
    }

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
    add ($transitionsProvider, $stateProvider) {

        $stateProvider.decorator("translations", state => {
            const translations = _.chain(this.getAncestors(state))
                .dropRight()
                .map(ancestor => this.getTranslationsFromState(ancestor.self))
                .flattenDeep()
                .uniq()
                .value();

            $transitionsProvider.onBefore({ to: state.self.name }, transition => {
                transition.addResolvable({
                    token: "translations",
                    deps: ["$translate", "$translatePartialLoader"],
                    resolveFn: ($translate, $translatePartialLoader) => {
                        _.forEach(translations, part => {
                            $translatePartialLoader.addPart(part);
                        });

                        return $translate.refresh();
                    }
                });
            });
        });
    };

    $get () {
        return {};
    };
}

angular.module("managerApp")
    .config(($translateProvider, TranslateServiceProvider, tmhDynamicLocaleProvider, LANGUAGES) => {
        // Get current locale
        const lang = TranslateServiceProvider.getUserLocale();

        // Define translation loader
        $translateProvider.useLoader("$translatePartialLoader", {
            urlTemplate (name, locale) {
                let part = name;
                const expectedPrefixRegex = /^(?:app)\//;
                if (expectedPrefixRegex.test(part) === false) {
                    if (part.indexOf("module-") === -1) {
                        part = `app/${part}`;
                    } else {
                        part = "app/components/";
                    }
                }
                return `${part}/translations/Messages_${locale}.json`;
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
    .factory("TranslateLoaderErrorHandler", $q => {
        return function () {
            return $q.when({});
        };
    })
    .factory("translateMissingTranslationHandler", $sanitize => {
        return function (translationId) {
        // Fix security issue: https://github.com/angular-translate/angular-translate/issues/1418
            return $sanitize(translationId);
        };
    })
    .provider("TranslateDecoratorService", TranslateDecoratorService);
