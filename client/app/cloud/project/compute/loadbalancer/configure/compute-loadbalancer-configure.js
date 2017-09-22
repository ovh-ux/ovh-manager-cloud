"use strict";

angular.module("managerApp")
    .config($stateProvider => {
        $stateProvider
            .state("iaas.pci-project.compute.loadbalancer.configure", {
                url: "/loadbalancer/:loadbalancerId/configure?validate",
                views: {
                    cloudProjectCompute: {
                        templateUrl: "app/cloud/project/compute/loadbalancer/configure/compute-loadbalancer-configure.html",
                        controller: "CloudProjectComputeLoadbalancerConfigureCtrl",
                        controllerAs: "CloudProjectComputeLoadbalancerConfigureCtrl"
                    }
                },
                translations: ["common"]
            });
    });
