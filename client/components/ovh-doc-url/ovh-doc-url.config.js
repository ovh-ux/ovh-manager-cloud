angular.module("managerApp").config((TranslateServiceProvider, ovhDocUrlProvider) => {
    "use strict";

    ovhDocUrlProvider.setUserLocale(TranslateServiceProvider.getUserLocale());
    ovhDocUrlProvider.setUrlPrefix("/engine/2api");
});

