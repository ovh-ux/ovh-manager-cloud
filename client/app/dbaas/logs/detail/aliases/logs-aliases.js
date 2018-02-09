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
            translations: ["common", "dbaas/logs", "dbaas/logs/aliases", "dbaas/logs/detail/options"]
        })
        .state("dbaas.logs.detail.aliases.add", {
            url: "/add",
            views: {
                logsAliases: {
                    controller: "LogsAliasesAddModalCtrl",
                    controllerAs: "ctrl"
                }
            }
        })
        .state("dbaas.logs.detail.aliases.edit", {
            url: "/:aliasId",
            views: {
                logsAliases: {
                    controller: "LogsAliasesAddModalCtrl",
                    controllerAs: "ctrl"
                }
            }
        })
        .state("dbaas.logs.detail.aliases.link", {
            url: "/:aliasId/link",
            views: {
                logsAliases: {
                    templateUrl: "app/dbaas/logs/detail/aliases/link/aliases-link.html",
                    controller: "LogsAliasesLinkCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/aliases/link"]
        });
});
