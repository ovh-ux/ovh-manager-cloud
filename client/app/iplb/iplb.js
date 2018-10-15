angular.module('managerApp').config(($stateProvider) => {
  $stateProvider
    .state('network', {
      url: '/network',
      template: `
                <div data-ui-view="networkContainer"></div>
            `,
      abstract: true,
    })
    .state('network.iplb', {
      url: '/iplb',
      views: {
        networkContainer: {
          templateUrl: 'app/iplb/iplb.html',
        },
      },
      translations: ['../common', '.'],
    })
    .state('network.iplb.detail', {
      url: '/{serviceName}',
      views: {
        iplbContainer: {
          templateUrl: 'app/iplb/iplb-detail.html',
          controller: 'IpLoadBalancerDetailCtrl',
          controllerAs: 'ctrl',
        },
      },
      translations: ['../cloud', './configuration', '../vrack/modals'],
    });
});
