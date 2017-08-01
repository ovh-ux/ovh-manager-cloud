angular.module("managerApp")
    .config(function ($stateProvider) {
        "use strict";

        $stateProvider
            .state("paas.cda.cda-details.cda-ip.cda-ip-list", {
                url: "/list",
                views: {
                    cdaIpContent: {
                        templateUrl: "app/cda/ip/list/cda-ip-list.html",
                        controller: "CdaIpListCtrl",
                        controllerAs: "CdaIpListCtrl"
                    }
                },
                translations: ["common", "cda/ip/list"]
            });
    });
