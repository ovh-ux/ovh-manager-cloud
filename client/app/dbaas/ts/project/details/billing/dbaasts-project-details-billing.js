"use strict";

angular.module("managerApp").config(function ($stateProvider) {

    $stateProvider.state("dbaas.dbaasts-project.dbaasts-project-details.dbaasts-project-details-billing", {
        url: "/conso",
        views: {
            dbaastsProjectDetails: {
                templateUrl: "app/dbaas/ts/project/details/billing/dbaasts-project-details-billing.html",
                controller: "DBaasTsProjectDetailsBillingCtrl",
                controllerAs: "DBaasTsProjectDetailsBillingCtrl"
            }
        },
        resolve: {
            ensureActive: function (DBaasTsProjectService, $stateParams) {
                return DBaasTsProjectService.ensureProjectIsActive($stateParams);
            }
        },
        translations: ["common", "dbaas/ts/project/details", "dbaas/ts/project/details/billing"]
    });

});
