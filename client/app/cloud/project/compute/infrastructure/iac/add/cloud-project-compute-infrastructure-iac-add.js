"use strict";

angular.module("managerApp").config($stateProvider => {
    $stateProvider.state("iaas.pci-project.compute.infrastructure.iac-add", {
        url: "/iac/add",
        views: {
            cloudProjectComputeInfrastructure: {
                templateUrl: "app/cloud/project/compute/infrastructure/iac/add/cloud-project-compute-infrastructure-iac-add.html",
                controller: "CloudProjectComputeInfrastructureIacAddCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common"]
    });
});
