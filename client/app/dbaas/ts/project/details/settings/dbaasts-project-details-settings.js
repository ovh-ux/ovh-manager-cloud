"use strict";

angular.module("managerApp").config(function ($stateProvider) {

    $stateProvider.state("dbaas.dbaasts-project.dbaasts-project-details.dbaasts-project-details-settings", {
        url: "/settings",
        views: {
            dbaastsProjectDetails: {
                templateUrl: "app/dbaas/ts/project/details/settings/dbaasts-project-details-settings.html",
                controller: "DBaasTsProjectDetailsSettingsCtrl",
                controllerAs: "DBaasTsProjectDetailsSettingsCtrl"
            }
        },
        translations: ["common", "dbaas/ts/project/add", "dbaas/ts/project/details", "dbaas/ts/project/details/settings"]
    });

});
