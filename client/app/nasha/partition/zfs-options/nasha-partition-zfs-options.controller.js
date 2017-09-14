angular.module("managerApp").controller("NashaPartitionZFSOptionsCtrl",
    function ($uibModalInstance, $filter, $q, $stateParams, $scope, $translate, Toast, OvhApiDedicatedNasha, NashaPartitionZFSOptionsService) {
        "use strict";
        var self = this;

        self.enums = {};
        self.states = {
            saving: false
        };
        self.data = {
            partition: $scope.$resolve.items
        };
        self.model = {};

        self.dismiss = function () {
            $uibModalInstance.dismiss();
        };

        self.applyZFSOptionsChanges = function () {
            self.states.saving = true;
            OvhApiDedicatedNasha.Partition().Options().Lexi().save({
                serviceName: $stateParams.nashaId,
                partitionName: self.data.partition.partitionName
            }, {
                atime: self.model.atime ? "on" : "off",
                recordsize: self.model.recordsize,
                sync: self.model.sync
            }).$promise
            .then(function (result) {
                $uibModalInstance.close({ partition: self.data.partition, tasks: [result.data.taskId] });
                Toast.success($translate.instant("nasha_partitions_zfs_modal_success"));
            })
            .catch(function () {
                self.dismiss();
                Toast.error($translate.instant("nasha_partitions_zfs_modal_fail"));
            })
            .finally(function () {
                self.states.saving = false;
            });
        };

        self.$onInit = function () {
            self.loaders = true;
            self.data.partition = $scope.$resolve.items;
            NashaPartitionZFSOptionsService.getZFSOptionsEnums()
                .then(function (enums) {
                    self.enums = enums;
                    return NashaPartitionZFSOptionsService.getCurrentZFSOptions($stateParams.nashaId, self.data.partition.partitionName);
                })
                .then(function (options) {
                    self.model = options;
                })
                .catch(function () {
                    self.dismiss();
                    Toast.error($translate.instant("nasha_partitions_zfs_modal_loading_fail"));
                })
                .finally(function () {
                    self.loaders = false;
                });
        };
    });
