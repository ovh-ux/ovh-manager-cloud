class LogsListCtrl {
    constructor (CloudMessage) {
        this.CloudMessage = CloudMessage;
        this.messages = [];
    }

    $onInit () {
        this.CloudMessage.unSubscribe("dbaas.logs.list");
        this.messageHandler = this.CloudMessage.subscribe("dbaas.logs.list", { onMessage: () => this.refreshMessage() });
    }

    refreshMessage () {
        this.messages = this.messageHandler.getMessages();
    }
}

angular.module("managerApp").controller("LogsListCtrl", LogsListCtrl);
