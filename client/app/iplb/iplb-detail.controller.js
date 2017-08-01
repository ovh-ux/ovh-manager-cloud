class IpLoadBalancerDetailCtrl {
    constructor (CloudMessage) {
        this.CloudMessage = CloudMessage;
        this.messages = [];
    }

    $onInit () {
        this.CloudMessage.unSubscribe("network.iplb.detail");
        this.messageHandler = this.CloudMessage.subscribe("network.iplb.detail", { onMessage: () => this.refreshMessage() });
    }

    refreshMessage () {
        this.messages = this.messageHandler.getMessages();
    }
}

angular.module("managerApp").controller("IpLoadBalancerDetailCtrl", IpLoadBalancerDetailCtrl);
