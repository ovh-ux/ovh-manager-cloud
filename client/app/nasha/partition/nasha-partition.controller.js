angular.module("managerApp").controller("PartitionCtrl", function ($state, $rootScope, $scope, $uibModal, $q, $translate, $stateParams, OvhApiDedicatedNasha, Poller, CloudMessage) {
    "use strict";

    var self = this;

    self.trackedTaskStatus = ["todo", "doing"];
    self.trackedTaskOperations = [
        "clusterLeclercPartitionAdd",
        "clusterLeclercPartitionDelete",
        "clusterLeclercPartitionUpdate",
        "clusterLeclercSnapshotUpdate",
        "clusterLeclercCustomSnapCreate",
        "clusterLeclercZfsOptions"
    ];

    self.data = {
        partitionsTasks: {}, // object that contain tasks for each partition e.g. [{partitionName : "partition123" , tasks: [65564,78329]}, {partitionName : "partitionABC" , tasks: [9998,9999]}]
        nasha: null,
        table: {
            partitionIds: [],
            partitionsInCreation: [],
            currentPartitions: [],
            refresh: false
        }
    };

    self.loaders = {
        table: false
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

        modal.result.then(function () {
            initTasks();
        });
    };

    self.load = function (resetCache) {
        self.loaders.table = true;
        $q.all([
            initNasha(),
            initPartitions()
        ]).then(function () {
            return initTasks();
        }).then(function () {
            if (resetCache) {
                self.data.table.refresh = !self.data.table.refresh;
            }
        }).catch(function (err) {
            CloudMessage.error($translate.instant("nasha_partitions_no_data_error"));
            return $q.reject(err);
        }).finally(function () {
            self.loaders.table = false;
        });
    };

    self.hasTaskInProgress = function (partition) {
        return _.any(self.data.partitionsTasks[partition.partitionName]);
    };

    self.updatePartition = function (partition) {
        return self.getPartition(partition.partitionName)
            .then(function (updatedPartition) {
                partition.size = updatedPartition.size;
            }).catch(function (data) {
                // partition is not found, probably deleted
                if (data.status === 404) {
                    _.remove(self.data.table.partitionIds, function (item) {
                        return item ===  partition.partitionName;
                    });
                } else {
                    return $q.reject(data);
                }
            });
    };

    function initNasha () {
        return OvhApiDedicatedNasha.Aapi().get({ serviceName: $stateParams.nashaId }).$promise.then(function (nasha) {
            self.data.nasha = nasha;
        });
    }

    function initPartitions (resetCache) {
        self.data.table.partitionsInCreation = [];
        if (resetCache) {
            OvhApiDedicatedNasha.Aapi().resetAllCache();
        }

        return OvhApiDedicatedNasha.Aapi().partitions({ serviceName: $stateParams.nashaId }).$promise.then(function (partitions) {
            self.data.table.partitionIds = self.data.table.partitions = _.map(partitions, function (partition) {
                return partition.partitionName;
            });

            self.data.table.partitions = _.map(partitions, function (partition) {
                _.forEach(partition.use, function (part, key) {
                    part.name = $translate.instant("nasha_storage_usage_type_" + key);
                });
                return partition;
            });
        });
    }

    function initTasks () {
        OvhApiDedicatedNasha.Task().Lexi().resetCache();

        var tasksPromises = _.map(self.trackedTaskStatus, function (status) {
            return getTasksPromise(status);
        });

        return $q.allSettled(tasksPromises).then(function (data) {
            return _.flatten(data);
        }).then(function (taskIds) {
            var taskPromises = _.map(taskIds, function (taskId) {
                return OvhApiDedicatedNasha.Task().Lexi().get({ serviceName: $stateParams.nashaId, taskId: taskId }).$promise;
            });

            return $q.allSettled(taskPromises);
        }).then(function (taskObjects) {
            //We don't wipe self.data.partitionsTasks right away because we don't want the spinners to disapear while we reload.
            var partitionsTasksAccumulator = {};
            self.data.table.partitionsInCreation = [];

            _.forEach(taskObjects, function (taskObject) {
                buildPartitionsInCreation(taskObject, self.data.table.partitionsInCreation);
                buildPartitionsTasks(taskObject, partitionsTasksAccumulator);
                pollPartitionTask(taskObject);
            });

            self.data.partitionsTasks = partitionsTasksAccumulator;
            return $q.when(taskObjects);
        });
    }

    function buildPartitionsInCreation (task, accumulator) {
        if (task.operation === "clusterLeclercPartitionAdd") {
            var partition = _.find(self.data.table.partitionIds, function (partitionId) {
                return task.partitionName === partitionId;
            });

            if (!partition) {
                self.data.table.partitionIds.unshift(task.partitionName);
                self.data.table.partitions.unshift({ partitionName: task.partitionName });
            }

            accumulator.push({ partitionName: task.partitionName });
        }
    }

    function buildPartitionsTasks (task, accumulator) {
        if (_.includes(self.trackedTaskOperations, task.operation)) {
            if (accumulator[task.partitionName] === undefined) {
                accumulator[task.partitionName] = [task];
            }
        }
    }

    function pollPartitionTask (task) {
        launchPolling(task.taskId)
            .finally(function () {
                initPartitions(true).then(function () {
                    var taskIndex = _.findIndex(self.data.partitionsTasks[task.partitionName], function (partitionTask) {
                        return task.taskId === partitionTask.taskId;
                    });

                    if (taskIndex > -1) {
                        self.data.partitionsTasks[task.partitionName].splice(taskIndex, 1);
                    }
                }).catch(function (err) {
                    CloudMessage.error($translate.instant("nasha_partitions_no_data_error"));
                    return $q.reject(err);
                });
            });
    }

    function getTasksPromise (status) {
        return OvhApiDedicatedNasha.Task().Lexi().query({ serviceName: $stateParams.nashaId, status: status }).$promise;
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
                namespace: "nasha.partition"
            }
        );
    }

    $scope.$on("$destroy", function () {
        Poller.kill({ namespace: "nasha.partition" });
    });

    self.load();
});
