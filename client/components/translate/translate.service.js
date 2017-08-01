/**
 * @ngdoc service
 * @name managerApp.service:TranslateService
 * @description Manage translations
 */
angular.module("managerApp")
.provider("TranslateService", function (LANGUAGES) {
    "use strict";

    var self = this;
    var localeRegex = /^([a-zA-Z]+)(?:[_-]([a-zA-Z]+))?$/;
    var availableLangsKeys = _.map(LANGUAGES.available, "key");

    // Current locale
    var currentLanguage = LANGUAGES["default"];

    /**
     * @ngdoc function
     * @methodOf managerApp.service:TranslateService
     * @name setUserLocale
     * @description Set current user locale (in localStorage)
     * @param  {String} locale - (optional) Force to set the gicen locale identifier
     */
    this.setUserLocale = function (locale) {

        if (!locale) {
            if (localStorage["univers-selected-language"]) {
                locale = localStorage["univers-selected-language"];
            } else if (navigator.language || navigator.userLanguage) {
                locale = navigator.language || navigator.userLanguage;
            } else {
                locale = LANGUAGES["default"];
            }
        }

        var splittedLocale = locale.match(localeRegex);

        if (splittedLocale) {

            // Format the value
            locale = splittedLocale[1].toLowerCase() + "_" + (splittedLocale[2] ? splittedLocale[2] : splittedLocale[1]).toUpperCase();

            // Check if language exist into the list
            if (availableLangsKeys.indexOf(locale) === -1) {
                // Not found: Try to find another country with same base language
                var similarLanguage = _.find(availableLangsKeys, function (val) {
                    return localeRegex.test(val) && val.match(localeRegex)[1] === splittedLocale[1];
                });

                if (similarLanguage) {
                    // Found
                    currentLanguage = similarLanguage;
                } else {
                    // Not found
                    currentLanguage = currentLanguage || LANGUAGES["default"];
                }
            } else {
                // Found
                currentLanguage = locale;
            }

        } else {
            // Incorrect value
            currentLanguage = currentLanguage || LANGUAGES["default"];
        }

        // Save it!
        localStorage["univers-selected-language"] = currentLanguage;
    };

    /**
     * @ngdoc function
     * @methodOf managerApp.service:TranslateService
     * @name getUserLocale
     * @description Returns the current user locale
     * @param  {Boolean} min - (optional) Return the base locale only
     * @return {String}      - Current locale
     */
    this.getUserLocale = function (min) {
        if (min) {
            return currentLanguage.split("_")[0];
        } else {
            return currentLanguage;
        }
    };

    this.$get = function () {
        return {
            getUserLocale: self.getUserLocale,
            setUserLocale: self.setUserLocale
        };
    };

});
