angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.vps.detail.additional-disk', {
    url: '/additional-disk',
    views: {
      vpsContent: {
        templateUrl: 'app/vps/additional-disk/vps-additional-disk.html',
        controller: 'VpsAdditionalDiskCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: {
      value: ['./'],
      format: 'json',
    },
  });
});
