"use strict";

angular.module("managerApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("iaas.pci-project.storage", {
                url: "/storage",
                views: {
                    cloudProject: {
                        templateUrl: "app/cloud/project/storage/storage.html",
                        controller: "RA.storageCtrl",
                        controllerAs: "RA.storageCtrl"
                    }
                },
                translations: ["common", "cloud/project/storage", "cloud/project/compute"]
            });

        $stateProvider
            .state("iaas.pci-project.storage.add-container", {
                url: "/add",
                views: {
                    "cloudProject@iaas.pci-project": {
                        templateUrl: "app/cloud/project/storage/storage-add/storage-add.html",
                        controller: "RA.storageAddCtrl",
                        controllerAs: "RA.storageAddCtrl"
                    }
                },
                translations: ["common", "cloud/project/storage", "cloud/project/compute"]
            });

        $stateProvider
            .state("iaas.pci-project.storage.detail-container", {
                url: "/{storageId}",
                views: {
                    "cloudProject@iaas.pci-project": {
                        templateUrl: "app/cloud/project/storage/storage-details/storage-details.html",
                        controller: "RA.storageDetailsCtrl",
                        controllerAs: "RA.storageDetailsCtrl"
                    }
                },
                translations: ["common", "cloud/project/storage", "cloud/project/compute"]
            });

    });
