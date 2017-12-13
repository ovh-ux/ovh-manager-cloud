angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.dashboards", {
            url: "/dashboards",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/dashboards/logs-dashboards.html",
                    controller: "LogsDashboardsCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "logs", "logs/dashboards"]
        });
});
