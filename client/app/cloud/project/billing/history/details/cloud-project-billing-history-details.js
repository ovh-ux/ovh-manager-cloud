"use strict";

angular.module("managerApp").config(function ($stateProvider) {
    $stateProvider.state("iaas.pci-project.billing.history.details", {
        url: "",
        views: {
            cloudProjectHistory: {
                templateUrl: "app/cloud/project/billing/history/details/cloud-project-billing-history-details.html",
                controller: "CloudProjectBillingHistoryDetailsCtrl",
                controllerAs: "BillingHistoryDetailsCtrl"
            }
        },
        translations: ["common", "cloud/project/billing/history/details"]
    });
});
