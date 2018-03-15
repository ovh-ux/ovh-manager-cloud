angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.home", {
            url: "/home",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/home/logs-home.html",
                    controller: "LogsHomeCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/home"]
        })
        .state("dbaas.logs.detail.home.password", {
            url: "/password",
            views: {
                passwordModal: {
                    controller: "LogsAccountPasswordModalCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/home"]
        });
});
