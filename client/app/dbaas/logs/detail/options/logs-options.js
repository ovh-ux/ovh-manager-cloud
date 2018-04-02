angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.options", {
            url: "/options",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/options/logs-options.html",
                    controller: "LogsOptionsCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/options", "dbaas/logs/detail/offer"]
        });
});
