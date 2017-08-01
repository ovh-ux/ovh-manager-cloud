angular.module("managerApp")
    .config(function ($stateProvider) {
        "use strict";

        $stateProvider
            .state("paas.cda.cda-details.cda-ip", {
                url: "/ip",
                views: {
                    cdaDetailsTab: {
                        templateUrl: "app/cda/ip/cda-ip.html",
                        abstract: true
                    }
                },
                translations: ["common"]
            });
    });
