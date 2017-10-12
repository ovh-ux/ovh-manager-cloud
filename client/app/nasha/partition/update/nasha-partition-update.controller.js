angular.module("managerApp").controller("NashaPartitionUpdateCtrl", function ($stateParams, $scope, $uibModalInstance, $translate, OvhApiDedicatedNasha, CloudMessage) {
    "use strict";
    var self = this;
    self.loading = false;

    self.data = {
        nashaId: $stateParams.nashaId,
        partition: $scope.$resolve.items,
        newSize: $scope.$resolve.items.size,
    };

    self.isSizeChanged = function () {
        return $scope.$resolve.items.size !== self.data.newSize;
    };

    self.checkSize = function () {
        if (self.data.newSize) {
            self.data.newSize = parseInt(self.data.newSize.toString().replace(".", ""), 10);
        }
    };

    self.updatePartition = function () {
        self.loading = true;
        OvhApiDedicatedNasha.Partition().Lexi().update({
            serviceName: self.data.nashaId
        }, {
            partitionName: self.data.partition.partitionName,
            size: self.data.newSize
        }).$promise.then(function () {
            getTaskInTodoAndClose();
            CloudMessage.success($translate.instant("nasha_partitions_action_update_success", { partitionName: self.data.partition.partitionName }));
        }).catch(function () {
            $uibModalInstance.dismiss();
            CloudMessage.error($translate.instant("nasha_partitions_action_update_failure", { partitionName: self.data.partition.partitionName }));
        }).finally(function () {
            self.loading = false;
        });
    };

    function getTaskInTodoAndClose () {
        getTasksTodo("clusterLeclercPartitionUpdate")
            .$promise.then(function (tasks) {
                $uibModalInstance.close({ partition: self.data.partition, tasks: tasks });
            });
    }

    self.dismiss = function () {
        $uibModalInstance.dismiss();
    };

    function getTasksTodo (operation) {
        return OvhApiDedicatedNasha.Task().Lexi().query({
            operation: operation,
            serviceName: self.data.nashaId,
            status: "todo"
        });
    }
});
