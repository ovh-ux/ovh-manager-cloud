angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("network.iplb.detail.zone", {
            url: "/zone",
            views: {
                iplbHeader: {
                    templateUrl: "app/iplb/header/iplb-dashboard-header.html",
                    controller: "IpLoadBalancerDashboardHeaderCtrl",
                    controllerAs: "ctrl"
                },
                iplbContent: {
                    template: `
                        <div ui-view="iplbZone"></div>
                    `
                }
            },
            "abstract": true,
            translations: ["common", "iplb", "iplb/zone"]
        })
        .state("network.iplb.detail.zone.add", {
            url: "/add",
            views: {
                iplbZone: {
                    templateUrl: "app/iplb/zone/iplb-zone-add.html",
                    controller: "IpLoadBalancerZoneAddCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "iplb", "iplb/zone"]
        })
        .state("network.iplb.detail.zone.delete", {
            url: "/delete",
            views: {
                iplbZone: {
                    templateUrl: "app/iplb/zone/iplb-zone-delete.html",
                    controller: "IpLoadBalancerZoneDeleteCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "iplb", "iplb/zone"]
        });
});
