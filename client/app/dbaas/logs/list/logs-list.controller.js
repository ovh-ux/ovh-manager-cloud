class LogsListCtrl {
    constructor (CloudMessage, LogsListService, ControllerHelper, LogsConstants) {
        this.CloudMessage = CloudMessage;
        this.LogsListService = LogsListService;
        this.ControllerHelper = ControllerHelper;
        this.LogsConstants = LogsConstants;
        this.messages = [];

        this.initLoaders();
    }

    $onInit () {
        this.CloudMessage.unSubscribe("dbaas.logs.list");
        this.messageHandler = this.CloudMessage.subscribe("dbaas.logs.list", { onMessage: () => this.refreshMessage() });
    }

    refreshMessage () {
        this.messages = this.messageHandler.getMessages();
    }

    /**
     * load tokens array by making API call to get data
     *
     * @memberof LogsTokensCtrl
     */
    initLoaders () {
        this.accounts = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsListService.getServices()
        });
        this.accounts.load();
    }
}

angular.module("managerApp").controller("LogsListCtrl", LogsListCtrl);
