angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.aliases", {
            url: "/aliases",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/aliases/logs-aliases.html",
                    controller: "LogsAliasesCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/aliases"]
        });
});
