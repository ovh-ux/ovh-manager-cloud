"use strict";

angular.module("managerApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("iaas.pci-project.openstack", {
                url: "/openstack",
                sticky: true,
                views: {
                    cloudProject: {
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
