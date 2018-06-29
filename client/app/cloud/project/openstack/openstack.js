"use strict";

angular.module("managerApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("iaas.pci-project.compute.openstack", {
                url: "/openstack",
                views: {
                    cloudProjectCompute: {
                        templateUrl: "app/cloud/project/openstack/openstack.html",
                        controller: "CloudProjectOpenstackCtrl",
                        controllerAs: "CloudProjectOpenstackCtrl"
                    }
                },
                translations: [
                    "common",
                    "cloud/project/openstack"
                ]
            });
    });
