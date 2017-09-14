angular.module("managerApp").controller("NashaPartitionAccessAddCtrl", function ($scope, $translate, $q, $uibModalInstance, OvhApiDedicatedNasha, Toast, CloudAapi) {
    "use strict";

    var self = this;

    self.loading = false;

    self.data = {
        serviceName: $scope.$resolve.items.serviceName,
        partition: $scope.$resolve.items.partition,
        accessAvailable: [],
        accessToAdd: null,
        type: "readwrite" // readonly or readwrite
    };

    self.loadAccessList = function () {
        self.loading = true;
        OvhApiDedicatedNasha.Partition().Access().Aapi()
        .authorizableIps({ serviceName: self.data.serviceName, partitionName: self.data.partition.partitionName }).$promise.then(function (result) {
            angular.forEach(result, function (ip) {
                if (!ip.description) {
                    //ng-options groupby won't group items with undefined group.  We have to replace null with undefined.
                    ip.description = undefined;
                }  
            });
            self.data.accessAvailable = result;
        }).catch(function () {
            Toast.success($translate.instant("nasha_partitions_access_loading_error"));
        }).finally(function () {
            self.loading = false;
        });
    };

    self.addAccess = function () {
        self.loading = true;
        OvhApiDedicatedNasha.Partition().Access().Lexi().add({
            serviceName: self.data.serviceName,
            partitionName: self.data.partition.partitionName
        }, {
            ip: self.data.accessToAdd.ip,
            type: self.data.type
        }).$promise.then(function (result) {
            $uibModalInstance.close({ access: { ip: self.data.accessToAdd.ip }, task: result.data.taskId, isNew: true });
            Toast.success($translate.instant("nasha_access_action_add_success", { accessIp: self.data.accessToAdd.ip }));
        }).catch(function () {
            $uibModalInstance.dismiss();
            Toast.error($translate.instant("nasha_access_action_add_failure", { accessIp: self.data.accessToAdd.ip }));
        }).finally(function () {
            self.loading = false;
        });
    };

    self.dismiss = function () {
        $uibModalInstance.dismiss();
    };

    self.loadAccessList();
});
