angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.tokens", {
            url: "/tokens",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/tokens/logs-tokens.html",
                    controller: "LogsTokensCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/tokens"]
        });
});
