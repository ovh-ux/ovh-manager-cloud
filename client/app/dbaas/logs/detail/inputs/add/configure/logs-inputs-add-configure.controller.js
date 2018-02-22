class LogsInputsAddConfigureCtrl {
    constructor ($stateParams, ControllerHelper, LogsInputsService) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.inputId = this.$stateParams.inputId;
        this.ControllerHelper = ControllerHelper;
        this.LogsInputsService = LogsInputsService;
        this.editMode = Boolean(this.inputId);
        this._initLoaders();
    }

    $onInit () {
        if (this.editMode) {
            this.input.load();
        } else {
            this.input = this.LogsInputsService.getNewInput();
        }
    }

    /**
     * initializes the input log url
     *
     * @memberof LogsInputsAddConfigureCtrl
     */
    _initLoaders () {
        if (this.editMode) {
            this.input = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.LogsInputsService.getInput(this.serviceName, this.inputId)
            });
        }
    }
}

angular.module("managerApp").controller("LogsInputsAddConfigureCtrl", LogsInputsAddConfigureCtrl);
