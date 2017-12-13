angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.streams", {
            url: "/streams",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/streams/logs-streams.html",
                    controller: "LogsStreamsCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "logs", "logs/streams"]
        });
});
