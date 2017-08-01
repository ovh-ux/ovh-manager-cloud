"use strict";

angular.module("managerApp").config(function ($stateProvider) {
    $stateProvider.state("iaas.pci-project.billing", {
        url: "/billing",
        views: {
            cloudProject: {
                templateUrl: "app/cloud/project/billing/cloud-project-billing.html",
                controller: "CloudProjectBillingCtrl",
                controllerAs: "CloudProjectBillingCtrl"
            }
        },
        translations: ["common", "cloud/project/billing", "cloud/project/delete"],
        atInternet: { ignore: true }
    });
});
