"use strict";

angular.module("managerApp")
.config(function ($stateProvider) {
    $stateProvider
        .state("iaas.pci-project.compute.infrastructure.volume-add-edit", {
            url: "/volume/addEdit",
            templateUrl: "app/cloud/project/compute/infrastructure/volume/addEdit/cloud-project-compute-infrastructure-volume-addEdit.html",
            controller: "CloudProjectComputeInfrastructureVolumeAddEditCtrl",
            controllerAs: "CloudProjectComputeInfrastructureVolumeAddEditCtrl",
            translations: ["common", "cloud/project/compute/infrastructure/volume/addEdit"]
        });
});
