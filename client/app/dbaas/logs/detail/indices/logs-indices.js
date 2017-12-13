angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.indices", {
            url: "/indices",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/indices/logs-indices.html",
                    controller: "LogsIndicesCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "logs", "logs/indices"]
        });
});
