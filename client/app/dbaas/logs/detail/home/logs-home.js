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
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/home", "dbaas/logs/detail/home/formatsports", "dbaas/logs/detail/home/account", "dbaas/logs/detail/offer", "dbaas/logs/detail/options"]
        })
        .state("dbaas.logs.detail.home.account", {
            url: "/account",
            views: {
                logsAccountContent: {
                    controller: "LogsHomeAccountModalCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/home", "dbaas/logs/detail/home/account"]
        });
});
