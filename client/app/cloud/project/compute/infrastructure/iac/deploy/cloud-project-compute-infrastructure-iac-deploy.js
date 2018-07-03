"use strict";

angular.module("managerApp").config($stateProvider => {
    $stateProvider.state("iaas.pci-project.compute.infrastructure.iac-deploy", {
        url: "/iac/{stackId}/deploy",
        views: {
            cloudProjectComputeInfrastructure: {
                templateUrl: "app/cloud/project/compute/infrastructure/iac/deploy/cloud-project-compute-infrastructure-iac-deploy.html",
                controller: "CloudProjectComputeInfrastructureIacDeployCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common"]
    });
});
