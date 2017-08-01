angular.module("managerApp")
    .config(function ($stateProvider) {
        "use strict";

        $stateProvider
            .state("paas.cda.cda-details.cda-user", {
                url: "/user",
                views: {
                    cdaDetailsTab: {
                        templateUrl: "app/cda/user/cda-user.html",
                        abstract: true
                    }
                },
                translations: ["common"]
            });
    });
