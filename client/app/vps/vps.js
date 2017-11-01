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
        });
}).constant("additionalDisk.capacities", [
    {
        option: "additionalDisk50",
        size: 50
    },
    {
        option: "additionalDisk100",
        size: 100
    },
    {
        option: "additionalDisk200",
        size: 200
    },
    {
        option: "additionalDisk500",
        size: 500
    }
]).constant("additionalDisk.hasNoOption",
    "Does not have option"
).constant("STOP_NOTIFICATION_USER_PREF", {
    autoRenew: "VPS_AUTORENEW_STOP_BOTHER",
    ipV6: "VPS_IPV6_STOP_NOTIFICATION"
});