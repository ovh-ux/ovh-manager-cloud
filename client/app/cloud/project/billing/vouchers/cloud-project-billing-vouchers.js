"use strict";

angular.module("managerApp").config(function ($stateProvider) {
    $stateProvider.state("iaas.pci-project.billing.vouchers", {
        url: "/vouchers",
        views: {
            cloudProjectBilling: {
                templateUrl: "app/cloud/project/billing/vouchers/cloud-project-billing-vouchers.html",
                controller: "CloudprojectbillingvouchersCtrl",
                controllerAs: "VouchersCtrl"
            }
        },
        translations: ["common", "cloud/project/billing/vouchers", "cloud/project/billing/vouchers/addCredit"]
    });
});
