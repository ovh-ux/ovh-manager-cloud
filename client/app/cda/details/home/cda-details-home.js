angular.module("managerApp")
    .config(function ($stateProvider) {
        "use strict";

        $stateProvider
            .state("paas.cda.cda-details.cda-details-home", {
                url: "/home",
                views: {
                    cdaDetailsTab: {
                        templateUrl: "app/cda/details/home/cda-details-home.html",
                        controller: "CdaDetailsHomeCtrl",
                        controllerAs: "CdaDetailsHomeCtrl"
                    }
                },
                translations: ["common", "cda", "cda/details/home"]
            });
    });
