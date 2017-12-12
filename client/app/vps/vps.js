angular.module("managerApp").config($stateProvider => {
    const vpsHeader =
        {
            templateUrl: "app/vps/vps-header.html",
            controller: "VpsHeaderCtrl",
            controllerAs: "$ctrl"
        };

    $stateProvider
        .state("iaas.vps", {
            url: "/vps",
            templateUrl: "app/vps/vps.html",
            "abstract": true,
            translations: ["common", "vps"]
        })
        .state("iaas.vps.detail", {
            url: "/{serviceName}",
            params: {
                displayName: null
            },
            redirectTo: "iaas.vps.detail.dashboard",
            views: {
                vpsHeader,
                vpsContainer: {
                    templateUrl: "app/vps/vps-detail.html",
                    controller: "VpsDetailCtrl",
                    controllerAs: "$ctrl"
                }
            }
        })
        .state("iaas.vps.detail.dashboard", {
            url: "/dashboard",
            views: {
                vpsContent: {
                    templateUrl: "app/vps/dashboard/vps-dashboard.html",
                    controller: "VpsDashboardCtrl",
                    controllerAs: "$ctrl"
                }
            }
        })
        .state("iaas.vps.detail.secondary-dns", {
            url: "/secondary-dns",
            views: {
                vpsContent: {
                    templateUrl: "app/vps/secondary-dns/vps-secondary-dns.html",
                    controller: "VpsSecondaryDnsCtrl",
                    controllerAs: "$ctrl"
                }
            }
        })
        .state("iaas.vps.detail.backup-storage", {
            url: "/backup-storage",
            views: {
                vpsContent: {
                    templateUrl: "app/vps/backup-storage/vps-backup-storage.html",
                    controller: "VpsBackupStorageCtrl",
                    controllerAs: "$ctrl"
                }
            }
        })
        .state("iaas.vps.detail.veeam", {
            url: "/veeam",
            views: {
                vpsContent: {
                    templateUrl: "app/vps/veeam/vps-veeam.html",
                    controller: "VpsVeeamCtrl",
                    controllerAs: "$ctrl"
                }
            }
        })
        .state("iaas.vps.detail.additional-disk", {
            url: "/additional-disk",
            views: {
                vpsContent: {
                    templateUrl: "app/vps/additional-disk/vps-additional-disk.html",
                    controller: "VpsAdditionalDiskCtrl",
                    controllerAs: "$ctrl"
                }
            }
        })
        .state("iaas.vps.detail.monitoring", {
            url: "/monitoring",
            views: {
                vpsContent: {
                    templateUrl: "app/vps/monitoring/vps-monitoring.html",
                    controller: "VpsMonitoringCtrl",
                    controllerAs: "$ctrl"
                }
            }
        })
        .state("iaas.vps.detail.snapshot-order", {
            url: "/snapshot-order",
            views: {
                vpsHeader,
                vpsContent: {
                    templateUrl: "app/vps/snapshot-order/vps-snapshot-order.html",
                    controller: "VpsOrderSnapshotCtrl",
                    controllerAs: "$ctrl"
                }
            }
        })
        .state("iaas.vps.detail.upgrade", {
            url: "/upgrade",
            views: {
                vpsHeader,
                vpsContent: {
                    templateUrl: "app/vps/upgrade/vps-upgrade.html",
                    controller: "VpsUpgradeCtrl",
                    controllerAs: "$ctrl"
                }
            }
        });
});
