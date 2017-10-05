angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("network.iplb.detail.configuration", {
            url: "/configuration",
            views: {
                iplbHeader: {
                    templateUrl: "app/iplb/header/iplb-dashboard-header.html",
                    controller: "IpLoadBalancerDashboardHeaderCtrl",
                    controllerAs: "ctrl"
                },
                iplbContent: {
                    templateUrl: "app/iplb/configuration/iplb-configuration.html",
                    controller: "IpLoadBalancerConfigurationCtrl",
                    controllerAs: "ctrl"
                }
            },
            onEnter: CloudMessage => CloudMessage.flushMessages(),
            translations: ["common", "iplb", "iplb/configuration"]
        });
});
