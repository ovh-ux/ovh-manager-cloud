"use strict";

angular.module("managerApp")
  .config(function ($stateProvider) {
    $stateProvider
      .state("iaas.pci-project.compute.infrastructure-overview", {
        url : "/infrastructure",
        sticky: true,
        views : {
            "cloudProjectCompute" : {
                templateUrl: "app/cloud/project/compute/infrastructureOverview/cloud-project-compute-infrastructure-overview.html",
                controller: "CloudProjectComputeInfrastructureOverviewCtrl",
                controllerAs : "CloudProjectComputeInfrastructureOverviewCtrl"
            }
        },
        translations : ["common",
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
          "cloud/project/compute/infrastructure/virtualMachine/monitoring"
        ]
      });
  });
