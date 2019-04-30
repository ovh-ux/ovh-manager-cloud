angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.vps.detail.backup-storage', {
    url: '/backup-storage',
    views: {
      vpsContent: {
        templateUrl: 'app/vps/backup-storage/vps-backup-storage.html',
        controller: 'VpsBackupStorageCtrl',
        controllerAs: '$ctrl',
      },
    },
  });
});
