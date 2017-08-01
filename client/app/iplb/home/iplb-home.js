angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("network.iplb.detail.home", {
            url: "/home",
            views: {
                iplbHeader: {
                    templateUrl: "app/iplb/header/iplb-dashboard-header.html",
                    controller: "IpLoadBalancerDashboardHeaderCtrl",
                    controllerAs: "ctrl"
                },
                iplbContent: {
                    templateUrl: "app/iplb/home/iplb-home.html",
                    controller: "IpLoadBalancerHomeCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "iplb", "iplb/home"]
        });
});
