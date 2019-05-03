import template from './vps-windows.html';

angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.vps.detail.windows', {
    url: '/windows',
    abstract: true,
    views: {
      vpsContent: {
        template,
      },
    },
  });
});
