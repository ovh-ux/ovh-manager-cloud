angular.module('managerApp').controller('PartitionCtrl', function PartitionCtrl($state, $rootScope,
  $scope, $uibModal, $q, $translate, $stateParams, OvhApiDedicatedNasha, Poller, CucCloudMessage) {
  const self = this;

  self.trackedTaskStatus = ['todo', 'doing'];
  self.trackedTaskOperations = [
    'clusterLeclercPartitionAdd',
    'clusterLeclercPartitionDelete',
    'clusterLeclercPartitionUpdate',
    'clusterLeclercSnapshotUpdate',
    'clusterLeclercCustomSnapCreate',
    'clusterLeclercZfsOptions',
  ];

  // object that contain tasks for each partition
  // e.g. [
  //   {
  //     partitionName: "partition123",
  //     tasks: [65564, 78329]
  //   }, {
  //     partitionName: "partitionABC",
  //     tasks: [9998,9999]
  //   },
  // ]
  self.data = {
    partitionsTasks: {},
    nasha: null,
    table: {
      partitionIds: [],
      partitionsInCreation: [],
      currentPartitions: [],
      refresh: false,
    },
  };

  self.loaders = {
    table: false,
  };

  function getTasksPromise(status) {
    return OvhApiDedicatedNasha.Task().v6()
      .query({ serviceName: $stateParams.nashaId, status }).$promise;
  }

  function buildPartitionsInCreation(task, accumulator) {
    if (task.operation === 'clusterLeclercPartitionAdd') {
      const partition = _.find(
        self.data.table.partitionIds,
        partitionId => task.partitionName === partitionId,
      );

      if (!partition) {
        self.data.table.partitionIds.unshift(task.partitionName);
        self.data.table.partitions.unshift({ partitionName: task.partitionName });
      }

      accumulator.push({ partitionName: task.partitionName });
    }
  }

  function buildPartitionsTasks(task, accumulator) {
    if (_.includes(self.trackedTaskOperations, task.operation)) {
      if (accumulator[task.partitionName] === undefined) {
        accumulator[task.partitionName] = [task];
      }
    }
  }

  function launchPolling(taskId) {
    return Poller.poll(`/dedicated/nasha/${self.data.nasha.serviceName}/task/${taskId}`,
      null,
      {

        successRule(task) {
          return task.status === 'done';
        },
        errorRule(task) {
          return ['doing', 'todo', 'done'].indexOf(task.status) === -1;
        },
        namespace: 'nasha.partition',
      });
  }

  function initPartitions(resetCache) {
    self.data.table.partitionsInCreation = [];
    if (resetCache) {
      OvhApiDedicatedNasha.Aapi().resetAllCache();
    }

    return OvhApiDedicatedNasha.Aapi()
      .partitions({ serviceName: $stateParams.nashaId }).$promise
      .then((partitions) => {
        self.data.table.partitions = _.map(partitions, partition => partition.partitionName);
        self.data.table.partitionIds = self.data.table.partitions;

        self.data.table.partitions = _.map(partitions, (partition) => {
          _.forEach(partition.use, (part, key) => {
            _.set(part, 'name', $translate.instant(`nasha_storage_usage_type_${key}`));
          });
          return partition;
        });
      });
  }

  function pollPartitionTask(task) {
    launchPolling(task.taskId)
      .finally(() => {
        initPartitions(true).then(() => {
          const taskIndex = _.findIndex(
            self.data.partitionsTasks[task.partitionName],
            partitionTask => task.taskId === partitionTask.taskId,
          );

          if (taskIndex > -1) {
            self.data.partitionsTasks[task.partitionName].splice(taskIndex, 1);
          }
        }).catch((err) => {
          CucCloudMessage.error($translate.instant('nasha_partitions_no_data_error'));
          return $q.reject(err);
        });
      });
  }

  function initTasks() {
    OvhApiDedicatedNasha.Task().v6().resetCache();

    const tasksPromises = _.map(self.trackedTaskStatus, status => getTasksPromise(status));

    return $q.allSettled(tasksPromises).then(data => _.flatten(data)).then((taskIds) => {
      const taskPromises = _.map(taskIds, taskId => OvhApiDedicatedNasha.Task().v6()
        .get({ serviceName: $stateParams.nashaId, taskId }).$promise);

      return $q.allSettled(taskPromises);
    }).then((taskObjects) => {
      // We don't wipe self.data.partitionsTasks right away because we don't want the spinners
      // to disapear while we reload.
      const partitionsTasksAccumulator = {};
      self.data.table.partitionsInCreation = [];

      _.forEach(taskObjects, (taskObject) => {
        buildPartitionsInCreation(taskObject, self.data.table.partitionsInCreation);
        buildPartitionsTasks(taskObject, partitionsTasksAccumulator);
        pollPartitionTask(taskObject);
      });

      self.data.partitionsTasks = partitionsTasksAccumulator;
      return $q.when(taskObjects);
    });
  }

  self.openModal = function (template, controller, params) {
    const modal = $uibModal.open({
      windowTopClass: 'cui-modal',
      templateUrl: template,
      controller,
      controllerAs: controller,
      resolve: {
        items() {
          return params;
        },
      },
    });

    modal.result.then(() => {
      initTasks();
    });
  };

  function initNasha() {
    return OvhApiDedicatedNasha.Aapi()
      .get({ serviceName: $stateParams.nashaId }).$promise
      .then((nasha) => {
        self.data.nasha = nasha;
      });
  }

  self.load = function (resetCache) {
    self.loaders.table = true;
    $q.all([
      initNasha(),
      initPartitions(),
    ]).then(() => initTasks()).then(() => {
      if (resetCache) {
        self.data.table.refresh = !self.data.table.refresh;
      }
    }).catch((err) => {
      CucCloudMessage.error($translate.instant('nasha_partitions_no_data_error'));
      return $q.reject(err);
    })
      .finally(() => {
        self.loaders.table = false;
      });
  };

  self.hasTaskInProgress = function (partition) {
    return _.any(self.data.partitionsTasks[partition.partitionName]);
  };

  self.updatePartition = function (partition) {
    return self.getPartition(partition.partitionName)
      .then((updatedPartition) => {
        _.set(partition, 'size', updatedPartition.size);
      }).catch((data) => {
        // partition is not found, probably deleted
        if (data.status === 404) {
          _.remove(self.data.table.partitionIds, item => item === partition.partitionName);
        } else {
          return $q.reject(data);
        }
        return null;
      });
  };

  self.goToNashaPartitionAccess = function (partitionName) {
    $state.go('paas.nasha.nasha-partition-access', {
      partitionName,
    });
  };

  $scope.$on('$destroy', () => {
    Poller.kill({ namespace: 'nasha.partition' });
  });

  self.load();
});
