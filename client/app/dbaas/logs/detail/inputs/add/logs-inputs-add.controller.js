class LogsInputsAddCtrl {
    constructor ($state, $stateParams, ControllerHelper, LogsInputsService) {
        this.$state = $state;
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
     * @memberof LogsInputsAddCtrl
     */
    _initLoaders () {
        if (this.editMode) {
            this.input = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.LogsInputsService.getInput(this.serviceName, this.inputId)
            });
        }
    }

    gotoInputsHome () {
        this.$state.go("dbaas.logs.detail.inputs");
    }
}

angular.module("managerApp").controller("LogsInputsAddCtrl", LogsInputsAddCtrl);
