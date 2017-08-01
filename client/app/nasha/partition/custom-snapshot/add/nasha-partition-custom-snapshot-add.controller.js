angular.module("managerApp").controller("NashaPartitionCustomSnapshotAddCtrl", function ($scope, $stateParams, $translate, $uibModalInstance, DedicatedNashaPartition, Toast) {
    "use strict";
    var self = this;

    self.saving = false;

    self.data = {
        partition: $scope.$resolve.items,
        customSnapshot: {
            prefix: "snap-"
        }
    };

    self.options = {
        snapshotName: {
            maxLength: 70
        }
    }

    self.snapshotName = "";

    function init () {
        computeDefaultSnapshotName();
    }

    self.addCustomSnapshot = function () {
        self.saving = true;
        DedicatedNashaPartition.CustomSnapshot().Lexi().add({
            serviceName: $stateParams.nashaId,
            partitionName: self.data.partition.partitionName
        }, {
            name: self.snapshotName
        }).$promise.then(function (result) {
            $uibModalInstance.close({ partition: self.data.partition, tasks: [result.data.taskId] });
            Toast.success($translate.instant("nasha_custom_snapshot_modal_success"));
        }).catch(function () {
            $uibModalInstance.dismiss();
            Toast.error($translate.instant("nasha_custom_snapshot_modal_fail"));
        }).finally(function () {
            self.saving = false;
        });
    };

    self.dismiss = function () {
        $uibModalInstance.dismiss();
    };

    function computeDefaultSnapshotName () {
        var currentDate = new Date();
        var timeZonedDate = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000));
        var dateString = timeZonedDate.toISOString();
        self.snapshotName = self.data.partition.partitionName + "-" + dateString;
    }

    init();
});