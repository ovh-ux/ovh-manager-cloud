angular.module("managerApp")
    .config(function ($stateProvider) {
        "use strict";

        $stateProvider
            .state("paas.cda.cda-details.cda-pool.cda-pool-list", {
                url: "/list",
                views: {
                    cdaPoolContent: {
                        templateUrl: "app/cda/pool/list/cda-pool-list.html",
                        controller: "CdaPoolListCtrl",
                        controllerAs: "CdaPoolListCtrl"
                    }
                },
                translations: ["common", "cda/pool/list"],
            });
    });
