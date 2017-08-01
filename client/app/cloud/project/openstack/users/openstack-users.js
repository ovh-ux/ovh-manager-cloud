"use strict";

angular.module("managerApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("iaas.pci-project.openstack.users", {
                url: "/users",
                sticky: true,
                views: {
                    cloudProjectOpenstack: {
                        templateUrl: "app/cloud/project/openstack/users/openstack-users.html",
                        controller: "CloudProjectOpenstackUsersCtrl",
                        controllerAs: "CloudProjectOpenstackUsersCtrl"
                    }
                },
                translations: [
                    "cloud/project/openstack/users/token",
                    "cloud/project/openstack/users/openrc"
                ]
            });
    });
