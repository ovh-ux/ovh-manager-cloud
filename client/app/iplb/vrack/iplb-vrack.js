angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("network.iplb.detail.vrack", {
            url: "/vrack",
            redirectTo: "network.iplb.detail.vrack.home",
            views: {
                iplbHeader: {
                    templateUrl: "app/iplb/header/iplb-dashboard-header.html",
                    controller: "IpLoadBalancerDashboardHeaderCtrl",
                    controllerAs: "ctrl"
                },
                iplbContent: {
                    template: '<div ui-view="iplbVrack"><div>'
                }
            },
            translations: ["common", "iplb", "iplb/frontends"]
        })
        .state("network.iplb.detail.vrack.home", {
            url: "/",
            views: {
                iplbVrack: {
                    templateUrl: "app/iplb/vrack/iplb-vrack.html",
                    controller: "IpLoadBalancerVrackCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "iplb", "iplb/vrack"]
        })
        .state("network.iplb.detail.vrack.add", {
            url: "/add",
            views: {
                iplbVrack: {
                    templateUrl: "app/iplb/vrack/iplb-vrack-edit.html",
                    controller: "IpLoadBalancerVrackEditCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "iplb", "iplb/frontends"]
        })
        .state("network.iplb.detail.vrack.edit", {
            url: "/:vrackId",
            views: {
                iplbVrack: {
                    templateUrl: "app/iplb/vrack/iplb-vrack-edit.html",
                    controller: "IpLoadBalancerVrackEditCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "iplb", "iplb/frontends"]
        });
});
