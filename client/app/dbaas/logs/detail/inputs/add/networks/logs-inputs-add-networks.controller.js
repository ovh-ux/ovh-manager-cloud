class LogsInputsAddNetworksCtrl {
    constructor ($stateParams, ControllerHelper, LogsInputsService, CloudMessage) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.inputId = this.$stateParams.inputId;
        this.ControllerHelper = ControllerHelper;
        this.LogsInputsService = LogsInputsService;
        this.CloudMessage = CloudMessage;
        this.editMode = Boolean(this.inputId);
    }

    $onInit () {
        this.input = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsInputsService.getInput(this.serviceName, this.inputId)
        });
        this.input.load();
    }

    addNetwork () {
        this.CloudMessage.flushChildMessage();
        this.addNetwork = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsInputsService.addNetwork(this.serviceName, this.input.data, this.ipAddress)
                .then(() => this.input.load())
        });
        this.addNetwork.load();
    }

    removeNetwork (network) {
        this.CloudMessage.flushChildMessage();
        this.removeNetwork = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsInputsService.removeNetwork(this.serviceName, this.input.data, network)
                .then(() => this.input.load())
        });
        this.removeNetwork.load();
    }
}

angular.module("managerApp").controller("LogsInputsAddNetworksCtrl", LogsInputsAddNetworksCtrl);
