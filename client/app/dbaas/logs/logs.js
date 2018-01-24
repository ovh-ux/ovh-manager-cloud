angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs", {
            url: "/logs",
            views: {
                dbaasContainer: {
                    templateUrl: "app/dbaas/logs/logs.html"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/streams"]
        });
});
