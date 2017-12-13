angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.inputs", {
            url: "/inputs",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/inputs/logs-inputs.html",
                    controller: "LogsInputsCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "logs", "logs/inputs"]
        });
});
