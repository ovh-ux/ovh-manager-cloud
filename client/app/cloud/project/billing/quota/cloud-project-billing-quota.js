"use strict";

angular.module("managerApp").config(function ($stateProvider) {

    $stateProvider.state("iaas.pci-project.billing.quota", {
        url: "/quota",
        views: {
            cloudProjectBilling: {
                templateUrl: "app/cloud/project/billing/quota/cloud-project-billing-quota.html",
                controller: "CloudProjectBillingQuotaCtrl",
                controllerAs: "CloudProjectBillingQuotaCtrl"
            }
        },
        translations: ["common", "cloud/project/billing", "cloud/project/billing/quota"]
    });
});
