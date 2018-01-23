angular.module("managerApp").controller("NashaPartitionAccessCtrl", function ($scope, $state, $stateParams, $translate, $uibModal, $q, OvhApiDedicatedNasha, Poller, CloudMessage) {
    "use strict";

    var self = this;

    self.data = {
        nasha: {},
        partition: {},
        addAccessInProgress: [],
        taskForAccess: []
    };

    self.table = {
        accessIps: [],
        refresh: false
    };

    self.loaders = {
        table: false
    };

    self.load = function (resetCache) {
        self.loaders.table = true;
        if (resetCache) {
            OvhApiDedicatedNasha.Partition().Access().Lexi().resetCache();
        }
        $q.all({
            nasha: OvhApiDedicatedNasha.Lexi().get({ serviceName: $stateParams.nashaId }).$promise,
            partition: OvhApiDedicatedNasha.Partition().Lexi().get({ serviceName: $stateParams.nashaId, partitionName: $stateParams.partitionName }).$promise,
            accesses: OvhApiDedicatedNasha.Partition().Access().Lexi().query({ serviceName: $stateParams.nashaId, partitionName: $stateParams.partitionName }).$promise
        }).then(function (data) {
            self.data.nasha = data.nasha;
            self.data.partition = data.partition;
            self.table.accessIps = data.accesses.map(ip => ({
                ip
            }));
            if (resetCache) {
                self.table.refresh = !self.table.refresh;
            }
        }).catch(function (err) {
            CloudMessage.error($translate.instant("nasha_partitions_access_no_data_error"));
            return $q.reject(err);
        }).finally(function () {
            self.loaders.table = false;
        });
    };

    self.getAccessForIp = function (accessIp) {
        // If the access is being added, return the local data
        var accessAddInProgress = _.find(self.data.addAccessInProgress, function (item) {
            return item.ip === accessIp;
        });
        if (accessAddInProgress) {
            return accessAddInProgress;
        }

        // if not we get the details form the api
        return OvhApiDedicatedNasha.Partition().Access().Lexi().get({
            serviceName: self.data.nasha.serviceName,
            partitionName: self.data.partition.partitionName,
            ip: accessIp
        }).$promise.then(function (data) {
            return data;
        });
    };

    self.transformItem = function (access) {
        return self.getAccessForIp(access.ip);
    };

    self.removeAccess = function (access) {
        self.openModal("app/nasha/partition/access/delete/nasha-partition-access-delete.html", "NashaPartitionAccessDeleteCtrl", {
            serviceName: self.data.nasha.serviceName,
            access: access,
            partitionName: self.data.partition.partitionName
        });
    };

    self.addAccess = function () {
        self.openModal("app/nasha/partition/access/add/nasha-partition-access-add.html", "NashaPartitionAccessAddCtrl", {
            serviceName: self.data.nasha.serviceName,
            partition: self.data.partition
        });
    };

    self.openModal = function (template, controller, params) {
        var modal = $uibModal.open({
            templateUrl: template,
            controller: controller,
            controllerAs: controller,
            resolve: {
                items: function () {
                    return params;
                }
            }
        });

        modal.result.then(function (data) {
            if (data.isNew) {
                self.table.accessIps.push(data.access);
                self.data.addAccessInProgress.push(data.access);
            }
            self.data.taskForAccess.push({ task: data.task, access: data.access });
            pollTasksForAccess(data.access, data.task);
        });
    };

    self.updateAccess = function () {
        self.load(true);
    };

    self.hasTaskInProgress = function (access) {
        return _.some(self.data.taskForAccess, { access: access });
    };

    /*======================================
     =                Polling              =
     ======================================*/

    function pollTasksForAccess (access, taskId) {
        launchPolling(taskId)
            .finally(function () {
                // Remove from the polling list
                _.remove(self.data.taskForAccess, function (item) {
                    return item.task === taskId;
                });

                // If the partition was in creation, remove it from the creation list
                _.remove(self.data.addAccessInProgress, function (item) {
                    return item.ip === access.ip;
                });

                self.updateAccess(access);
            });
    }

    function launchPolling (taskId) {
        return Poller.poll("/dedicated/nasha/" + self.data.nasha.serviceName + "/task/" + taskId,
            null,
            {
                successRule: function (task) {
                    return task.status === "done";
                },
                errorRule: function (task) {
                    return ["doing", "todo", "done"].indexOf(task.status) === -1;
                },
                namespace: "nasha.access"
            }
        );
    }

    $scope.$on("$destroy", function () {
        Poller.kill({ namespace: "nasha.access" });
    });

    self.load();
});
