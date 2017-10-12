(() => {
    class CloudProjectBillingCtrl {
        constructor (CloudMessage, $stateParams) {
            this.CloudMessage = CloudMessage;
            this.serviceName = $stateParams.projectId;

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
