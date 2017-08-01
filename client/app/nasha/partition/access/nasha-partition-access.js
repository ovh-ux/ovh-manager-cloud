"use strict";

angular.module("managerApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("paas.nasha.nasha-partition-access", {
                url: "/access/:partitionName",
                views: {
                    nashaPartitionAccess: {
                        templateUrl: "app/nasha/partition/access/nasha-partition-access.html",
                        controller: "NashaPartitionAccessCtrl",
                        controllerAs: "NashaPartitionAccessCtrl"
                    }
                },
                translations: ["common", "nasha/partition/access"]
            });
    });
