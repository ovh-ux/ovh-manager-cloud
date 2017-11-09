class AlertsCtrl {
    constructor (CloudMessage, MeAlertsService, OvhTaskAlertsService) {
        this.CloudMessage = CloudMessage;
        this.MeAlertsService = MeAlertsService;
        this.OvhTaskAlertsService = OvhTaskAlertsService;
        this.messages = [];
    }

    $onInit () {
        this.loadMessage();
        this.MeAlertsService.getMessages();
        this.OvhTaskAlertsService.getOvhTaskAlerts();
    }


    loadMessage () {
        this.CloudMessage.unSubscribe("index");
        this.messageHandler = this.CloudMessage.subscribe("index", { onMessage: () => this.refreshMessage() });
    }

    refreshMessage () {
        this.messages = this.messageHandler.getMessages();
    }
}

angular.module("managerApp").controller("AlertsCtrl", AlertsCtrl);
