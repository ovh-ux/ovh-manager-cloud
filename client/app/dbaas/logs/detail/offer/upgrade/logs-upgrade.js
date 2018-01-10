angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.offer.upgrade", {
            url: "/upgrade",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/offer/upgrade/logs-upgrade.html",
                    controller: "LogsUpgradeCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/offer/upgrade"]
        });
});
