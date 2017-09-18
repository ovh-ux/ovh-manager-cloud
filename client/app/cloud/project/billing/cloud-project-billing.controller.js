(() => {
    class CloudProjectBillingCtrl {
        constructor (CloudMessage) {
            this.CloudMessage = CloudMessage;

            this.messages = [];
        }

        $onInit () {
            this.loadMessage();
        }

        loadMessage () {
            this.CloudMessage.unSubscribe("iaas.pci-project.billing");
            this.messageHandler = this.CloudMessage.subscribe("iaas.pci-project.billing", { onMessage: () => this.refreshMessage() });

        }

        refreshMessage () {
            this.messages = this.messageHandler.getMessages();
        }
    }

    angular.module("managerApp").controller("CloudProjectBillingCtrl", CloudProjectBillingCtrl);
})();
