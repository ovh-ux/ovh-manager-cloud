import component from './vps-cloud-database.component';

export default /* @ngInject */($stateProvider) => {
  $stateProvider
    .state('iaas.vps.detail.cloud-database', {
      resolve: {
        shouldNotBeCA: /* @ngInject */ (
          $q,
          CucFeatureAvailabilityService,
        ) => CucFeatureAvailabilityService
          .hasFeaturePromise('VPS', 'cloudDatabase')
          .then(hasFeature => (hasFeature ? $q.when() : $q.reject('Not authorized'))),
      },
      url: '/cloud-database',
      views: {
        'vpsContent@iaas.vps.detail': {
          component: component.name,
        },
      },
    });
};
