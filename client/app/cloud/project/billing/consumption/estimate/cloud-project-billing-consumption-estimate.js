"use strict";

angular.module("managerApp").config(function ($stateProvider) {
    $stateProvider.state("iaas.pci-project.billing.consumption.estimate", {
        url: "/estimate",
        views: {
            cloudProjectBillingConsumption: {
                templateUrl: "app/cloud/project/billing/consumption/estimate/cloud-project-billing-consumption-estimate.html",
                controller: "CloudProjectBillingConsumptionEstimateCtrl",
                controllerAs: "BillingConsumptionEstimateCtrl"
            }
        },
        translations: ["common", "cloud/project/billing/consumption/estimate", "cloud/project/billing/consumption/estimate/alert/add"],
    });
});
