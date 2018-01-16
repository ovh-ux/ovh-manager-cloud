class LogsOptionsCtrl {
    constructor ($stateParams, CloudMessage, ControllerHelper, LogsOptionsService) {
        this.$stateParams = $stateParams;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
        this.LogsOptionsService = LogsOptionsService;

        this.serviceName = this.$stateParams.serviceName;
        this.messages = {};
        this._initLoaders();
    }

    $onInit () {
        this._loadMessages();
        this.options.load();
    }

    refreshMessage () {
        this.messages = this.messageHandler.getMessages();
    }

    _initLoaders () {
        this.options = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOptionsService.getOptions(this.serviceName)
        });
    }

    _loadMessages () {
        const stateName = "dbaas.logs.detail.offer";
        this.CloudMessage.unSubscribe(stateName);
        this.messageHandler = this.CloudMessage.subscribe(stateName, {
            onMessage: () => this.refreshMessage()
        });
    }
}

angular.module("managerApp").controller("LogsOptionsCtrl", LogsOptionsCtrl);
