"use strict";

angular.module("managerApp").config(function ($stateProvider) {

    $stateProvider.state("iaas.pci-project.compute.quota", {
        url: "/quota",
        views: {
            cloudProjectCompute: {
                templateUrl: "app/cloud/project/compute/quota/cloud-project-compute-quota.html",
                controller: "CloudProjectComputeQuotaCtrl",
                controllerAs: "CloudProjectComputeQuotaCtrl"
            }
        },
        translations: ["common", "cloud/project/compute/quota"]
    });
});
