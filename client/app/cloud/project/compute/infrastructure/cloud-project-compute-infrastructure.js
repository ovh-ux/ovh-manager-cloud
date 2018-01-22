"use strict";

angular.module("managerApp")
    .config($stateProvider => {
        $stateProvider
            .state("iaas.pci-project.compute.infrastructure", {
                url: "/infrastructure?openVncWithId",
                sticky: true,
                views: {
                    cloudProjectCompute: {
                        templateUrl: "app/cloud/project/compute/infrastructure/cloud-project-compute-infrastructure.html",
                        controller: "CloudProjectComputeInfrastructureCtrl",
                        controllerAs: "CloudProjectComputeInfrastructureCtrl"
                    }
                },
                params: {
                    openVncWithId: { value: null },
                    // true to indicate that we want to display the add volume popover
                    createNewVolume: false,
                    // pass snapshot data to display restore volume popover
                    createNewVolumeFromSnapshot: { snapshot: null },
                    // true to indicate that we want to display the add VM popover
                    createNewVm: false
                },
                translations: ["common",
                    "cloud/project/compute/snapshot/add",
                    "cloud/project/compute/volume/snapshot",
                    "cloud/project/compute/infrastructure/ip/failover/import",
                    "cloud/project/compute/infrastructure/ip/failover/buy",
                    "cloud/project/compute/infrastructure/volume",
                    "cloud/project/compute/infrastructure/volume/addEdit",
                    "cloud/project/compute/infrastructure/virtualMachine/addEdit",
                    "cloud/project/compute/infrastructure/virtualMachine/delete",
                    "cloud/project/compute/infrastructure/virtualMachine/vnc",
                    "cloud/project/compute/infrastructure/virtualMachine/rescue",
                    "cloud/project/compute/infrastructure/virtualMachine/monthlyConfirm",
                    "cloud/project/compute/infrastructure/virtualMachine/monitoring",
                    "cloud/project/compute/infrastructure/privateNetwork",
                    "cloud/project/compute/infrastructure/privateNetwork/dialog",
                    "cloud/project/compute/infrastructure/privateNetwork/delete",
                    "cloud/project/delete",
                    "cloud/project/rename",
                    "cloud/project/compute/infrastructure/openstackClient"
                ]
            });
    });
