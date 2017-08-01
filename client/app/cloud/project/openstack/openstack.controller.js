"use strict";

angular.module("managerApp")
    .controller("CloudProjectOpenstackCtrl",
        function ($state) {
            $state.go("iaas.pci-project.openstack.users");
        });

