class LogsOptionsManageCtrl {
    constructor ($state, $stateParams, $window, CloudMessage, ControllerHelper, LogsOptionsService, LogsOptionsManageService, CurrencyService, OrderHelperService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$window = $window;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.LogsOptionsService = LogsOptionsService;
        this.LogsOptionsManageService = LogsOptionsManageService;
        this.CurrencyService = CurrencyService;
        this.OrderHelperService = OrderHelperService;

        this.serviceName = this.$stateParams.serviceName;
        this._initLoaders();
    }

    _initLoaders () {
        this.getManagedOptions = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOptionsService.getManagedOptions(this.serviceName)
        });

        this.getAllDashboards = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOptionsManageService.getAllDashboards(this.serviceName)
        });

        this.getAllStreams = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOptionsManageService.getAllStreams(this.serviceName)
        });

        this.getAllIndices = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOptionsManageService.getAllIndices(this.serviceName)
        });

        this.getAllAliases = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOptionsManageService.getAllAliases(this.serviceName)
        });

        this.getAllRoles = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOptionsManageService.getAllRoles(this.serviceName)
        });

        this.getAllInputs = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOptionsManageService.getAllInputs(this.serviceName)
        });

        this.getManagedOptions.load();
        this.getAllAliases.load();
        this.getAllDashboards.load();
        this.getAllIndices.load();
        this.getAllStreams.load();
        this.getAllRoles.load();
        this.getAllInputs.load();
    }

    terminateOption (option) {
        this.removeOption = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOptionsService.terminateOption(this.serviceName, option)
        });
    }

    overview (info) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/options/manage/overview/logs-options-overview.html",
                controller: "LogsOptionsManageOverviewCtrl",
                controllerAs: "ctrl",
                resolve: {
                    option: () => info,
                    aliases: () => this.getAllAliases.data,
                    dashboards: () => this.getAllDashboards.data,
                    indices: () => this.getAllIndices.data,
                    streams: () => this.getAllStreams.data,
                    roles: () => this.getAllRoles.data,
                    inputs: () => this.getAllInputs.data
                }
            }
        });
    }

    deactivate (option) {
        this.CloudMessage.flushChildMessage();
        this.LogsOptionsService.terminateModal(
            option
        ).then(() => {
            this.delete = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.LogsOptionsService.terminateOption(this.serviceName, option)
                    .then(() => this._initLoaders())
                    .finally(() => this.ControllerHelper.scrollPageToTop())
            });
            this.delete.load();
        });
    }

    reactivate (option) {
        this.LogsOptionsService.showReactivateInfo(option);
    }

    back () {
        this.$state.go("dbaas.logs.detail.options.home", {
            serviceName: this.serviceName
        });
    }
}

angular.module("managerApp").controller("LogsOptionsManageCtrl", LogsOptionsManageCtrl);
