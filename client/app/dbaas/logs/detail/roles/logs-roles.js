angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.roles", {
            url: "/roles",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/roles/logs-roles.html",
                    controller: "LogsRolesCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "logs", "logs/roles"]
        });
});
