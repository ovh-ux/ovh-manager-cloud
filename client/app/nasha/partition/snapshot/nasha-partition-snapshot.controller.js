angular.module("managerApp").controller("NashaPartitionSnapshotCtrl", function ($stateParams, $scope, $uibModalInstance, $q, $translate, OvhApiDedicatedNasha, CloudMessage) {
    "use strict";
    var self = this;

    self.snapshotEnum = null;
    self.loading = false;
    self.data = {
        nashaId: $stateParams.nashaId,
        partition: $scope.$resolve.items
    };

    self.snapshots = {
        before: [],
        after: []
    };

    self.isSelectionChanged = function () {
        return !_.isEqual(self.snapshots.before, self.snapshots.after);
    };

    self.isScheduled = function (snapshot) {
        return _.indexOf(self.snapshots.after, snapshot) > -1;
    };

    self.changeSchedule = function (snapshot, checked) {
        if (checked) {
            self.snapshots.after.push(snapshot);
        } else {
            _.remove(self.snapshots.after, function (item) {
                return item === snapshot;
            });
        }
    };

    self.applyScheduleChanges = function () {
        self.loading = true;
        var promises = [];
        self.getAddSchedulesPromises(promises);
        self.getDeleteSchedulesPromises(promises);
        $q.all(promises)
            .then(function (tasks) {
                CloudMessage.success($translate.instant("nasha_snapshot_set_success"));
                $uibModalInstance.close({ partition: self.data.partition, tasks: tasks });
            }).catch(function () {
                CloudMessage.error($translate.instant("nasha_snapshot_set_success_fail"));
                $uibModalInstance.dismiss();
            }).finally(function () {
                self.loading = false;
            });
    };

    self.getAddSchedulesPromises = function (promises) {
        var addToSchedule = _.difference(self.snapshots.after, self.snapshots.before);
        _.forEach(addToSchedule, function (schedule) {
            promises.push(OvhApiDedicatedNasha.Partition().Snapshot().Lexi().add({
                serviceName: self.data.nashaId,
                partitionName: self.data.partition.partitionName
            }, {
                snapshotType: schedule
            }).$promise.then(function (result) {
                return result.data.taskId;
            }));
        });
    };

    self.getDeleteSchedulesPromises = function (promises) {
        var deleteFromSchedule = _.difference(self.snapshots.before, self.snapshots.after);
        _.forEach(deleteFromSchedule, function (schedule) {
            promises.push(OvhApiDedicatedNasha.Partition().Snapshot().Lexi().remove({
                serviceName: self.data.nashaId,
                partitionName: self.data.partition.partitionName,
                snapshotType: schedule
            }).$promise.then(function (result) {
                return result.data.taskId;
            }));
        });
    };

    self.dismiss = function () {
        $uibModalInstance.dismiss();
    };

    function init () {
        self.loading = true;
        self.schedule = {};

        OvhApiDedicatedNasha.Lexi().schema()
            .$promise.then(function (data) {
                self.snapshotEnum = data.models["dedicated.storage.SnapshotEnum"].enum;
            });

        OvhApiDedicatedNasha.Partition().Snapshot().Lexi().query({
            serviceName: self.data.nashaId,
            partitionName: self.data.partition.partitionName
        }).$promise.then(function (data) {
            angular.copy(data, self.snapshots.before);
            angular.copy(data, self.snapshots.after);
        }).catch(function () {
            CloudMessage.error($translate.instant("nasha_snapshot_loading_error"));
        }).finally(function () {
            self.loading = false;
        });
    }

    init();
});
