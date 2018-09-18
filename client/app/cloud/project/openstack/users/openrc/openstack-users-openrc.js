"use strict";

angular.module("managerApp")
.config(function ($stateProvider) {
    $stateProvider.state("iaas.pci-project.compute.openstack.users.openrc", {
        url: "/openrc",
        templateUrl: "app/cloud/project/openstack/users/openrc/openstack-users-openrc.html",
        controller: "OpenstackUsersOpenrcCtrl",
        controllerAs: "OpenstackUsersOpenrcCtrl",
        translations: ["common", "cloud/project/openstack/users/openrc"],
    });
});
