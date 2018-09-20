"use strict";

angular.module("managerApp")
    .config(function ($stateProvider) {
        $stateProvider
        /**
         * NEW PROJECT
         * #/cloud/project/new (see "add" folder)
         */

            .state("iaas.pci-project-new", {
                url: "/pci/project/new",
                templateUrl: "app/cloud/project/add/cloud-project-add.html",
                controller: "CloudProjectAddCtrl",
                controllerAs: "CloudProjectAddCtrl",
                translations: [
                  "common",
                  "cloud/project/add",
                ],
            });
    });
