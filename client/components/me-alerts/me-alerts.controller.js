class MeAlertsCtrl {
    constructor (CloudMessage, MeAlertsService) {
        this.CloudMessage = CloudMessage;
        this.MeAlertsService = MeAlertsService;
        this.messages = [];
    }

    $onInit () {
        this.loadMessage();
        this.MeAlertsService.getMessages();
    }


    loadMessage () {
        this.CloudMessage.unSubscribe("index");
        this.messageHandler = this.CloudMessage.subscribe("index", { onMessage: () => this.refreshMessage() });
    }

    refreshMessage () {
        this.messages = this.messageHandler.getMessages();
    }
}

angular.module("managerApp").controller("MeAlertsCtrl", MeAlertsCtrl);
