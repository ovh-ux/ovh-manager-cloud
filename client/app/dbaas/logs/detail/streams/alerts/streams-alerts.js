angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.streams.alerts", {
            url: "/:streamId/alerts",
            redirectTo: "dbaas.logs.detail.streams.alerts.home",
            views: {
                logsStreams: {
                    template: `<div ui-view="logsAlerts"></div>`,
                    controller: "StreamsAlertsCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/streams"]
        })
        .state("dbaas.logs.detail.streams.alerts.home", {
            url: "/",
            views: {
                logsAlerts: {
                    templateUrl: "app/dbaas/logs/detail/streams/alerts/home/alerts-home.html",
                    controller: "AlertsHomeCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/streams"]
        })
        .state("dbaas.logs.detail.streams.alerts.add", {
            url: "/add/:type",
            views: {
                logsAlerts: {
                    templateUrl: "app/dbaas/logs/detail/streams/alerts/add/alerts-add.html",
                    controller: "AlertsAddCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/streams"]
        });
});
