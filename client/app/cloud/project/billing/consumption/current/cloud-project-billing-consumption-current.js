"use strict";

angular.module("managerApp").config(function ($stateProvider) {
    $stateProvider.state("iaas.pci-project.billing.consumption.current", {
        url: "/current",
        views: {
            cloudProjectBillingConsumption: {
                templateUrl: "app/cloud/project/billing/consumption/current/cloud-project-billing-consumption-current.html",
                controller: "CloudProjectBillingConsumptionCurrentCtrl",
                controllerAs: "BillingConsumptionCurrentCtrl"
            }
        },
        translations: ["common", "cloud/project/billing", "../components/cloud/project/billing", "cloud/project/billing/consumption/current"]
    });
});
