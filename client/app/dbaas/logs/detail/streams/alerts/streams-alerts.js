angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.streams.detail.alerts", {
            url: "/alerts",
            redirectTo: "dbaas.logs.detail.streams.detail.alerts.home",
            views: {
                logsStreamsDetail: {
                    template: `<div ui-view="logsAlerts"></div>`,
                    controller: "LogsStreamsAlertsCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/streams"]
        })
        .state("dbaas.logs.detail.streams.detail.alerts.home", {
            url: "/",
            views: {
                logsAlerts: {
                    templateUrl: "app/dbaas/logs/detail/streams/alerts/home/alerts-home.html",
                    controller: "LogsStreamsAlertsHomeCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/streams"]
        })
        .state("dbaas.logs.detail.streams.detail.alerts.add", {
            url: "/add",
            views: {
                logsAlerts: {
                    templateUrl: "app/dbaas/logs/detail/streams/alerts/add/alerts-add.html",
                    controller: "LogsStreamsAlertsAddCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/streams"]
        });
});
