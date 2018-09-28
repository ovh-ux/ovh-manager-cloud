angular.module('managerApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('paas.kube.containers', {
        url: '/containers',
        views: {
          kubernetesView: {
            component: 'kubernetesContainers',
          },
        },
        resolve: {
          serviceName: $transition$ => $transition$.params().serviceName,
        },
        translations: ['..'],
      });
  });
