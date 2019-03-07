export const vpsHeader = {
  templateUrl: 'app/vps/vps-header.html',
  controller: 'VpsHeaderCtrl',
  controllerAs: '$ctrl',
};

export default { vpsHeader };

angular.module('managerApp').config(($stateProvider) => {
  $stateProvider
    .state('iaas.vps', {
      url: '/vps',
      templateUrl: 'app/vps/vps.html',
      abstract: true,
      translations: {
        value: ['../common', '../vps'],
        format: 'json',
      },
    })
    .state('iaas.vps.detail', {
      url: '/{serviceName}',
      redirectTo: 'iaas.vps.detail.dashboard',
      resolve: {
        stateVps: /* @ngInject */ ($transition$, $q, OvhApiVps) => OvhApiVps.v6().get({
          serviceName: _.get($transition$.params(), 'serviceName'),
        }).$promise
          .then(stateVps => OvhApiVps.v6().version({
            serviceName: _.get($transition$.params(), 'serviceName'),
          }).$promise.then((response) => {
            _.set(stateVps, 'isFullAgora', response.version === 2);
            return stateVps;
          }))
          .catch((error) => {
            if (error.status === 404) {
              return $q.reject(_.merge({ code: 'LOADING_STATE_ERROR' }, error));
            }
            return true;
          }),
      },
      views: {
        vpsHeader,
        vpsContainer: {
          templateUrl: 'app/vps/vps-detail.html',
          controller: 'VpsDetailCtrl',
          controllerAs: '$ctrl',
        },
      },
    })
    .state('iaas.vps.detail.dashboard', {
      url: '/dashboard',
      views: {
        vpsContent: {
          templateUrl: 'app/vps/dashboard/vps-dashboard.html',
          controller: 'VpsDashboardCtrl',
          controllerAs: '$ctrl',
        },
      },
    })
    .state('iaas.vps.detail.secondary-dns', {
      url: '/secondary-dns',
      views: {
        vpsContent: {
          templateUrl: 'app/vps/secondary-dns/vps-secondary-dns.html',
          controller: 'VpsSecondaryDnsCtrl',
          controllerAs: '$ctrl',
        },
      },
    })
    .state('iaas.vps.detail.cloud-database', {
      url: '/cloud-database',
      redirectTo: 'iaas.vps.detail.cloud-database.list',
      views: {
        vpsContent: {
          template: '<div ui-view="vpsCloudDatabaseContent"></div>',
        },
      },
      resolve: {
        shouldNotBeCA: [
          '$q',
          'CucFeatureAvailabilityService',
          ($q, CucFeatureAvailabilityService) => CucFeatureAvailabilityService
            .hasFeaturePromise('VPS', 'cloudDatabase')
            .then(hasFeature => (hasFeature ? $q.when() : $q.reject('Not authorized'))),
        ],
      },
    })
    .state('iaas.vps.detail.cloud-database.list', {
      url: '/',
      views: {
        vpsCloudDatabaseContent: {
          templateUrl: 'app/vps/cloud-database/vps-cloud-database.html',
          controller: 'VpsCloudDatabaseCtrl',
          controllerAs: '$ctrl',
        },
      },
    })
    .state('iaas.vps.detail.cloud-database.order', {
      url: '/order',
      views: {
        vpsCloudDatabaseContent: {
          templateUrl: 'app/vps/cloud-database/order/vps-cloud-database-order.html',
          controller: 'VpsCloudDatabaseOrderCtrl',
          controllerAs: '$ctrl',
        },
      },
    })
    .state('iaas.vps.detail.monitoring', {
      url: '/monitoring',
      views: {
        vpsContent: {
          templateUrl: 'app/vps/monitoring/vps-monitoring.html',
          controller: 'VpsMonitoringCtrl',
          controllerAs: '$ctrl',
        },
      },
    });
});
