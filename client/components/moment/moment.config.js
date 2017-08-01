"use strict";

angular.module("managerApp").run(function (TranslateService, moment, amMoment) {

    // Set the Moment locale
    var locale = TranslateService.getUserLocale(true);
    moment.locale(locale);
    amMoment.changeLocale(locale);

});
