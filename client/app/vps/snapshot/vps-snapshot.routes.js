import template from './vps-snapshot.html';

angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.vps.detail.snapshot', {
    url: '/snapshot',
    abstract: true,
    views: {
      vpsContent: {
        template,
      },
    },
  });
});
