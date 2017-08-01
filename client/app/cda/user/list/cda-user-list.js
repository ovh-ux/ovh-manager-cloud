angular.module("managerApp")
    .config(function ($stateProvider) {
        "use strict";

        $stateProvider
            .state("paas.cda.cda-details.cda-user.cda-user-list", {
                url: "/list",
                views: {
                    cdaUserContent: {
                        templateUrl: "app/cda/user/list/cda-user-list.html",
                        controller: "CdaUserListCtrl",
                        controllerAs: "CdaUserListCtrl"
                    }
                },
                translations: ["common", "cda/user/list"]
            });
    });
