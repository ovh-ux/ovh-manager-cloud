class VpsDetailCtrl {
    constructor ($filter, $q, $scope, $stateParams, $translate, CloudMessage, VpsService) {
        this.$filter = $filter;
        this.$q = $q;
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.serviceName = $stateParams.serviceName;
        this.VpsService = VpsService;

        this.loaders = {
            init: false
        };
        this.messages = [];
    }

    $onInit () {
        this.loaders.init = true;
        this.loadMessage();
        this.VpsService.getSelected(true)
            .then(vps => { this.description = vps.displayName })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_dashboard_loading_error")))
            .finally(() => { this.loaders.init = false });
        this.$scope.$on("changeDescription", (event, data) => {
            this.description = data;
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