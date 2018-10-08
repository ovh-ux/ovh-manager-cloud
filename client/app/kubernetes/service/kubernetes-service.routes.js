angular.module('managerApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('paas.kube.service', {
        url: '/service',
        views: {
          kubernetesView: {
            component: 'kubernetesService',
          },
        },
        resolve: {
          serviceName: $stateParams => $stateParams.serviceName,
        },
        translations: ['..'],
      });
  });
