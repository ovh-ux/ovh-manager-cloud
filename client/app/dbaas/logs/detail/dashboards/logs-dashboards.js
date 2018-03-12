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
            translations: ["common", "dbaas/logs", "dbaas/logs/dashboards", "dbaas/logs/detail/options", "dbaas/logs/detail/options/upgradequotalink", "dbaas/logs/detail/streams"]
        })
        .state("dbaas.logs.detail.dashboards.add", {
            url: "/add",
            views: {
                logsDashboardsCrud: {
                    controller: "LogsDashboardsCrudModalCtrl",
                    controllerAs: "ctrl"
                }
            }
        })
        .state("dbaas.logs.detail.dashboards.edit", {
            url: "/:dashboardId",
            views: {
                logsDashboardsCrud: {
                    controller: "LogsDashboardsCrudModalCtrl",
                    controllerAs: "ctrl"
                }
            }
        })
        .state("dbaas.logs.detail.dashboards.duplicate", {
            url: "/:dashboardId/duplicate",
            params: {
                isDuplicate: false,
                dashboardName: null
            },
            views: {
                logsDashboardsCrud: {
                    controller: "LogsDashboardsCrudModalCtrl",
                    controllerAs: "ctrl"
                }
            }
        });
});
