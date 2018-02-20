class LogsInputsConsoleCtrl {
    constructor ($stateParams, ControllerHelper, LogsInputsService, OvhTailLogs) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.inputId = this.$stateParams.inputId;
        this.ControllerHelper = ControllerHelper;
        this.LogsInputsService = LogsInputsService;
        this.OvhTailLogs = OvhTailLogs;
        this._initLoaders();
    }

    $onInit () {
        this.input.load();
        this.logger = new this.OvhTailLogs({
            source: () => this.inputLogUrl.load().then(urlInfo => urlInfo.data.url),
            delay: 10000
        });
        this.logger.log();
    }

    /**
     * initializes the input log url
     *
     * @memberof LogsInputsConsoleCtrl
     */
    _initLoaders () {
        this.inputLogUrl = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsInputsService.getInputLogUrl(this.serviceName, this.inputId)
        });
        this.input = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsInputsService.getInput(this.serviceName, this.inputId)
        });
    }
}

angular.module("managerApp").controller("LogsInputsConsoleCtrl", LogsInputsConsoleCtrl);
