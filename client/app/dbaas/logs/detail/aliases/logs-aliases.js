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
        })
        .state("dbaas.logs.detail.aliases.detail", {
            url: "/:aliasId",
            redirectTo: "dbaas.logs.detail.aliases.detail.link",
            views: {
                logsAliases: {
                    template: `<div ui-view="logsAliasesDetail"></div>`
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/aliases"]
        })
        .state("dbaas.logs.detail.aliases.detail.link", {
            url: "/link",
            views: {
                logsAliasesDetail: {
                    templateUrl: "app/dbaas/logs/detail/aliases/link/aliases-link.html",
                    controller: "LogsAliasesLinkCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/aliases/link"]
        });
});
