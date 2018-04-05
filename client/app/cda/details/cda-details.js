angular.module("managerApp")
    .config(function ($stateProvider) {
        "use strict";

        $stateProvider
            .state("paas.cda.cda-details", {
                url: "/{serviceName}",
                views: {
                    cdaDetails: {
                        templateUrl: "app/cda/details/cda-details.html",
                        controller: "CdaDetailsCtrl",
                        controllerAs: "CdaDetailsCtrl"
                    }
                },
                translations: ["common"]
            });
    });
