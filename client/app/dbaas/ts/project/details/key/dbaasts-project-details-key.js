"use strict";

angular.module("managerApp").config(function ($stateProvider) {

    $stateProvider.state("dbaas.dbaasts-project.dbaasts-project-details.dbaasts-project-details-key", {
        url: "/keys",
        views: {
            dbaastsProjectDetails: {
                templateUrl: "app/dbaas/ts/project/details/key/dbaasts-project-details-key.html",
                controller: "DBaasTsProjectDetailsKeyCtrl",
                controllerAs: "DBaasTsProjectDetailsKeyCtrl"
            }
        },
        resolve: {
            ensureActive: function (DBaasTsProjectService, $stateParams) {
                return DBaasTsProjectService.ensureProjectIsActive($stateParams);
            }
        },
        translations: ["common", "dbaas/ts/project/details/key"]
    });

});
