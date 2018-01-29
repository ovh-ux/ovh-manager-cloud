angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("network.iplb.detail.vrack", {
            url: "/vrack",
            views: {
                iplbHeader: {
                    templateUrl: "app/iplb/header/iplb-dashboard-header.html",
                    controller: "IpLoadBalancerDashboardHeaderCtrl",
                    controllerAs: "ctrl"
                },
                iplbContent: {
                    templateUrl: "app/iplb/vrack/iplb-vrack.html",
                    controller: "IpLoadBalancerVrackCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "iplb", "iplb/vrack"]
        });
});
