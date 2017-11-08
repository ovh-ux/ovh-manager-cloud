class VpsDetailCtrl {
    constructor ($filter, $scope, $stateParams, CloudMessage) {
        this.$filter = $filter;
        this.$stateParams = $stateParams;
        this.CloudMessage = CloudMessage;
        this.serviceName = $stateParams.serviceName;

        this.messages = [];
    }

    $onInit () {
        this.loadMessage();
    }

    loadMessage () {
        this.CloudMessage.unSubscribe("iaas.vps.detail");
        this.messageHandler = this.CloudMessage.subscribe("iaas.vps.detail", { onMessage: () => this.refreshMessage() });
    }

    refreshMessage () {
        this.messages = this.messageHandler.getMessages();
    }

}

angular.module("managerApp").controller("VpsDetailCtrl", VpsDetailCtrl);
