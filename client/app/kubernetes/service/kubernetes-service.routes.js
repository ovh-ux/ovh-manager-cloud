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
        translations: {
          value: ['..'],
          format: 'json',
        },
      })
      .state('paas.kube.service.reset', {
        url: '/reset',
        views: {
          kubernetesResetView: {
            controller: 'kubernetesResetModalCtrl',
            controllerAs: 'ctrl',
          },
        },
        translations: {
          value: ['..'],
          format: 'json',
        },
      })
      .state('paas.kube.service.rename', {
        url: '/rename',
        views: {
          kubernetesRenameView: {
            controller: 'kubernetesRenameModalCtrl',
            controllerAs: 'ctrl',
          },
        },
        translations: {
          value: ['..'],
          format: 'json',
        },
      });
  });
