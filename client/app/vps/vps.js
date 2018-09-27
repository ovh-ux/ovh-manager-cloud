angular.module('managerApp').config(($stateProvider) => {
  const vpsHeader = {
    templateUrl: 'app/vps/vps-header.html',
    controller: 'VpsHeaderCtrl',
    controllerAs: '$ctrl',
  };

  $stateProvider
    .state('iaas.vps', {
      url: '/vps',
      templateUrl: 'app/vps/vps.html',
      abstract: true,
      translations: ['../common', '../vps'],
    })
    .state('iaas.vps.detail', {
      url: '/{serviceName}',
      redirectTo: 'iaas.vps.detail.dashboard',
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
    .state('iaas.vps.detail.backup-storage', {
      url: '/backup-storage',
      redirectTo: 'iaas.vps.detail.backup-storage.list',
      views: {
        vpsContent: {
          template: '<div ui-view="vpsBackupStorageContent"></div>',
        },
      },
    })
    .state('iaas.vps.detail.backup-storage.list', {
      url: '/',
      views: {
        vpsBackupStorageContent: {
          templateUrl: 'app/vps/backup-storage/vps-backup-storage.html',
          controller: 'VpsBackupStorageCtrl',
          controllerAs: '$ctrl',
        },
      },
    })
    .state('iaas.vps.detail.backup-storage.order', {
      url: '/order',
      views: {
        vpsBackupStorageContent: {
          templateUrl: 'app/vps/backup-storage/order/vps-order-backup-storage.html',
          controller: 'VpsOrderBackupStorageCtrl',
          controllerAs: '$ctrl',
        },
      },
    })
    .state('iaas.vps.detail.veeam', {
      url: '/veeam',
      redirectTo: 'iaas.vps.detail.veeam.list',
      views: {
        vpsContent: {
          template: '<div ui-view="vpsVeeamContent"></div>',
        },
      },
    })
    .state('iaas.vps.detail.veeam.list', {
      url: '/',
      views: {
        vpsVeeamContent: {
          templateUrl: 'app/vps/veeam/vps-veeam.html',
          controller: 'VpsVeeamCtrl',
          controllerAs: '$ctrl',
        },
      },
    })
    .state('iaas.vps.detail.veeam.order', {
      url: '/order',
      views: {
        vpsVeeamContent: {
          templateUrl: 'app/vps/veeam/order/vps-order-veeam.html',
          controller: 'VpsOrderVeeamCtrl',
          controllerAs: '$ctrl',
        },
      },
    })
    .state('iaas.vps.detail.additional-disk', {
      url: '/additional-disk',
      redirectTo: 'iaas.vps.detail.additional-disk.list',
      views: {
        vpsContent: {
          template: '<div ui-view="vpsAdditionalDiskContent"></div>',
        },
      },
    })
    .state('iaas.vps.detail.additional-disk.list', {
      url: '/',
      views: {
        vpsAdditionalDiskContent: {
          templateUrl: 'app/vps/additional-disk/vps-additional-disk.html',
          controller: 'VpsAdditionalDiskCtrl',
          controllerAs: '$ctrl',
        },
      },
    })
    .state('iaas.vps.detail.additional-disk.order', {
      url: '/order',
      views: {
        vpsAdditionalDiskContent: {
          templateUrl: 'app/vps/additional-disk/order/vps-order-additional-disk.html',
          controller: 'VpsOrderDiskCtrl',
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
    })
    .state('iaas.vps.detail.snapshot-order', {
      url: '/snapshot-order',
      views: {
        vpsHeader,
        vpsContent: {
          templateUrl: 'app/vps/snapshot-order/vps-snapshot-order.html',
          controller: 'VpsOrderSnapshotCtrl',
          controllerAs: '$ctrl',
        },
      },
    })
    .state('iaas.vps.detail.windows-order', {
      url: '/windows-order',
      views: {
        vpsHeader,
        vpsContent: {
          templateUrl: 'app/vps/windows-order/vps-windows-order.html',
          controller: 'VpsOrderWindowsCtrl',
          controllerAs: '$ctrl',
        },
      },
    })
    .state('iaas.vps.detail.upgrade', {
      url: '/upgrade',
      views: {
        vpsHeader,
        vpsContent: {
          templateUrl: 'app/vps/upgrade/vps-upgrade.html',
          controller: 'VpsUpgradeCtrl',
          controllerAs: '$ctrl',
        },
      },
    });
});
