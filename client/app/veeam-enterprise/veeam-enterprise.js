angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("paas.veeam-enterprise", {
            "abstract": true,
            url: "/veeam-enterprise/{serviceName}",
            templateUrl: "app/veeam-enterprise/veeam-enterprise.html",
            controller: "VeeamEnterpriseCtrl",
            controllerAs: "VeeamEnterpriseCtrl",
            translations: ["common", "veeam-enterprise"]
        })
        .state("paas.veeam-enterprise.dashboard", {
            url: "/dashboard",
            views: {
                veeamEnterpriseContent: {
                    templateUrl: "app/veeam-enterprise/dashboard/veeam-enterprise-dashboard.html",
                    controller: "VeeamEnterpriseDashboardCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "veeam-enterprise", "veeam-enterprise/dashboard"]
        });
});
