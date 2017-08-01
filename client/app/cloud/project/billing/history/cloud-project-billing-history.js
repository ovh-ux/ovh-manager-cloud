"use strict";

angular.module("managerApp").config(function ($stateProvider) {
    $stateProvider.state("iaas.pci-project.billing.history", {
        url: "/history/:year/:month",
        abstract: true,
        views: {
            cloudProjectBilling: {
                templateUrl: "app/cloud/project/billing/history/cloud-project-billing-history.html",
                controller: "CloudProjectBillingHistoryCtrl",
                controllerAs: "BillingHistoryCtrl"
            }
        },
        translations: ["common", "cloud/project/billing", "cloud/project/billing/history", "../components/cloud/project/billing"]
    });
});
