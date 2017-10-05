class IpLoadBalancerDetailCtrl {
    constructor ($stateParams, CloudMessage, IpLoadBalancerConfigurationService) {
        this.$stateParams = $stateParams;
        this.CloudMessage = CloudMessage;
        this.IpLoadBalancerConfigurationService = IpLoadBalancerConfigurationService;
        this.messages = [];
    }

    $onInit () {
        this.CloudMessage.unSubscribe("network.iplb.detail");
        this.messageHandler = this.CloudMessage.subscribe("network.iplb.detail", { onMessage: () => this.refreshMessage() });
        this.checkPendingChanges();
    }

    refreshMessage () {
        this.messages = this.messageHandler.getMessages();
    }

    checkPendingChanges () {
        this.IpLoadBalancerConfigurationService.getPendingChanges(
            this.$stateParams.serviceName
        )
            .then(changes => _.chain(changes).map("number").sum().value() > 0)
            .then(hasChanges => {
                if (hasChanges) {
                    this.IpLoadBalancerConfigurationService.showRefreshWarning();
                }
            });
    }
}

angular.module("managerApp").controller("IpLoadBalancerDetailCtrl", IpLoadBalancerDetailCtrl);
