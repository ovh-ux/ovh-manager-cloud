

angular.module('managerApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('paas.nasha.nasha-partitions', {
        url: '/partitions',
        views: {
          nashaPartition: {
            templateUrl: 'app/nasha/partition/nasha-partition.html',
            controller: 'PartitionCtrl',
            controllerAs: 'PartitionCtrl',
          },
        },
        onEnter: CloudMessage => CloudMessage.flushMessages(),
        translations: [
          '../../common',
          '.',
          './add',
          './delete',
          './update',
          './snapshot',
          './custom-snapshot',
          './zfs-options',
        ],
      });
  });
