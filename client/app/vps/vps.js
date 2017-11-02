angular.module("managerApp").config($stateProvider => {
    const vpsHeader =
        {
            templateUrl: "app/vps/vps-header.html",
            controller: "VpsDetailCtrl",
            controllerAs: "VpsDetailCtrl"
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
            views: {
                vpsContainer: {
                    templateUrl: "app/vps/vps-detail.html",
                    controller: "VpsDetailCtrl",
                    controllerAs: "VpsDetailCtrl"
                }
            }
        })
        .state("iaas.vps.detail.dashboard", {
            url: "/dashboard",
            views: {
                vpsHeader,
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
                vpsHeader,
                vpsContent: {
                    templateUrl: "app/vps/secondary-dns/vps-secondary-dns.html",
                    controller: "VpsSecondaryDnsCtrl",
                    controllerAs: "$ctrl"
                }
            }
        });
});