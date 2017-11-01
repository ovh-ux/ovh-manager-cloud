class VpsDetailCtrl {
    constructor ($filter, $q, $scope, $stateParams, CloudMessage, VpsService) {
        this.$filter = $filter;
        this.$q = $q;
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.CloudMessage = CloudMessage;
        this.serviceName = $stateParams.serviceName;
        this.VpsService = VpsService;

        this.vps = {};

        this.messages = [];
    }

    $onInit () {
        this.loadMessage();
        this.$scope.$on("changeDescription", (event, data) => {
            this.vps.description = data;
        });
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