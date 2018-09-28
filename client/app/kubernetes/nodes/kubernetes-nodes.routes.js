angular.module('managerApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('paas.kube.nodes', {
        url: '/nodes',
        views: {
          kubernetesView: {
            component: 'kubernetesNodes',
          },
        },
        resolve: {
          serviceName: $transition$ => $transition$.params().serviceName,
        },
        translations: ['..'],
      });
  });
