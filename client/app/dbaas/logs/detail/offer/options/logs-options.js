angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.offer.options", {
            url: "/options",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/offer/options/logs-options.html",
                    controller: "LogsOptionsCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/options"]
        });
});
