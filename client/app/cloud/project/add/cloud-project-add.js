"use strict";

angular.module("managerApp")
    .config($stateProvider => {
        $stateProvider
            .state("iaas.pci-project-new", {
                url: "/pci/project/new?orderId",
                templateUrl: "app/cloud/project/add/cloud-project-add.html",
                controller: "CloudProjectAddCtrl",
                controllerAs: "CloudProjectAddCtrl",
                translations: ["common"]
            });
    });
