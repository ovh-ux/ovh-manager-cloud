"use strict";

angular.module("managerApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("paas.nasha.nasha-partitions", {
                url: "/partitions",
                views: {
                    nashaPartition: {
                        templateUrl: "app/nasha/partition/nasha-partition.html",
                        controller: "PartitionCtrl",
                        controllerAs: "PartitionCtrl"
                    }
                },
                onEnter: CloudMessage => CloudMessage.flushMessages(),
                translations: [
                    "common",
                    "nasha/partition",
                    "nasha/partition/add",
                    "nasha/partition/delete",
                    "nasha/partition/update",
                    "nasha/partition/snapshot",
                    "nasha/partition/custom-snapshot",
                    "nasha/partition/zfs-options"
                ]
            });
    });
