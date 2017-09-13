angular.module("managerApp").controller("NashaPartitionAddCtrl", function ($stateParams, $scope, $q, $uibModalInstance, $translate, OvhApiDedicatedNasha, Toast) {
    "use strict";
    var self = this;

    self.nasha = null;
    self.protocols = [];
    self.protocols = null;
    self.loading = false;

    self.newPartition = {
        partitionName: null,
        size: 10,
        protocol: null
    };

    self.error = {
        name: false
    };

    self.namePattern = /^[A-Za-z0-9]{1,20}$/;

    self.isPartitionValid = function () {
        return self.newPartition.partitionName &&   // Partition name is set
                self.newPartition.size &&   // partition size is set
                self.newPartition.protocol &&   // protocol is set
                self.newPartition.size >= 10 &&  // partition size is minimum 10 GB
                self.newPartition.size <= self.nasha.zpoolSize; // partition size is less or equal than the maax returned by the pi
    };

    self.addPartition = function () {
        self.loading = true;
        OvhApiDedicatedNasha.Partition().Lexi().create({
            serviceName: self.nasha.serviceName
        }, {
            partitionName: self.newPartition.partitionName,
            protocol: self.newPartition.protocol,
            size: self.newPartition.size
        }).$promise.then(function (result) {
            $uibModalInstance.close({ partition: self.newPartition, tasks: [result.data.taskId], isNew: true });
            Toast.success($translate.instant("nasha_partitions_action_add_success", { partitionName: self.newPartition.name }));
        }).catch(function () {
            $uibModalInstance.dismiss();
            Toast.error($translate.instant("nasha_partitions_action_add_failure", { partitionName: self.newPartition.name }));
        }).finally(function () {
            self.loading = false;
        });
    };

    self.dismiss = function () {
        $uibModalInstance.dismiss();
    };

    function init () {
        self.loading = true;
        $q.all({
            nasha: OvhApiDedicatedNasha.Lexi().get({ serviceName: $stateParams.nashaId }).$promise,
            schema:  OvhApiDedicatedNasha.Lexi().schema().$promise
        }).then(function (data) {
            self.protocols = data.schema.models["dedicated.storage.ProtocolEnum"].enum;
            self.nasha = data.nasha;
        }).finally(function () {
            self.loading = false;
        });
    }

    init();
});
