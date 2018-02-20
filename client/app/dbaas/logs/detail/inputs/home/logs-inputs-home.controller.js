class LogsInputsHomeCtrl {
    constructor ($state, $stateParams, $translate, CloudMessage, ControllerHelper, LogsInputsConstant, LogsInputsService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.LogsInputsConstant = LogsInputsConstant;
        this.LogsInputsService = LogsInputsService;
        this._initLoaders();
    }

    $onInit () {
        this._runLoaders();
    }

    /**
     * Runs all the loaders to fetch data from APIs
     *
     * @memberof LogsInputsCtrl
     */
    _runLoaders () {
        this.inputs.load();
        this.quota.load();
    }

    /**
     * initializes the inputsIDs and current stream
     *
     * @memberof LogsInputsCtrl
     */
    _initLoaders () {
        this.inputs = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsInputsService.getInputs(this.serviceName)
        });
        this.quota = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsInputsService.getQuota(this.serviceName)
        });
    }

    /**
     * Shows the confirmation modal box for input deletion confirmation
     * and deletes the input if the user confirms the deletion
     *
     * @param {any} input - the input object
     * @memberof LogsInputsCtrl
     */
    showDeleteConfirm (input) {
        this.CloudMessage.flushChildMessage();
        return this.ControllerHelper.modal.showDeleteModal({
            titleText: this.$translate.instant("inputs_delete"),
            text: this.$translate.instant("inputs_delete_message", { input: input.info.title })
        }).then(() => this._delete(input));
    }

    /**
     * Deletes the input
     *
     * @param {any} input - the input object
     * @memberof LogsInputsCtrl
     */
    _delete (input) {
        this.delete = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsInputsService.deleteInput(this.serviceName, input.info.inputId)
        });
        this.delete.load().then(this._runLoaders());
    }

    /**
     * Redirects to the new input add page
     *
     * @param {any} type - the type of the input to add
     * @memberof LogsInputsCtrl
     */
    addInput (type) {
        this.$state.go("dbaas.logs.detail.streams.inputs.add", {
            serviceName: this.serviceName,
            streamId: this.streamId,
            type: this.LogsStreamsInputsConstant.inputType[type]
        });
    }

    startInput (input) {
        this.processInput = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsInputsService.startInput(this.serviceName, input.info.inputId)
        });
        this.processInput.load().then(() => {
            debugger;
            console.log("Start over!!!");
            this._runLoaders();
        }, err => {
            console.log("Error occurred in start", err);
        });
    }

    restartInput (input) {
        this.processInput = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsInputsService.restartInput(this.serviceName, input.info.inputId)
        });
        this.processInput.load().then(this._runLoaders());
    }

    stopInput (input) {
        this.processInput = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsInputsService.stopInput(this.serviceName, input.info.inputId)
        });
        this.processInput.load().then(() => {
            debugger;
            console.log("Stop over!!!");
            this._runLoaders();
        }, err => {
            console.log("Error occurred in stop", err);
        });
    }

    info (input) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/inputs/home/info/logs-inputs-home-info.html",
                controller: "LogsInputsHomeInfoModalCtrl",
                controllerAs: "ctrl",
                resolve: {
                    currentInput: () => input
                }
            }
        });
    }

    /**
     * navigates to the standard output page
     *
     * @param {any} input
     * @memberof LogsInputsCtrl
     */
    standardOutput (input) {
        this.CloudMessage.flushChildMessage();
        this.$state.go("dbaas.logs.detail.inputs.console", {
            serviceName: this.serviceName,
            inputId: input.info.inputId
        });
    }
}

angular.module("managerApp").controller("LogsInputsHomeCtrl", LogsInputsHomeCtrl);
