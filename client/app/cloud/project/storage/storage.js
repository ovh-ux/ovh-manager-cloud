"use strict";

angular.module("managerApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("iaas.pci-project.compute.storage", {
                url: "/storage",
                views: {
                    cloudProjectCompute: {
                        templateUrl: "app/cloud/project/storage/storage.html",
                        controller: "RA.storageCtrl",
                        controllerAs: "RA.storageCtrl"
                    }
                },
                translations: ["common", "cloud/project/storage", "cloud/project/compute"]
            });

        $stateProvider
            .state("iaas.pci-project.compute.storage.add-container", {
                url: "/add",
                views: {
                    "cloudProjectCompute@iaas.pci-project.compute": {
                        templateUrl: "app/cloud/project/storage/storage-add/storage-add.html",
                        controller: "RA.storageAddCtrl",
                        controllerAs: "RA.storageAddCtrl"
                    }
                },
                translations: ["common", "cloud/project/storage", "cloud/project/compute"]
            });

        $stateProvider
            .state("iaas.pci-project.compute.storage.detail-container", {
                url: "/{storageId}",
                views: {
                    "cloudProjectCompute@iaas.pci-project.compute": {
                        templateUrl: "app/cloud/project/storage/storage-details/storage-details.html",
                        controller: "RA.storageDetailsCtrl",
                        controllerAs: "RA.storageDetailsCtrl"
                    }
                },
                translations: ["common", "cloud/project/storage", "cloud/project/compute"]
            });

    });
