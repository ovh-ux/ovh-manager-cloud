angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.inputs", {
            url: "/inputs",
            redirectTo: "dbaas.logs.detail.inputs.home",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/inputs/logs-inputs.html",
                    controller: "LogsInputsCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/inputs"]
        })
        .state("dbaas.logs.detail.inputs.home", {
            url: "/home",
            views: {
                logsInputs: {
                    templateUrl: "app/dbaas/logs/detail/inputs/home/logs-inputs-home.html",
                    controller: "LogsInputsHomeCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/inputs", "dbaas/logs/detail/inputs/home", "dbaas/logs/detail/inputs/home/info",
                "dbaas/logs/detail/options", "dbaas/logs/detail/options/upgradequotalink", "dbaas/logs/detail/options/addtool", "dbaas/logs/detail/options/addtool"]
        })
        .state("dbaas.logs.detail.inputs.console", {
            url: "/:inputId/console",
            views: {
                logsInputs: {
                    templateUrl: "app/dbaas/logs/detail/inputs/console/logs-inputs-console.html",
                    controller: "LogsInputsConsoleCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/inputs", "dbaas/logs/detail/inputs/console"]
        })
        .state("dbaas.logs.detail.inputs.addwizard", {
            url: "/input",
            redirectTo: "dbaas.logs.detail.inputs.addwizard.add",
            views: {
                logsInputs: {
                    templateUrl: "app/dbaas/logs/detail/inputs/add/logs-inputs-add.html",
                    controller: "LogsInputsAddCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/inputs", "dbaas/logs/detail/inputs/add"]
        })
        .state("dbaas.logs.detail.inputs.editwizard", {
            url: "/input/:inputId",
            redirectTo: "dbaas.logs.detail.inputs.editwizard.edit",
            views: {
                logsInputs: {
                    templateUrl: "app/dbaas/logs/detail/inputs/add/logs-inputs-add.html",
                    controller: "LogsInputsAddCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/inputs", "dbaas/logs/detail/inputs/add"]
        })
        .state("dbaas.logs.detail.inputs.addwizard.add", {
            url: "/add",
            views: {
                logsInputsAdd: {
                    templateUrl: "app/dbaas/logs/detail/inputs/add/edit/logs-inputs-add-edit.html",
                    controller: "LogsInputsAddEditCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/inputs", "dbaas/logs/detail/inputs/add", "dbaas/logs/detail/inputs/add/edit", "dbaas/logs/detail/options/"]
        })
        .state("dbaas.logs.detail.inputs.editwizard.edit", {
            url: "/details",
            views: {
                logsInputsAdd: {
                    templateUrl: "app/dbaas/logs/detail/inputs/add/edit/logs-inputs-add-edit.html",
                    controller: "LogsInputsAddEditCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/inputs", "dbaas/logs/detail/inputs/add", "dbaas/logs/detail/inputs/add/edit", "dbaas/logs/detail/options/"]
        })
        .state("dbaas.logs.detail.inputs.editwizard.configure", {
            url: "/configure",
            views: {
                logsInputsAdd: {
                    templateUrl: "app/dbaas/logs/detail/inputs/add/configure/logs-inputs-add-configure.html",
                    controller: "LogsInputsAddConfigureCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/inputs", "dbaas/logs/detail/inputs/add", "dbaas/logs/detail/inputs/add/configure"]
        })
        .state("dbaas.logs.detail.inputs.editwizard.networks", {
            url: "/networks",
            views: {
                logsInputsAdd: {
                    templateUrl: "app/dbaas/logs/detail/inputs/add/networks/logs-inputs-add-networks.html",
                    controller: "LogsInputsAddNetworksCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/inputs", "dbaas/logs/detail/inputs/add", "dbaas/logs/detail/inputs/add/networks"]
        });
});
