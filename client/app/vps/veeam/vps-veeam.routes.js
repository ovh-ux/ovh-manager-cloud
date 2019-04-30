angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.vps.detail.veeam', {
    url: '/veeam',
    views: {
      vpsContent: {
        templateUrl: 'app/vps/veeam/vps-veeam.html',
        controller: 'VpsVeeamCtrl',
        controllerAs: '$ctrl',
      },
    },
  });
});
