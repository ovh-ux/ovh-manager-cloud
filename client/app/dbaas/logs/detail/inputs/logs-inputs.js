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
            translations: ["common", "dbaas/logs", "dbaas/logs/inputs"]
        })
        .state("dbaas.logs.detail.inputs.detail", {
            url: "/:inputId",
            views: {
                logsInputs: {
                    template: `<div ui-view="logsInputsDetail"></div>`
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/inputs/add"]
        }).state("dbaas.logs.detail.inputs.detail.console", {
            url: "/console",
            views: {
                logsInputsDetail: {
                    templateUrl: "app/dbaas/logs/detail/inputs/console/logs-inputs-console.html",
                    controller: "LogsInputsConsoleCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/inputs/console"]
        }).state("dbaas.logs.detail.inputs.add", {
            url: "/add",
            views: {
                logsInputs: {
                    templateUrl: "app/dbaas/logs/detail/inputs/add/logs-inputs-add.html",
                    controller: "LogsInputsAddCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/inputs/add"]
        });
});
