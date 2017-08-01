angular.module("managerApp")
    .config(function ($stateProvider) {
        "use strict";

        $stateProvider
            .state("paas.cda.cda-details.cda-user.cda-user-details", {
                url: "/{userName}/details",
                views: {
                    cdaUserContent: {
                        templateUrl: "app/cda/user/details/cda-user-details.html",
                        controller: "CdaUserDetailsCtrl",
                        controllerAs: "CdaUserDetailsCtrl"
                    }
                },
                translations: ["common", "cda/user/details"]
            });
    });
