class LogsDetailCtrl {
    constructor ($stateParams, CloudMessage) {
        this.$stateParams = $stateParams;
        this.CloudMessage = CloudMessage;
        this.messages = [];
    }

    $onInit () {
        this.CloudMessage.unSubscribe("dbaas.logs.detail");
        this.messageHandler = this.CloudMessage.subscribe("dbaas.logs.detail", { onMessage: () => this.refreshMessage() });
    }

    refreshMessage () {
        this.messages = this.messageHandler.getMessages();
    }
}

angular.module("managerApp").controller("LogsDetailCtrl", LogsDetailCtrl);
